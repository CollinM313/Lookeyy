import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { BedDouble, Bath, Ruler, MapPin, Video } from "lucide-react";
import { auth } from "@/lib/auth";
import { FavoriteButton } from "@/components/favorite-button";

export const dynamic = "force-dynamic";

async function getListing(id: string) {
  try {
    return await prisma.listing.findUnique({
      where: { id },
      include: {
        photos: { orderBy: { order: "asc" } },
        agent: { include: { agentProfile: true } },
      },
    });
  } catch {
    return null;
  }
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [listing, session] = await Promise.all([getListing(id), auth()]);
  if (!listing) notFound();

  const initialFavorited = session?.user
    ? !!(await prisma.favorite.findUnique({
        where: { userId_listingId: { userId: session.user.id, listingId: id } },
      }))
    : false;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Gallery */}
      <div className="grid gap-2 sm:grid-cols-4 sm:grid-rows-2">
        {listing.photos.length > 0 ? (
          listing.photos.slice(0, 5).map((photo, i) => (
            <div
              key={photo.id}
              className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted ${
                i === 0 ? "sm:col-span-2 sm:row-span-2 sm:aspect-auto" : ""
              }`}
            >
              <Image src={photo.url} alt={listing.title} fill className="object-cover" />
            </div>
          ))
        ) : (
          <div className="col-span-4 flex aspect-[16/7] items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            No photos yet
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">${listing.price.toLocaleString()}</h1>
              <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {listing.address}, {listing.city}, {listing.state} {listing.zip}
              </p>
            </div>
            <Badge variant="outline" className="shrink-0">
              {PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType}
            </Badge>
          </div>

          <div className="mt-6 flex gap-8 border-y border-border py-4 text-sm">
            <span className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-primary" /> {listing.beds} beds
            </span>
            <span className="flex items-center gap-2">
              <Bath className="h-5 w-5 text-primary" /> {listing.baths} baths
            </span>
            <span className="flex items-center gap-2">
              <Ruler className="h-5 w-5 text-primary" /> {listing.sqft.toLocaleString()} sqft
            </span>
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold">About this home</h2>
            <p className="mt-2 whitespace-pre-line text-muted-foreground">{listing.description}</p>
          </div>

          {listing.neighborhoodInfo && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold">Neighborhood</h2>
              <p className="mt-2 whitespace-pre-line text-muted-foreground">{listing.neighborhoodInfo}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-2 text-primary">
              <Video className="h-5 w-5" />
              <p className="font-semibold">See it before you visit</p>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Request a live video call or recorded walkthrough with a local agent.
            </p>
            <Button asChild className="mt-4 w-full" size="lg">
              <Link href={`/book/${listing.id}`}>Request a tour</Link>
            </Button>
            <div className="mt-2">
              <FavoriteButton listingId={listing.id} initialFavorited={initialFavorited} />
            </div>
          </div>

          {listing.agent?.agentProfile && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Covered by</p>
              <p className="mt-1 font-semibold">{listing.agent.name}</p>
              <p className="text-sm text-muted-foreground">{listing.agent.agentProfile.brokerage}</p>
              <p className="mt-2 text-sm">
                ⭐ {listing.agent.agentProfile.ratingAvg.toFixed(1)} ({listing.agent.agentProfile.ratingCount} reviews)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
