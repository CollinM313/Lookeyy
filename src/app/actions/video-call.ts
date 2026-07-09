"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createDailyRoom, createDailyMeetingToken, isDailyConfigured } from "@/lib/daily";

export async function getOrCreateCallRoom(bookingId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { error: "Booking not found." };
  if (booking.clientId !== session.user.id && booking.agentId !== session.user.id) {
    return { error: "Not authorized." };
  }
  if (!isDailyConfigured()) {
    return { configured: false as const };
  }

  let roomUrl = booking.dailyRoomUrl;
  if (!roomUrl) {
    roomUrl = await createDailyRoom(booking.id);
    if (roomUrl) {
      await prisma.booking.update({ where: { id: bookingId }, data: { dailyRoomUrl: roomUrl } });
    }
  }
  if (!roomUrl) return { error: "Could not create the video room. Try again shortly." };

  const roomName = roomUrl.split("/").pop() ?? "";
  const token = await createDailyMeetingToken(roomName, session.user.name ?? "Guest");

  return { configured: true as const, roomUrl, token };
}

export async function setFallbackPhone(bookingId: string, phone: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  await prisma.booking.update({ where: { id: bookingId }, data: { fallbackPhone: phone } });
  return { success: true };
}

export async function setZoomLink(bookingId: string, zoomLink: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) return { error: "Booking not found." };
  if (booking.agentId !== session.user.id) return { error: "Only the assigned agent can set the meeting link." };

  await prisma.booking.update({ where: { id: bookingId }, data: { dailyRoomUrl: zoomLink } });
  return { success: true };
}
