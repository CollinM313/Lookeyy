"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractYouTubeId } from "@/lib/youtube";

export async function updateListingVideoUrl(listingId: string, rawUrl: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authenticated" };

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { agentId: true },
  });

  if (!listing) return { error: "Listing not found" };

  const isOwner = listing.agentId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  const isApprovedGuest = !isOwner && !isAdmin && await prisma.videoTourRequest.findFirst({
    where: { listingId, requestingAgentId: session.user.id, status: "APPROVED" },
    select: { id: true },
  }).then(Boolean);

  if (!isOwner && !isAdmin && !isApprovedGuest) {
    return { error: "Not authorized — request permission from the listing agent first." };
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    await prisma.listing.update({ where: { id: listingId }, data: { videoUrl: null } });
    revalidatePath("/dashboard/agent/listings");
    revalidatePath("/");
    revalidatePath("/listings");
    return { success: true, videoId: null };
  }

  const videoId = extractYouTubeId(trimmed);
  if (!videoId) return { error: "Couldn't find a YouTube video ID in that URL. Make sure it's a valid YouTube link." };

  await prisma.listing.update({ where: { id: listingId }, data: { videoUrl: trimmed } });
  revalidatePath("/dashboard/agent/listings");
  revalidatePath("/");
  revalidatePath("/listings");
  return { success: true, videoId };
}
