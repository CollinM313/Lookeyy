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

export function ListingsMap({ listings }: { listings: MapListing[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const valid = listings.filter((l) => l.latitude && l.longitude);
    const center: [number, number] =
      valid.length > 0
        ? [valid[0].latitude, valid[0].longitude]
        : [34.2439, -116.9114];

    // Dynamically import Leaflet to avoid SSR issues
    import("leaflet").then((L) => {
      // Fix default marker icon paths broken by webpack
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current).setView(center, 9);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      valid.forEach((l) => {
        const marker = L.marker([l.latitude, l.longitude]);
        marker.bindPopup(`
          <div style="min-width:160px;font-family:sans-serif;">
            <p style="font-weight:600;font-size:13px;margin:0 0 2px;">${l.address}</p>
            <p style="color:#666;font-size:12px;margin:0 0 4px;">${l.cityName}, ${l.state}</p>
            <p style="font-weight:700;font-size:13px;margin:0 0 2px;">${l.listingPrice}</p>
            <p style="color:#888;font-size:11px;margin:0 0 6px;">${l.bedrooms} bd · ${l.totalBaths} ba</p>
            <a href="/listings/idx/${l.idxID}/${l.listingID}" style="font-size:12px;color:#2563eb;text-decoration:underline;">View tour →</a>
          </div>
        `);
        marker.addTo(map);
      });
    });

    return () => {
      if (mapRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapRef.current as any).remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%" }}
        aria-label="Listings map"
      />
    </>
  );
}
