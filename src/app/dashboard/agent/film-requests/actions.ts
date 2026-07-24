"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function requestToFilm(listingId: string, message: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "AGENT") return { error: "Not authorized" };

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { agentId: true, title: true },
  });
  if (!listing) return { error: "Listing not found" };
  if (listing.agentId === session.user.id) return { error: "You already own this listing" };

  await prisma.videoTourRequest.upsert({
    where: { listingId_requestingAgentId: { listingId, requestingAgentId: session.user.id } },
    update: { message, status: "PENDING" },
    create: {
      listingId,
      requestingAgentId: session.user.id,
      ownerAgentId: listing.agentId ?? null,
      message,
    },
  });

  revalidatePath("/dashboard/agent/film-requests");
  revalidatePath("/dashboard/agent/listings");
  return { success: true };
}

export async function reviewFilmRequest(requestId: string, action: "APPROVED" | "REJECTED") {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized" };

  const req = await prisma.videoTourRequest.findUnique({
    where: { id: requestId },
    select: { ownerAgentId: true, listingId: true },
  });
  if (!req) return { error: "Request not found" };

  const isOwner = req.ownerAgentId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) return { error: "Not authorized" };

  await prisma.videoTourRequest.update({
    where: { id: requestId },
    data: { status: action },
  });

  revalidatePath("/dashboard/agent/listings");
  revalidatePath("/dashboard/agent/film-requests");
  revalidatePath("/dashboard/admin");
  return { success: true };
}
