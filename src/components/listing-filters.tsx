"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";

export function ListingFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");
  const [beds, setBeds] = useState(searchParams.get("beds") ?? "");
  const [baths, setBaths] = useState(searchParams.get("baths") ?? "");
  const [city, setCity] = useState(searchParams.get("city") ?? "");
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") ?? "");

  function applyFilters() {
    const params = new URLSearchParams();
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (beds) params.set("beds", beds);
    if (baths) params.set("baths", baths);
    if (city) params.set("city", city);
    if (propertyType) params.set("propertyType", propertyType);
    router.push(`/listings?${params.toString()}`);
  }

  function clearFilters() {
    setMinPrice("");
    setMaxPrice("");
    setBeds("");
    setBaths("");
    setCity("");
    setPropertyType("");
    router.push("/listings");
  }

  return (
    <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-3 lg:grid-cols-7 lg:items-end">
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">City</label>
        <Input placeholder="e.g. Austin" value={city} onChange={(e) => setCity(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Min price</label>
        <Input
          type="number"
          placeholder="$0"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Max price</label>
        <Input
          type="number"
          placeholder="Any"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Beds</label>
        <Input type="number" placeholder="Any" value={beds} onChange={(e) => setBeds(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Baths</label>
        <Input type="number" placeholder="Any" value={baths} onChange={(e) => setBaths(e.target.value)} />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-muted-foreground">Type</label>
        <Select value={propertyType} onValueChange={(v) => setPropertyType(v ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button onClick={applyFilters} className="flex-1">
          Search
        </Button>
        <Button onClick={clearFilters} variant="outline">
          Clear
        </Button>
      </div>
    </div>
  );
}
