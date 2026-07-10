import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { BedDouble, Bath, Ruler, MapPin } from "lucide-react";
import type { IdxListing } from "@/lib/idx-broker";
import { getIdxThumbnail } from "@/lib/idx-broker";

export function IdxListingCard({ listing }: { listing: IdxListing }) {
  const thumb = getIdxThumbnail(listing);
  const href = `/listings/idx/${listing.idxID}/${listing.listingID}`;
  const sqft = listing.sqFt ? parseInt(listing.sqFt.replace(/,/g, "")) : 0;

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {thumb ? (
          <Image
            src={thumb}
            alt={listing.address}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            No photo yet
          </div>
        )}
        <Badge className="absolute left-3 top-3 bg-primary/90 text-primary-foreground" variant="secondary">
          MLS
        </Badge>
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">{listing.listingPrice}</p>
          <Badge variant="outline">{listing.propSubType || listing.propType}</Badge>
        </div>
        <p className="line-clamp-1 font-medium">{listing.address}</p>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {listing.cityName}, {listing.state}
        </p>
        <div className="flex items-center gap-4 pt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {listing.bedrooms}</span>
          <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {listing.totalBaths}</span>
          {sqft > 0 && (
            <span className="flex items-center gap-1"><Ruler className="h-4 w-4" /> {listing.sqFt} sqft</span>
          )}
        </div>
      </div>
    </Link>
  );
}
