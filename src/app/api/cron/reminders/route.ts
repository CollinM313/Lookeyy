import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotification, emailTemplates } from "@/lib/email";
import { format } from "date-fns";

/**
 * Sends a reminder email for bookings starting in ~1 hour.
 * Intended to be invoked by a scheduled job (e.g. Vercel Cron) hitting this
 * route hourly with the CRON_SECRET as a bearer token. See README for setup.
 */
export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const windowStart = new Date(Date.now() + 55 * 60 * 1000);
  const windowEnd = new Date(Date.now() + 65 * 60 * 1000);

  const bookings = await prisma.booking.findMany({
    where: { status: "CONFIRMED", scheduledAt: { gte: windowStart, lte: windowEnd } },
    include: { listing: true, agent: true },
  });

  for (const booking of bookings) {
    const when = format(booking.scheduledAt, "h:mm a");
    await sendNotification({
      userId: booking.clientId,
      to: booking.contactEmail,
      type: "TOUR_REMINDER",
      subject: "Reminder: your tour starts in 1 hour",
      html: emailTemplates.tourReminder(booking.contactName, booking.listing.title, when),
    });
    if (booking.agentId && booking.agent) {
      await sendNotification({
        userId: booking.agentId,
        to: booking.agent.email,
        type: "TOUR_REMINDER",
        subject: "Reminder: your tour starts in 1 hour",
        html: emailTemplates.tourReminder(booking.agent.name ?? "there", booking.listing.title, when),
      });
    }
  }

  return NextResponse.json({ remindersSent: bookings.length });
}
