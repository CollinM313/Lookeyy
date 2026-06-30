"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createBooking } from "@/app/actions/bookings";
import { Video, FileVideo } from "lucide-react";
import { cn } from "@/lib/utils";

export function BookingForm({
  listingId,
  defaultName,
  defaultEmail,
  isSignedIn,
}: {
  listingId: string;
  defaultName: string;
  defaultEmail: string;
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const [tourType, setTourType] = useState<"LIVE" | "RECORDED">("LIVE");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [contactName, setContactName] = useState(defaultName);
  const [contactEmail, setContactEmail] = useState(defaultEmail);
  const [contactPhone, setContactPhone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [minDate] = useState(() => new Date(Date.now() + 24 * 36e5).toISOString().slice(0, 10));

  if (!isSignedIn) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center">
        <p className="text-muted-foreground">Sign in to request a tour of this home.</p>
        <Button asChild className="mt-4">
          <Link href={`/sign-in?callbackUrl=/book/${listingId}`}>Sign in to continue</Link>
        </Button>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !time) {
      toast.error("Please pick a date and time.");
      return;
    }
    setLoading(true);
    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    const result = await createBooking({
      listingId,
      tourType,
      scheduledAt,
      contactName,
      contactEmail,
      contactPhone,
      specialRequests,
    });
    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Tour requested! We'll confirm your agent shortly.");
    router.push("/dashboard/client");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label className="mb-2 block">Tour type</Label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTourType("LIVE")}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors",
              tourType === "LIVE" ? "border-primary bg-accent" : "border-border"
            )}
          >
            <Video className="h-5 w-5 text-primary" />
            <span className="font-medium">Live video call</span>
            <span className="text-xs text-muted-foreground">Real-time tour at a scheduled time</span>
          </button>
          <button
            type="button"
            onClick={() => setTourType("RECORDED")}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors",
              tourType === "RECORDED" ? "border-primary bg-accent" : "border-border"
            )}
          >
            <FileVideo className="h-5 w-5 text-primary" />
            <span className="font-medium">Recorded walkthrough</span>
            <span className="text-xs text-muted-foreground">Agent records & uploads within a few days</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="date">Preferred date</Label>
          <Input id="date" type="date" min={minDate} required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="time">Preferred time</Label>
          <Input id="time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="contactName">Your name</Label>
        <Input id="contactName" required value={contactName} onChange={(e) => setContactName(e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="contactEmail">Email</Label>
          <Input
            id="contactEmail"
            type="email"
            required
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="contactPhone">Phone</Label>
          <Input
            id="contactPhone"
            type="tel"
            required
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="specialRequests">Special requests (optional)</Label>
        <Textarea
          id="specialRequests"
          placeholder="Anything specific you'd like the agent to show or check?"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? "Submitting…" : "Confirm tour request"}
      </Button>
    </form>
  );
}
