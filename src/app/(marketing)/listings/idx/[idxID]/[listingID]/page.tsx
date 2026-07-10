import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BedDouble, Bath, Ruler, MapPin, Video, ExternalLink } from "lucide-react";
import { getIdxListing, getIdxImages } from "@/lib/idx-broker";
import { getOrCreateIdxPrismaListing } from "@/app/actions/idx-sync";

export const dynamic = "force-dynamic";

export default async function IdxListingDetailPage({
  params,
}: {
  params: Promise<{ idxID: string; listingID: string }>;
}) {
  const { idxID, listingID } = await params;
  const listing = await getIdxListing(idxID, listingID);
  if (!listing) notFound();

  const images = getIdxImages(listing);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Gallery */}
      <div className="grid gap-2 sm:grid-cols-4 sm:grid-rows-2">
        {images.length > 0 ? (
          images.slice(0, 5).map((photo, i) => (
            <div
              key={i}
              className={`relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted ${
                i === 0 ? "sm:col-span-2 sm:row-span-2 sm:aspect-auto" : ""
              }`}
            >
              <Image
                src={photo.url}
                alt={photo.caption || listing.address}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))
        ) : (
          <div className="col-span-4 flex aspect-[16/7] items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            No photos available
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">{listing.listingPrice}</h1>
              <p className="mt-1 flex items-center gap-1 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {listing.address}, {listing.cityName}, {listing.state} {listing.zipcode}
              </p>
            </div>
            <Badge variant="outline" className="shrink-0">
              {listing.propSubType || listing.propType}
            </Badge>
          </div>

          <div className="mt-6 flex flex-wrap gap-8 border-y border-border py-4 text-sm">
            <span className="flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-primary" /> {listing.bedrooms} beds
            </span>
            <span className="flex items-center gap-2">
              <Bath className="h-5 w-5 text-primary" /> {listing.totalBaths} baths
            </span>
            {listing.sqFt && (
              <span className="flex items-center gap-2">
                <Ruler className="h-5 w-5 text-primary" /> {listing.sqFt} sqft
              </span>
            )}
            {listing.yearBuilt > 0 && (
              <span className="text-muted-foreground">Built {listing.yearBuilt}</span>
            )}
          </div>

          {listing.remarksConcat && (
            <div className="mt-6">
              <h2 className="text-xl font-semibold">About this home</h2>
              <p className="mt-2 whitespace-pre-line text-muted-foreground">{listing.remarksConcat}</p>
            </div>
          )}

          {/* MLS compliance disclaimer */}
          <div className="mt-8 rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
            <p>
              Listing information provided by IDX Broker. Data deemed reliable but not guaranteed.
              MLS# {listing.listingID}. Last updated: {new Date(listing.dateAdded).toLocaleDateString()}.
            </p>
            <p className="mt-1">
              <a
                href={listing.fullDetailsURL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-foreground"
              >
                View full listing on MLS
              </a>
            </p>
          </div>
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
            <form action={getOrCreateIdxPrismaListing}>
              <input type="hidden" name="idxID" value={idxID} />
              <input type="hidden" name="listingID" value={listingID} />
              <Button type="submit" className="mt-4 w-full" size="lg">
                Request a tour
              </Button>
            </form>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">View on IDX Broker</p>
            <Button asChild variant="outline" className="mt-3 w-full" size="sm">
              <a href={listing.fullDetailsURL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" /> Full MLS details
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
