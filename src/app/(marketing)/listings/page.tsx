import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listing-card";
import { ListingFilters } from "@/components/listing-filters";
import type { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

type SearchParams = {
  minPrice?: string;
  maxPrice?: string;
  beds?: string;
  baths?: string;
  propertyType?: string;
  city?: string;
};

async function getListings(params: SearchParams) {
  const where: Prisma.ListingWhereInput = { status: "AVAILABLE" };

  if (params.minPrice || params.maxPrice) {
    where.price = {
      ...(params.minPrice ? { gte: Number(params.minPrice) } : {}),
      ...(params.maxPrice ? { lte: Number(params.maxPrice) } : {}),
    };
  }
  if (params.beds) where.beds = { gte: Number(params.beds) };
  if (params.baths) where.baths = { gte: Number(params.baths) };
  if (params.propertyType) where.propertyType = params.propertyType as Prisma.EnumPropertyTypeFilter["equals"];
  if (params.city) where.city = { contains: params.city, mode: "insensitive" };

  try {
    return await prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { photos: { take: 1, orderBy: { order: "asc" } } },
    });
  } catch {
    return [];
  }
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const listings = await getListings(params);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Browse homes</h1>
        <p className="text-muted-foreground">
          {listings.length} home{listings.length === 1 ? "" : "s"} available for a video tour
        </p>
      </div>

      <div className="mt-6">
        <ListingFilters />
      </div>

      {listings.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard
              key={l.id}
              listing={{
                id: l.id,
                title: l.title,
                city: l.city,
                state: l.state,
                price: l.price,
                beds: l.beds,
                baths: l.baths,
                sqft: l.sqft,
                propertyType: l.propertyType,
                status: l.status,
                photoUrl: l.photos[0]?.url ?? null,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          No listings match your filters yet. Try widening your search, or seed the database for demo data.
        </div>
      )}
    </div>
  );
}
