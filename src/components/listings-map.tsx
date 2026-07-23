"use client";

export type MapListing = {
  idxID: string;
  listingID: string;
  address: string;
  cityName: string;
  state: string;
  latitude: number;
  longitude: number;
  listingPrice: string;
  bedrooms: number;
  totalBaths: number;
};

export function ListingsMap({ listings }: { listings: MapListing[] }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  // Build a comma-separated list of waypoints from listings for a search map,
  // or fall back to a California real-estate search
  const hasListings = listings.length > 0;
  const firstListing = listings[0];

  const src = hasListings
    ? `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${firstListing.latitude},${firstListing.longitude}&zoom=10&maptype=roadmap`
    : `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=real+estate+California&zoom=7`;

  return (
    <iframe
      src={src}
      style={{ width: "100%", height: "100%", border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title="Listings map"
    />
  );
}
