import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { DeleteListingButton } from "@/components/admin/delete-listing-button";

export const dynamic = "force-dynamic";

export default async function AdminListingsPage() {
  const listings = await prisma.listing.findMany({
    include: { agent: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Listings</h2>
        <Button asChild>
          <Link href="/dashboard/admin/listings/new">Add listing</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {listings.map((l) => (
          <Card key={l.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{l.title}</p>
              <p className="text-sm text-muted-foreground">
                {l.city}, {l.state} &middot; ${l.price.toLocaleString()} &middot; {l.agent?.name ?? "Unassigned"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{PROPERTY_TYPE_LABELS[l.propertyType]}</Badge>
              <Badge>{l.status}</Badge>
              <Button asChild size="sm" variant="outline">
                <Link href={`/dashboard/admin/listings/${l.id}/edit`}>Edit</Link>
              </Button>
              <DeleteListingButton listingId={l.id} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
