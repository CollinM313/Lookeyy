import { getAllListings } from "@/lib/idx-broker";
import { BrowseListingsClient } from "@/components/browse-listings-client";

export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  const listings = await getAllListings().catch(() => []);

  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <div className="border-b border-border px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-[1600px]">
          <h1 className="text-2xl font-bold sm:text-3xl">The smarter way to home shop</h1>
          <p className="mt-1 text-muted-foreground">
            Browse agent-filmed video tours, explore listings on the map, and request a live or recorded tour — all before stepping foot inside.
          </p>
        </div>
      </div>

      <BrowseListingsClient listings={listings} />
    </div>
  );
}
