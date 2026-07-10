"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { suggestAgentForBooking } from "@/lib/smart-match";
import { sendNotification, emailTemplates } from "@/lib/email";
import { CANCELLATION_WINDOW_HOURS } from "@/lib/constants";
import { format } from "date-fns";

const createBookingSchema = z.object({
  listingId: z.string(),
  tourType: z.enum(["RECORDED", "LIVE"]),
  scheduledAt: z.string(), // ISO string
  contactName: z.string().min(2),
  contactPhone: z.string().min(7),
  contactEmail: z.string().email(),
  specialRequests: z.string().optional(),
});

export async function createBooking(input: z.infer<typeof createBookingSchema>) {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fill out the form correctly." };

  const session = await auth();
  if (!session?.user) return { error: "You must be signed in to request a tour." };

  const listing = await prisma.listing.findUnique({ where: { id: parsed.data.listingId } });
  if (!listing) return { error: "Listing not found." };

  const scheduledAt = new Date(parsed.data.scheduledAt);

  const booking = await prisma.booking.create({
    data: {
      listingId: listing.id,
      clientId: session.user.id,
      tourType: parsed.data.tourType,
      scheduledAt,
      contactName: parsed.data.contactName,
      contactPhone: parsed.data.contactPhone,
      contactEmail: parsed.data.contactEmail,
      specialRequests: parsed.data.specialRequests,
      status: "REQUESTED",
    },
  });

  await sendNotification({
    userId: session.user.id,
    to: parsed.data.contactEmail,
    type: "BOOKING_REQUESTED",
    subject: "Tour request received",
    html: emailTemplates.bookingRequested(parsed.data.contactName, listing.title),
  });

  // Run smart matching and move to admin approval queue.
  const candidates = await suggestAgentForBooking({
    listingLat: listing.lat ?? 0,
    listingLng: listing.lng ?? 0,
    scheduledAt,
  });
  const top = candidates[0];

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: {
      status: "PENDING_ADMIN_APPROVAL",
      suggestedAgentId: top?.agentId ?? null,
      matchRationale: top ? JSON.parse(JSON.stringify(candidates.slice(0, 3))) : undefined,
    },
  });

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  for (const admin of admins) {
    await sendNotification({
      userId: admin.id,
      to: admin.email,
      type: "BOOKING_PENDING_APPROVAL",
      subject: "New booking awaiting approval",
      html: emailTemplates.bookingPendingApproval(listing.title, top?.agentName ?? "No match found"),
    });
  }

  revalidatePath("/dashboard/admin/bookings/queue");
  return { success: true, bookingId: updated.id };
}

export async function approveBookingMatch(bookingId: string, agentProfileId: string) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return { error: "Not authorized." };

  const agentProfile = await prisma.agentProfile.findUnique({
    where: { id: agentProfileId },
    include: { user: true },
  });
  if (!agentProfile) return { error: "Agent not found." };

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CONFIRMED", agentId: agentProfile.userId },
    include: { listing: true, client: true },
  });

  const when = format(booking.scheduledAt, "EEEE, MMM d 'at' h:mm a");

  await sendNotification({
    userId: booking.clientId,
    to: booking.contactEmail,
    type: "BOOKING_CONFIRMED",
    subject: "Your tour is confirmed!",
    html: emailTemplates.bookingConfirmed(booking.contactName, booking.listing.title, agentProfile.user.name ?? "your agent", when),
  });

  await sendNotification({
    userId: agentProfile.userId,
    to: agentProfile.user.email,
    type: "AGENT_ASSIGNED",
    subject: "New tour assigned",
    html: emailTemplates.agentAssigned(agentProfile.user.name ?? "there", booking.listing.title, when),
  });

  revalidatePath("/dashboard/admin/bookings/queue");
  revalidatePath("/dashboard/agent");
  revalidatePath("/dashboard/client");
  return { success: true };
}

export async function rejectBookingMatch(bookingId: string, reason?: string) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return { error: "Not authorized." };

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED", cancelledAt: new Date(), cancelReason: reason ?? "No suitable agent match" },
    include: { listing: true },
  });

  await sendNotification({
    userId: booking.clientId,
    to: booking.contactEmail,
    type: "BOOKING_CANCELLED",
    subject: "Tour request update",
    html: emailTemplates.bookingCancelled(booking.contactName, booking.listing.title),
  });

  revalidatePath("/dashboard/admin/bookings/queue");
  return { success: true };
}

export async function cancelBooking(bookingId: string, reason?: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { listing: true } });
  if (!booking) return { error: "Booking not found." };

  const isOwner = booking.clientId === session.user.id || booking.agentId === session.user.id;
  if (!isOwner && session.user.role !== "ADMIN") return { error: "Not authorized." };

  const hoursUntil = (booking.scheduledAt.getTime() - Date.now()) / 36e5;
  if (hoursUntil < CANCELLATION_WINDOW_HOURS && session.user.role !== "ADMIN") {
    return { error: `Cancellations require at least ${CANCELLATION_WINDOW_HOURS}h notice.` };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED", cancelledAt: new Date(), cancelReason: reason },
  });

  await sendNotification({
    userId: booking.clientId,
    to: booking.contactEmail,
    type: "BOOKING_CANCELLED",
    subject: "Tour cancelled",
    html: emailTemplates.bookingCancelled(booking.contactName, booking.listing.title),
  });

  revalidatePath("/dashboard/client");
  revalidatePath("/dashboard/agent");
  revalidatePath("/dashboard/admin/bookings");
  return { success: true };
}

export async function rescheduleBooking(bookingId: string, scheduledAt: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { error: "Booking not found." };
  if (booking.clientId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "Not authorized." };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { scheduledAt: new Date(scheduledAt) },
  });

  revalidatePath("/dashboard/client");
  revalidatePath("/dashboard/agent");
  return { success: true };
}

export async function reassignBooking(bookingId: string, newAgentUserId: string) {
  const session = await auth();
  if (session?.user.role !== "ADMIN") return { error: "Not authorized." };

  await prisma.booking.update({ where: { id: bookingId }, data: { agentId: newAgentUserId } });
  revalidatePath("/dashboard/admin/bookings");
  return { success: true };
}

export async function updateBookingStatus(
  bookingId: string,
  status: "IN_PROGRESS" | "COMPLETED" | "NO_SHOW"
) {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const booking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: { listing: true },
  });

  if (status === "COMPLETED") {
    if (booking.agentId) {
      await prisma.agentProfile.update({
        where: { userId: booking.agentId },
        data: { tourCount: { increment: 1 } },
      });
    }
    await sendNotification({
      userId: booking.clientId,
      to: booking.contactEmail,
      type: "REVIEW_REQUEST",
      subject: "How was your tour?",
      html: emailTemplates.tourCompletedReviewRequest(booking.contactName, booking.listing.title),
    });
  }

  revalidatePath("/dashboard/agent");
  revalidatePath("/dashboard/client");
  revalidatePath("/dashboard/admin/bookings");
  return { success: true };
}
