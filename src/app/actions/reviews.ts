"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const reviewSchema = z.object({
  bookingId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export async function submitReview(input: z.infer<typeof reviewSchema>) {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) return { error: "Please provide a valid rating." };

  const booking = await prisma.booking.findUnique({ where: { id: parsed.data.bookingId } });
  if (!booking || booking.clientId !== session.user.id) return { error: "Booking not found." };
  if (booking.status !== "COMPLETED") return { error: "You can only review completed tours." };
  if (!booking.agentId) return { error: "No agent on this booking." };

  const agentProfile = await prisma.agentProfile.findUnique({ where: { userId: booking.agentId } });
  if (!agentProfile) return { error: "Agent not found." };

  await prisma.review.create({
    data: {
      bookingId: booking.id,
      clientId: session.user.id,
      agentId: agentProfile.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  const newCount = agentProfile.ratingCount + 1;
  const newAvg = (agentProfile.ratingAvg * agentProfile.ratingCount + parsed.data.rating) / newCount;

  await prisma.agentProfile.update({
    where: { id: agentProfile.id },
    data: { ratingAvg: newAvg, ratingCount: newCount },
  });

  revalidatePath("/dashboard/client");
  return { success: true };
}
