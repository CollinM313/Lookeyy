"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PhoneCall, Video, Copy, Check } from "lucide-react";
import { setFallbackPhone } from "@/app/actions/video-call";

export function CallRoom({
  bookingId,
  fallbackPhone,
  agentPhone,
  agentName,
}: {
  bookingId: string;
  fallbackPhone: string | null;
  agentPhone?: string | null;
  agentName?: string | null;
}) {
  const [phone, setPhone] = useState(fallbackPhone ?? "");
  const [zoomLink, setZoomLink] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSave() {
    const r = await setFallbackPhone(bookingId, phone);
    if (r.error) {
      toast.error(r.error);
    } else {
      setSaved(true);
      toast.success("Contact info saved. Your agent will reach out at tour time.");
    }
  }

  async function handleCopyZoom() {
    await navigator.clipboard.writeText(zoomLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Agent contact info */}
      {agentName && (
        <div className="rounded-2xl border border-border bg-secondary/30 p-6">
          <div className="flex items-center gap-2 text-primary mb-2">
            <PhoneCall className="h-5 w-5" />
            <p className="font-semibold">Your agent: {agentName}</p>
          </div>
          {agentPhone ? (
            <p className="text-sm text-muted-foreground">
              Your agent will call or FaceTime you at <span className="font-medium text-foreground">{agentPhone}</span> at the scheduled time.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Your agent will reach out to coordinate the tour at the scheduled time.
            </p>
          )}
        </div>
      )}

      {/* How the tour works */}
      <div className="rounded-2xl border border-border p-6 space-y-4">
        <h3 className="font-semibold text-lg">How your tour works</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: PhoneCall, title: "FaceTime", body: "Your agent will FaceTime you at the scheduled time using the number below." },
            { icon: Video, title: "Zoom", body: "Prefer Zoom? Share a link below and your agent will join at tour time." },
            { icon: PhoneCall, title: "Phone call", body: "Your agent can also do a regular phone call and narrate the tour for you." },
          ].map((opt) => (
            <div key={opt.title} className="rounded-xl bg-secondary/40 p-4">
              <opt.icon className="h-5 w-5 text-primary mb-2" />
              <p className="font-medium text-sm">{opt.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{opt.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Client contact info */}
      <div className="rounded-2xl border border-border p-6 space-y-4">
        <h3 className="font-semibold">Your contact info for the tour</h3>
        <div className="space-y-1.5 max-w-sm">
          <Label htmlFor="fallbackPhone">Phone / FaceTime number</Label>
          <div className="flex gap-2">
            <Input
              id="fallbackPhone"
              type="tel"
              placeholder="e.g. 555-123-4567"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setSaved(false); }}
            />
            <Button onClick={handleSave} disabled={saved || !phone}>
              {saved ? <><Check className="h-4 w-4 mr-1" /> Saved</> : "Save"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Your agent will call or FaceTime this number at tour time.</p>
        </div>

        <div className="space-y-1.5 max-w-sm">
          <Label htmlFor="zoomLink">Zoom link (optional)</Label>
          <div className="flex gap-2">
            <Input
              id="zoomLink"
              type="url"
              placeholder="https://zoom.us/j/..."
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
            />
            <Button variant="outline" onClick={handleCopyZoom} disabled={!zoomLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Share your Zoom meeting link and your agent will join.</p>
        </div>
      </div>
    </div>
  );
}
