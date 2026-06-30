import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listing-card";

export const dynamic = "force-dynamic";

export default async function AgentListingsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const listings = await prisma.listing.findMany({
    where: { agentId: session.user.id },
    include: { photos: { take: 1, orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">My listings</h2>
        <p className="text-muted-foreground">Properties you cover for tours. Admins assign listings to agents.</p>
      </div>
      {listings.length === 0 ? (
        <p className="text-muted-foreground">No listings assigned to you yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      )}
    </div>
  );
}
