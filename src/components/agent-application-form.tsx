"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { applyAsAgent } from "@/app/actions/agents";

export function AgentApplicationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    licenseNumber: "",
    brokerage: "",
    coverageArea: "",
    bio: "",
    areasOfExpertise: "",
  });

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await applyAsAgent({
      ...form,
      areasOfExpertise: form.areasOfExpertise
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    setSubmitted(true);
    setTimeout(() => router.push("/sign-in"), 2500);
  }

  if (submitted) {
    return (
      <div className="py-10 text-center">
        <p className="text-xl font-semibold">Application submitted!</p>
        <p className="mt-2 text-muted-foreground">
          We&apos;ll review your application and email you once approved. Redirecting to sign in…
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" required value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            minLength={8}
            required
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="licenseNumber">License number</Label>
          <Input
            id="licenseNumber"
            required
            value={form.licenseNumber}
            onChange={(e) => update("licenseNumber", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="brokerage">Brokerage</Label>
          <Input id="brokerage" required value={form.brokerage} onChange={(e) => update("brokerage", e.target.value)} />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="coverageArea">Coverage area</Label>
        <Input
          id="coverageArea"
          placeholder="e.g. Austin metro, TX"
          required
          value={form.coverageArea}
          onChange={(e) => update("coverageArea", e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="areasOfExpertise">Areas of expertise (comma separated)</Label>
        <Input
          id="areasOfExpertise"
          placeholder="First-time buyers, luxury, relocation"
          value={form.areasOfExpertise}
          onChange={(e) => update("areasOfExpertise", e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          required
          minLength={20}
          rows={5}
          placeholder="Tell us about your experience and why you'd be a great tour partner."
          value={form.bio}
          onChange={(e) => update("bio", e.target.value)}
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Submitting…" : "Submit application"}
      </Button>
    </form>
  );
}
