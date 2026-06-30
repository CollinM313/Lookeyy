"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
  bio: z.string().optional(),
  brokerage: z.string().optional(),
  coverageArea: z.string().optional(),
});

export async function updateProfile(input: z.infer<typeof profileSchema>) {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fill out the form correctly." };

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone },
  });

  if (session.user.role === "AGENT") {
    await prisma.agentProfile.update({
      where: { userId: session.user.id },
      data: {
        bio: parsed.data.bio,
        brokerage: parsed.data.brokerage,
        coverageArea: parsed.data.coverageArea,
      },
    });
  }

  revalidatePath("/dashboard/agent/profile");
  revalidatePath("/dashboard/client/profile");
  return { success: true };
}

export async function toggleFavorite(listingId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const existing = await prisma.favorite.findUnique({
    where: { userId_listingId: { userId: session.user.id, listingId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
  } else {
    await prisma.favorite.create({ data: { userId: session.user.id, listingId } });
  }

  revalidatePath("/dashboard/client/favorites");
  revalidatePath(`/listings/${listingId}`);
  return { success: true, favorited: !existing };
}
