import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { BedDouble, Bath, Ruler, MapPin } from "lucide-react";

export type ListingCardData = {
  id: string;
  title: string;
  city: string;
  state: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: string;
  status: string;
  photoUrl?: string | null;
};

export function ListingCard({ listing }: { listing: ListingCardData }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {listing.photoUrl ? (
          <Image
            src={listing.photoUrl}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
            No photo yet
          </div>
        )}
        {listing.status !== "AVAILABLE" && (
          <Badge className="absolute left-3 top-3" variant="secondary">
            {listing.status === "PENDING" ? "Pending" : "Sold"}
          </Badge>
        )}
      </div>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">${listing.price.toLocaleString()}</p>
          <Badge variant="outline">{PROPERTY_TYPE_LABELS[listing.propertyType] ?? listing.propertyType}</Badge>
        </div>
        <p className="line-clamp-1 font-medium">{listing.title}</p>
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" /> {listing.city}, {listing.state}
        </p>
        <div className="flex items-center gap-4 pt-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1"><BedDouble className="h-4 w-4" /> {listing.beds}</span>
          <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {listing.baths}</span>
          <span className="flex items-center gap-1"><Ruler className="h-4 w-4" /> {listing.sqft.toLocaleString()} sqft</span>
        </div>
      </div>
    </Link>
  );
}
