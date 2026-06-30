"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROPERTY_TYPE_LABELS } from "@/lib/constants";
import { useState } from "react";

type ListingDefaults = {
  title: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  description: string;
  propertyType: string;
  status: string;
  lat: number;
  lng: number;
  neighborhoodInfo: string;
  agentId: string;
  photoUrls: string;
};

export function ListingForm({
  defaults,
  agents,
  action,
}: {
  defaults: ListingDefaults;
  agents: { id: string; name: string }[];
  action: (formData: FormData) => void;
}) {
  const [propertyType, setPropertyType] = useState(defaults.propertyType);
  const [status, setStatus] = useState(defaults.status);
  const [agentId, setAgentId] = useState(defaults.agentId);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="propertyType" value={propertyType} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="agentId" value={agentId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" required defaultValue={defaults.title} />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" required defaultValue={defaults.address} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" required defaultValue={defaults.city} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="state">State</Label>
          <Input id="state" name="state" required defaultValue={defaults.state} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="zip">Zip</Label>
          <Input id="zip" name="zip" required defaultValue={defaults.zip} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" type="number" required defaultValue={defaults.price} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="beds">Beds</Label>
          <Input id="beds" name="beds" type="number" required defaultValue={defaults.beds} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="baths">Baths</Label>
          <Input id="baths" name="baths" type="number" step="0.5" required defaultValue={defaults.baths} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="sqft">Sqft</Label>
          <Input id="sqft" name="sqft" type="number" required defaultValue={defaults.sqft} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lat">Latitude</Label>
          <Input id="lat" name="lat" type="number" step="any" required defaultValue={defaults.lat} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="lng">Longitude</Label>
          <Input id="lng" name="lng" type="number" step="any" required defaultValue={defaults.lng} />
        </div>
        <div className="space-y-1">
          <Label>Property type</Label>
          <Select value={propertyType} onValueChange={(v) => setPropertyType(v ?? "HOUSE")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label>Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v ?? "AVAILABLE")}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SOLD">Sold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label>Assigned agent</Label>
          <Select value={agentId} onValueChange={(v) => setAgentId(v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              {agents.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={4} required defaultValue={defaults.description} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="neighborhoodInfo">Neighborhood info</Label>
        <Textarea id="neighborhoodInfo" name="neighborhoodInfo" rows={3} defaultValue={defaults.neighborhoodInfo} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="photoUrls">Photo URLs (one per line)</Label>
        <Textarea
          id="photoUrls"
          name="photoUrls"
          rows={4}
          placeholder="https://images.unsplash.com/..."
          defaultValue={defaults.photoUrls}
        />
      </div>

      <Button type="submit" size="lg">Save listing</Button>
    </form>
  );
}
