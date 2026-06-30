import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listing-card";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const session = await auth();
  if (!session?.user) return null;

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { listing: { include: { photos: { take: 1, orderBy: { order: "asc" } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Saved homes</h2>
      {favorites.length === 0 ? (
        <p className="text-muted-foreground">You haven&apos;t saved any homes yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((f) => (
            <ListingCard
              key={f.id}
              listing={{
                id: f.listing.id,
                title: f.listing.title,
                city: f.listing.city,
                state: f.listing.state,
                price: f.listing.price,
                beds: f.listing.beds,
                baths: f.listing.baths,
                sqft: f.listing.sqft,
                propertyType: f.listing.propertyType,
                status: f.listing.status,
                photoUrl: f.listing.photos[0]?.url ?? null,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
