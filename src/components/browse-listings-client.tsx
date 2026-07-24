"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Play, Bed, Bath, Ruler, MapPin, Heart, Video, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourRequestModal } from "@/components/tour-request-modal";
import { ListingsMap, type MapListing } from "@/components/listings-map";
import type { IdxListing } from "@/lib/idx-broker";
import { getIdxThumbnail } from "@/lib/idx-broker";

export type DbVideoTour = {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  price: number;
  beds: number;
  baths: number;
  videoUrl: string;
  videoId: string;
};

type VideoTour = {
  youtubeId: string | null;
  title: string;
  address: string;
  city: string;
  state: string;
  price: string;
  beds: number;
  baths: number;
  gradient: string;
};

const PLACEHOLDER_TOURS: VideoTour[] = [
  {
    youtubeId: "F7afbjxVYCY",
    title: "Mountain Retreat",
    address: "649 Saint Moritz Dr",
    city: "Big Bear Lake",
    state: "CA",
    price: "$749,000",
    beds: 4,
    baths: 3,
    gradient: "from-blue-900 to-slate-700",
  },
  {
    youtubeId: null,
    title: "Desert Modern",
    address: "72 Desert Bloom Ct",
    city: "Palm Desert",
    state: "CA",
    price: "$1,250,000",
    beds: 5,
    baths: 4,
    gradient: "from-amber-700 to-orange-900",
  },
  {
    youtubeId: null,
    title: "Golf Course Estate",
    address: "81240 Peary Place",
    city: "La Quinta",
    state: "CA",
    price: "$2,400,000",
    beds: 5,
    baths: 5,
    gradient: "from-emerald-800 to-teal-900",
  },
  {
    youtubeId: null,
    title: "Ranch & Vineyard",
    address: "39375 San Ignacio Rd",
    city: "Hemet",
    state: "CA",
    price: "$11,995,000",
    beds: 4,
    baths: 5,
    gradient: "from-stone-700 to-zinc-800",
  },
  {
    youtubeId: null,
    title: "Oceanview Retreat",
    address: "4820 Oceanview Ln",
    city: "San Diego",
    state: "CA",
    price: "$589,000",
    beds: 3,
    baths: 2,
    gradient: "from-cyan-800 to-blue-900",
  },
];

type Props = {
  listings: IdxListing[];
  dbVideos?: DbVideoTour[];
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

export function BrowseListingsClient({ listings, dbVideos = [] }: Props) {
  const [filter, setFilter] = useState<FilterState>({ city: null, maxPrice: null, minBeds: null });
  const [modalAddress, setModalAddress] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  // Use DB videos when agents have added them; fall back to placeholders otherwise
  const videoTours: VideoTour[] = dbVideos.length > 0
    ? dbVideos.map((v) => ({
        youtubeId: v.videoId,
        title: v.title,
        address: v.address,
        city: v.city,
        state: v.state,
        price: `$${v.price.toLocaleString()}`,
        beds: v.beds,
        baths: v.baths,
        gradient: "from-blue-900 to-slate-700",
      }))
    : PLACEHOLDER_TOURS;

  const cities = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach((l) => { counts[l.cityName] = (counts[l.cityName] ?? 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([city]) => city);
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

          {/* ── Video tour row ── */}
          <div className="mb-6">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Featured video tours
            </p>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {videoTours.map((tour) => (
                <VideoTourCard
                  key={tour.address}
                  tour={tour}
                  playing={playingId === tour.address}
                  onPlay={() => setPlayingId(tour.address)}
                  onStop={() => setPlayingId(null)}
                  onRequestTour={() => setModalAddress(`${tour.address}, ${tour.city}, ${tour.state}`)}
                />
              ))}
            </div>
          </div>

          {/* ── Listings ── */}
          <p className="mb-4 text-sm text-muted-foreground">
            {filtered.length} home{filtered.length === 1 ? "" : "s"} with video tours
          </p>

          <div className="flex flex-col gap-5">
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

      <TourRequestModal
        open={modalAddress !== null}
        onClose={() => setModalAddress(null)}
        propertyAddress={modalAddress ?? undefined}
      />
    </>
  );
}

function VideoTourCard({
  tour,
  playing,
  onPlay,
  onStop,
  onRequestTour,
}: {
  tour: VideoTour;
  playing: boolean;
  onPlay: () => void;
  onStop: () => void;
  onRequestTour: () => void;
}) {
  return (
    <div className="flex-none w-[260px] overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {/* Thumbnail / player */}
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        {playing && tour.youtubeId ? (
          <>
            <iframe
              src={`https://www.youtube.com/embed/${tour.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
              className="h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={tour.title}
            />
            <button
              onClick={onStop}
              className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
              aria-label="Close video"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <>
            {tour.youtubeId ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={`https://img.youtube.com/vi/${tour.youtubeId}/mqdefault.jpg`}
                alt={tour.title}
                className="h-full w-full object-cover opacity-80"
              />
            ) : (
              <div className={`h-full w-full bg-gradient-to-br ${tour.gradient} flex items-center justify-center`}>
                <MapPin className="h-8 w-8 text-white/30" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <button
              onClick={tour.youtubeId ? onPlay : onRequestTour}
              className="absolute inset-0 flex items-center justify-center"
              aria-label={tour.youtubeId ? "Play tour video" : "Request a tour"}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 shadow-lg transition-transform hover:scale-110">
                <Play className="h-5 w-5 translate-x-0.5 text-zinc-900" fill="currentColor" />
              </div>
            </button>
            {!tour.youtubeId && (
              <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white/80">
                Tour coming soon
              </span>
            )}
            <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
              {tour.duration}
            </span>
          </>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-semibold leading-tight">{tour.price}</p>
        <p className="mt-0.5 text-sm font-medium leading-tight text-foreground">{tour.address}</p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {tour.city}, {tour.state}
        </p>
        <div className="mt-1.5 flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-0.5"><Bed className="h-3.5 w-3.5" /> {tour.beds}</span>
          <span className="flex items-center gap-0.5"><Bath className="h-3.5 w-3.5" /> {tour.baths}</span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="mt-2.5 h-7 w-full text-xs"
          onClick={onRequestTour}
        >
          <Video className="mr-1 h-3.5 w-3.5" /> Request a tour
        </Button>
      </div>
    </div>
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
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity hover:opacity-100">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow">
              <Play className="h-4 w-4 translate-x-0.5 text-zinc-900" fill="currentColor" />
            </div>
          </div>
        </div>
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
          <Button size="sm" onClick={() => onRequestTour(fullAddress)} className="self-start">
            <Video className="mr-1.5 h-4 w-4" /> Request a tour
          </Button>
        </div>
      </div>
    </div>
  );
}
