"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

const listingSchema = z.object({
  title: z.string().min(2),
  address: z.string().min(2),
  city: z.string().min(2),
  state: z.string().min(2),
  zip: z.string().min(3),
  price: z.coerce.number().positive(),
  beds: z.coerce.number().min(0),
  baths: z.coerce.number().min(0),
  sqft: z.coerce.number().positive(),
  description: z.string().min(10),
  propertyType: z.enum(["HOUSE", "CONDO", "TOWNHOUSE", "APARTMENT", "LAND", "MULTI_FAMILY"]),
  status: z.enum(["AVAILABLE", "PENDING", "SOLD"]),
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  neighborhoodInfo: z.string().optional(),
  agentId: z.string().optional(),
  photoUrls: z.string().optional(), // newline or comma separated
});

function requireAdmin(role?: string) {
  if (role !== "ADMIN") throw new Error("Not authorized.");
}

export async function createListing(formData: FormData) {
  const session = await auth();
  requireAdmin(session?.user.role);

  const raw = Object.fromEntries(formData.entries());
  const parsed = listingSchema.parse(raw);
  const photoUrls = (parsed.photoUrls ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const listing = await prisma.listing.create({
    data: {
      title: parsed.title,
      address: parsed.address,
      city: parsed.city,
      state: parsed.state,
      zip: parsed.zip,
      price: parsed.price,
      beds: parsed.beds,
      baths: parsed.baths,
      sqft: parsed.sqft,
      description: parsed.description,
      propertyType: parsed.propertyType,
      status: parsed.status,
      lat: parsed.lat,
      lng: parsed.lng,
      neighborhoodInfo: parsed.neighborhoodInfo || null,
      agentId: parsed.agentId || null,
      photos: { create: photoUrls.map((url, order) => ({ url, order })) },
    },
  });

  revalidatePath("/dashboard/admin/listings");
  redirect(`/dashboard/admin/listings/${listing.id}/edit`);
}

export async function updateListing(listingId: string, formData: FormData) {
  const session = await auth();
  requireAdmin(session?.user.role);

  const raw = Object.fromEntries(formData.entries());
  const parsed = listingSchema.parse(raw);
  const photoUrls = (parsed.photoUrls ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.listing.update({
    where: { id: listingId },
    data: {
      title: parsed.title,
      address: parsed.address,
      city: parsed.city,
      state: parsed.state,
      zip: parsed.zip,
      price: parsed.price,
      beds: parsed.beds,
      baths: parsed.baths,
      sqft: parsed.sqft,
      description: parsed.description,
      propertyType: parsed.propertyType,
      status: parsed.status,
      lat: parsed.lat,
      lng: parsed.lng,
      neighborhoodInfo: parsed.neighborhoodInfo || null,
      agentId: parsed.agentId || null,
      photos: {
        deleteMany: {},
        create: photoUrls.map((url, order) => ({ url, order })),
      },
    },
  });

  revalidatePath("/dashboard/admin/listings");
  revalidatePath(`/listings/${listingId}`);
  return { success: true };
}

export async function deleteListing(listingId: string) {
  const session = await auth();
  requireAdmin(session?.user.role);

  await prisma.listing.delete({ where: { id: listingId } });
  revalidatePath("/dashboard/admin/listings");
  return { success: true };
}
