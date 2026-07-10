import { getAllListings } from "@/lib/idx-broker";
import { IdxListingCard } from "@/components/idx-listing-card";
import { ListingFilters } from "@/components/listing-filters";

export const dynamic = "force-dynamic";

type SearchParams = {
  minPrice?: string;
  maxPrice?: string;
  beds?: string;
  baths?: string;
  city?: string;
};

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const listings = await getAllListings({
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    beds: params.beds ? Number(params.beds) : undefined,
    baths: params.baths ? Number(params.baths) : undefined,
    city: params.city || undefined,
  });

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
            <IdxListingCard key={`${l.idxID}-${l.listingID}`} listing={l} />
          ))}
        </div>
      ) : (
        <div className="mt-16 rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          No listings match your filters. Try widening your search.
        </div>
      )}

      <p className="mt-10 text-center text-xs text-muted-foreground">
        Listing data provided by IDX Broker · California Desert Association of Realtors · Data deemed reliable but not guaranteed.
      </p>
    </div>
  );
}
