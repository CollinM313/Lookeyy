"use client";

import { useEffect, useRef } from "react";

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

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    google: any;
  }
}

export function ListingsMap({ listings }: { listings: MapListing[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

    async function init() {
      // Load script if not already present
      if (!document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
        await new Promise<void>((resolve) => {
          const script = document.createElement("script");
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&libraries=maps,marker`;
          script.async = true;
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      }

      // Wait for google.maps to be ready
      while (!window.google?.maps?.importLibrary) {
        await new Promise((r) => setTimeout(r, 100));
      }

      if (cancelled || !containerRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { Map } = (await window.google.maps.importLibrary("maps")) as any;

      if (cancelled || !containerRef.current) return;

      const valid = listings.filter((l) => l.latitude && l.longitude);
      const center =
        valid.length > 0
          ? { lat: valid[0].latitude, lng: valid[0].longitude }
          : { lat: 34.2439, lng: -116.9114 };

      const map = new Map(containerRef.current, {
        center,
        zoom: 9,
        gestureHandling: "greedy",
        mapTypeControl: false,
        streetViewControl: false,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { Marker } = (await window.google.maps.importLibrary("marker")) as any;

      valid.forEach((l) => {
        const marker = new Marker({
          position: { lat: l.latitude, lng: l.longitude },
          map,
          title: l.address,
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="min-width:160px;padding:4px 2px;font-family:sans-serif;">
            <p style="font-weight:600;font-size:13px;margin:0 0 2px;">${l.address}</p>
            <p style="color:#666;font-size:12px;margin:0 0 4px;">${l.cityName}, ${l.state}</p>
            <p style="font-weight:700;font-size:13px;margin:0 0 2px;">${l.listingPrice}</p>
            <p style="color:#888;font-size:11px;margin:0 0 6px;">${l.bedrooms} bd · ${l.totalBaths} ba</p>
            <a href="/listings/idx/${l.idxID}/${l.listingID}" style="font-size:12px;color:#2563eb;text-decoration:underline;">View tour →</a>
          </div>`,
        });

        marker.addListener("click", () => infoWindow.open(map, marker));
      });
    }

    init().catch(console.error);
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%" }}
      aria-label="Listings map"
    />
  );
}
