import { getAllListings } from "@/lib/idx-broker";
import { prisma } from "@/lib/prisma";
import { extractYouTubeId } from "@/lib/youtube";
import { BrowseListingsClient, type DbVideoTour } from "@/components/browse-listings-client";

export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  const [listings, dbListingsWithVideo] = await Promise.all([
    getAllListings().catch(() => []),
    prisma.listing.findMany({
      where: { videoUrl: { not: null } },
      select: {
        id: true, title: true, address: true, city: true, state: true,
        price: true, beds: true, baths: true, videoUrl: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const dbVideos: DbVideoTour[] = dbListingsWithVideo
    .map((l) => ({ ...l, videoId: extractYouTubeId(l.videoUrl!) }))
    .filter((l): l is DbVideoTour => l.videoId !== null);

  return (
    <div className="flex flex-col">
      <div className="border-b border-border px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-[1600px]">
          <h1 className="text-2xl font-bold sm:text-3xl">The smarter way to home shop</h1>
          <p className="mt-1 text-muted-foreground">
            Browse agent-filmed video tours, explore listings on the map, and request a live or recorded tour — all before stepping foot inside.
          </p>
        </div>
      </div>

      <BrowseListingsClient listings={listings} dbVideos={dbVideos} />
    </div>
  );
}
