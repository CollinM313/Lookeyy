"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getIdxListing, getIdxImages } from "@/lib/idx-broker";

export async function getOrCreateIdxPrismaListing(formData: FormData) {
  const idxID = formData.get("idxID") as string;
  const listingID = formData.get("listingID") as string;

  const idxListing = await getIdxListing(idxID, listingID);
  if (!idxListing) throw new Error("IDX listing not found");

  // Check if we already synced this listing
  const existing = await prisma.listing.findFirst({
    where: { idxListingKey: `${idxID}/${listingID}` },
  });
  if (existing) redirect(`/book/${existing.id}`);

  const images = getIdxImages(idxListing);
  const sqft = parseInt(idxListing.sqFt?.replace(/,/g, "") ?? "0") || 0;

  const listing = await prisma.listing.create({
    data: {
      title: `${idxListing.address}, ${idxListing.cityName}`,
      address: idxListing.address,
      city: idxListing.cityName,
      state: idxListing.state,
      zip: idxListing.zipcode,
      price: idxListing.price,
      beds: idxListing.bedrooms,
      baths: idxListing.totalBaths,
      sqft,
      description: idxListing.remarksConcat,
      propertyType: "HOUSE",
      status: "AVAILABLE",
      lat: idxListing.latitude ?? null,
      lng: idxListing.longitude ?? null,
      idxListingKey: `${idxID}/${listingID}`,
      photos: {
        create: images.slice(0, 10).map((img, i) => ({
          url: img.url,
          order: i,
        })),
      },
    },
  });

  redirect(`/book/${listing.id}`);
}
