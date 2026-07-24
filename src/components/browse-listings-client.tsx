"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Play, Bed, Bath, Ruler, MapPin, Heart, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourRequestModal } from "@/components/tour-request-modal";
import { ListingsMap, type MapListing } from "@/components/listings-map";
import type { IdxListing } from "@/lib/idx-broker";
import { getIdxThumbnail } from "@/lib/idx-broker";

const FEATURED_YOUTUBE_ID = "F7afbjxVYCY";
const FEATURED_LISTING_ID = "497"; // Saint Moritz Big Bear

type Props = {
  listings: IdxListing[];
};

type FilterState = {
  city: string | null;
  maxPrice: number | null;
  minBeds: number | null;
};

const PRICE_OPTIONS = [
  { label: "Under $500k", value: 500_000 },
  { label: "Under $750k", value: 750_000 },
  { label: "Under $1M", value: 1_000_000 },
];

const BED_OPTIONS = [
  { label: "2+ beds", value: 2 },
  { label: "3+ beds", value: 3 },
  { label: "4+ beds", value: 4 },
];

export function BrowseListingsClient({ listings }: Props) {
  const [filter, setFilter] = useState<FilterState>({ city: null, maxPrice: null, minBeds: null });
  const [modalAddress, setModalAddress] = useState<string | null>(null);
  const [playingFeatured, setPlayingFeatured] = useState(false);

  // Derive unique cities for filter pills (top 5 by count)
  const cities = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach((l) => {
      counts[l.cityName] = (counts[l.cityName] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([city]) => city);
  }, [listings]);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (filter.city && l.cityName !== filter.city) return false;
      if (filter.maxPrice && l.price > filter.maxPrice) return false;
      if (filter.minBeds && l.bedrooms < filter.minBeds) return false;
      return true;
    });
  }, [listings, filter]);

  const mapListings: MapListing[] = filtered
    .filter((l) => l.latitude && l.longitude)
    .slice(0, 150)
    .map((l) => ({
      idxID: l.idxID,
      listingID: l.listingID,
      address: l.address,
      cityName: l.cityName,
      state: l.state,
      latitude: l.latitude,
      longitude: l.longitude,
      listingPrice: l.listingPrice,
      bedrooms: l.bedrooms,
      totalBaths: l.totalBaths,
    }));

  function toggleCity(city: string) {
    setFilter((f) => ({ ...f, city: f.city === city ? null : city }));
  }

  function togglePrice(val: number) {
    setFilter((f) => ({ ...f, maxPrice: f.maxPrice === val ? null : val }));
  }

  function toggleBeds(val: number) {
    setFilter((f) => ({ ...f, minBeds: f.minBeds === val ? null : val }));
  }

  const isAllActive = !filter.city && !filter.maxPrice && !filter.minBeds;

  return (
    <>
      {/* ── Filter bar ── */}
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            <FilterPill active={isAllActive} onClick={() => setFilter({ city: null, maxPrice: null, minBeds: null })}>
              All
            </FilterPill>
            {cities.map((city) => (
              <FilterPill key={city} active={filter.city === city} onClick={() => toggleCity(city)}>
                {city}
              </FilterPill>
            ))}
            <div className="mx-1 h-5 w-px bg-border" />
            {PRICE_OPTIONS.map((p) => (
              <FilterPill key={p.value} active={filter.maxPrice === p.value} onClick={() => togglePrice(p.value)}>
                {p.label}
              </FilterPill>
            ))}
            <div className="mx-1 h-5 w-px bg-border" />
            {BED_OPTIONS.map((b) => (
              <FilterPill key={b.value} active={filter.minBeds === b.value} onClick={() => toggleBeds(b.value)}>
                {b.label}
              </FilterPill>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main layout: feed + map ── */}
      <div className="mx-auto flex max-w-[1600px] flex-col lg:flex-row lg:h-[calc(100vh-117px)]">

        {/* Feed */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <p className="mb-5 text-sm text-muted-foreground">
            {filtered.length} home{filtered.length === 1 ? "" : "s"} with video tours
          </p>

          <div className="flex flex-col gap-5">

            {/* Featured video card */}
            <div className="overflow-hidden rounded-2xl border border-primary/30 bg-card shadow-sm">
              <div className="relative aspect-video w-full overflow-hidden bg-black">
                {playingFeatured ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${FEATURED_YOUTUBE_ID}?autoplay=1&rel=0&modestbranding=1`}
                    className="h-full w-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    title="649 Saint Moritz Dr – Big Bear Lake"
                  />
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${FEATURED_YOUTUBE_ID}/maxresdefault.jpg`}
                      alt="649 Saint Moritz Dr, Big Bear Lake"
                      className="h-full w-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <button
                      onClick={() => setPlayingFeatured(true)}
                      className="absolute inset-0 flex items-center justify-center"
                      aria-label="Play tour video"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-2xl transition-transform hover:scale-110">
                        <Play className="h-6 w-6 translate-x-0.5 text-zinc-900" fill="currentColor" />
                      </div>
                    </button>
                    <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                      Featured tour
                    </span>
                    <span className="absolute bottom-3 left-3 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                      4:32
                    </span>
                  </>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold">$749,000</p>
                    <p className="mt-0.5 font-medium">649 Saint Moritz Dr</p>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> Big Bear Lake, CA
                    </p>
                    <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> 4</span>
                      <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> 3</span>
                      <span className="flex items-center gap-1"><Ruler className="h-4 w-4" /> 2,100 sqft</span>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-primary" aria-label="Save listing">
                    <Heart className="h-5 w-5" />
                  </button>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => setModalAddress("649 Saint Moritz Dr, Big Bear Lake, CA")}
                  >
                    <Video className="mr-1.5 h-4 w-4" /> Request a tour
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setPlayingFeatured(true)}>
                    <Play className="mr-1.5 h-4 w-4" /> Watch tour
                  </Button>
                </div>
              </div>
            </div>

            {/* IDX listing cards */}
            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
                No listings match your filters. Try widening your search.
              </div>
            )}

            {filtered.map((listing) => (
              <ListingBrowseCard
                key={`${listing.idxID}-${listing.listingID}`}
                listing={listing}
                onRequestTour={(addr) => setModalAddress(addr)}
              />
            ))}

            <p className="pt-4 text-center text-xs text-muted-foreground">
              Listing data provided by IDX Broker · California Desert Association of Realtors · Data deemed reliable but not guaranteed.
            </p>
          </div>
        </div>

        {/* Map panel */}
        <div className="hidden lg:flex lg:w-[420px] lg:flex-col border-l border-border">
          <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 text-sm font-medium text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Map view · {mapListings.length} with coordinates
          </div>
          <div className="flex-1">
            <ListingsMap listings={mapListings} />
          </div>
        </div>
      </div>

      {/* Tour request modal */}
      <TourRequestModal
        open={modalAddress !== null}
        onClose={() => setModalAddress(null)}
        propertyAddress={modalAddress ?? undefined}
      />
    </>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
        active
          ? "border-primary bg-primary/10 font-medium text-primary"
          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function ListingBrowseCard({
  listing,
  onRequestTour,
}: {
  listing: IdxListing;
  onRequestTour: (address: string) => void;
}) {
  const thumb = getIdxThumbnail(listing);
  const sqft = listing.sqFt ? parseInt(listing.sqFt.replace(/,/g, "")) : 0;
  const fullAddress = `${listing.address}, ${listing.cityName}, ${listing.state}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="grid sm:grid-cols-[200px_1fr]">
        {/* Thumbnail */}
        <div className="relative aspect-[4/3] sm:aspect-auto bg-muted">
          {thumb ? (
            <Image
              src={thumb}
              alt={listing.address}
              fill
              sizes="200px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full min-h-[120px] items-center justify-center text-xs text-muted-foreground">
              No photo
            </div>
          )}
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow">
              <Play className="h-4 w-4 translate-x-0.5 text-zinc-900" fill="currentColor" />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between gap-3 p-4">
          <div>
            <div className="flex items-start justify-between gap-2">
              <p className="text-lg font-semibold">{listing.listingPrice}</p>
              <button className="text-muted-foreground hover:text-primary" aria-label="Save listing">
                <Heart className="h-4.5 w-4.5" />
              </button>
            </div>
            <p className="mt-0.5 font-medium leading-tight">{listing.address}</p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" /> {listing.cityName}, {listing.state}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Bed className="h-4 w-4" /> {listing.bedrooms} bd</span>
              <span className="flex items-center gap-1"><Bath className="h-4 w-4" /> {listing.totalBaths} ba</span>
              {sqft > 0 && (
                <span className="flex items-center gap-1"><Ruler className="h-4 w-4" /> {listing.sqFt} sqft</span>
              )}
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => onRequestTour(fullAddress)}
            className="self-start"
          >
            <Video className="mr-1.5 h-4 w-4" /> Request a tour
          </Button>
        </div>
      </div>
    </div>
  );
}
