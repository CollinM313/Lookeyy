"use client";

import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import { useState } from "react";
import Link from "next/link";

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
  const [selected, setSelected] = useState<MapListing | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  const valid = listings.filter((l) => l.latitude && l.longitude);

  const center =
    valid.length > 0
      ? { lat: valid[0].latitude, lng: valid[0].longitude }
      : { lat: 34.2439, lng: -116.9114 }; // Big Bear Lake default

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        defaultCenter={center}
        defaultZoom={9}
        mapId="lookeyy-listings-map"
        className="h-full w-full"
        gestureHandling="greedy"
        disableDefaultUI={false}
      >
        {valid.map((l) => (
          <AdvancedMarker
            key={`${l.idxID}-${l.listingID}`}
            position={{ lat: l.latitude, lng: l.longitude }}
            onClick={() => setSelected(l)}
          />
        ))}

        {selected && (
          <InfoWindow
            position={{ lat: selected.latitude, lng: selected.longitude }}
            onCloseClick={() => setSelected(null)}
          >
            <div className="min-w-[160px] p-1">
              <p className="font-semibold text-sm text-gray-900">{selected.address}</p>
              <p className="text-xs text-gray-500">
                {selected.cityName}, {selected.state}
              </p>
              <p className="mt-1 text-sm font-bold text-gray-900">{selected.listingPrice}</p>
              <p className="text-xs text-gray-500">
                {selected.bedrooms} bd · {selected.totalBaths} ba
              </p>
              <Link
                href={`/listings/idx/${selected.idxID}/${selected.listingID}`}
                className="mt-2 block text-xs font-medium text-blue-600 hover:underline"
              >
                View tour &rarr;
              </Link>
            </div>
          </InfoWindow>
        )}
      </Map>
    </APIProvider>
  );
}
