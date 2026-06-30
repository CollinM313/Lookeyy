"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/profile";

export function ProfileForm({
  isAgent,
  defaultValues,
}: {
  isAgent: boolean;
  defaultValues: { name: string; phone: string; bio: string; brokerage: string; coverageArea: string };
}) {
  const [form, setForm] = useState(defaultValues);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const r = await updateProfile(form);
    setLoading(false);
    if (r.error) toast.error(r.error);
    else toast.success("Profile updated.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
      </div>
      {isAgent && (
        <>
          <div className="space-y-1">
            <Label htmlFor="brokerage">Brokerage</Label>
            <Input id="brokerage" value={form.brokerage} onChange={(e) => update("brokerage", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="coverageArea">Coverage area</Label>
            <Input id="coverageArea" value={form.coverageArea} onChange={(e) => update("coverageArea", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" rows={4} value={form.bio} onChange={(e) => update("bio", e.target.value)} />
          </div>
        </>
      )}
      <Button type="submit" disabled={loading}>{loading ? "Saving…" : "Save changes"}</Button>
    </form>
  );
}
