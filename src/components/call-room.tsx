"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PhoneCall, Video, Check, ExternalLink } from "lucide-react";
import { setFallbackPhone, setZoomLink } from "@/app/actions/video-call";

export function CallRoom({
  bookingId,
  fallbackPhone,
  agentPhone,
  agentName,
  clientName,
  clientPhone,
  meetingLink,
  isAgent,
}: {
  bookingId: string;
  fallbackPhone: string | null;
  agentPhone?: string | null;
  agentName?: string | null;
  clientName?: string | null;
  clientPhone?: string | null;
  meetingLink?: string | null;
  isAgent: boolean;
}) {
  const [phone, setPhone] = useState(fallbackPhone ?? "");
  const [phoneSaved, setPhoneSaved] = useState(false);
  const [zoom, setZoom] = useState(meetingLink ?? "");
  const [zoomSaved, setZoomSaved] = useState(false);

  async function handleSavePhone() {
    const r = await setFallbackPhone(bookingId, phone);
    if (r.error) toast.error(r.error);
    else { setPhoneSaved(true); toast.success("Phone number saved."); }
  }

  async function handleSaveZoom() {
    const r = await setZoomLink(bookingId, zoom);
    if (r.error) toast.error(r.error);
    else { setZoomSaved(true); toast.success("Meeting link saved. Your client can now see it."); }
  }

  return (
    <div className="space-y-6">

      {/* Meeting link — agent sets it, client sees it */}
      <div className="rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <Video className="h-5 w-5" />
          <h3 className="font-semibold text-lg">Meeting link</h3>
        </div>

        {isAgent ? (
          <div className="space-y-2 max-w-lg">
            <p className="text-sm text-muted-foreground">
              Paste your Zoom, Google Meet, or FaceTime link below. Your client will see a button to join at tour time.
            </p>
            <Label htmlFor="zoomLink">Your meeting link</Label>
            <div className="flex gap-2">
              <Input
                id="zoomLink"
                type="url"
                placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                value={zoom}
                onChange={(e) => { setZoom(e.target.value); setZoomSaved(false); }}
              />
              <Button onClick={handleSaveZoom} disabled={zoomSaved || !zoom}>
                {zoomSaved ? <><Check className="h-4 w-4 mr-1" /> Saved</> : "Save"}
              </Button>
            </div>
            {zoomSaved && (
              <p className="text-sm text-green-600">Your client can now see and join the meeting.</p>
            )}
          </div>
        ) : (
          <div>
            {zoom ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Your agent has set up a meeting link. Click below to join at your scheduled tour time.
                </p>
                <Button asChild size="lg">
                  <a href={zoom} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" /> Join meeting
                  </a>
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Your agent hasn&apos;t added a meeting link yet. Check back closer to your tour time, or they may contact you directly.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Contact info */}
      <div className="rounded-2xl border border-border p-6 space-y-4">
        <div className="flex items-center gap-2 text-primary">
          <PhoneCall className="h-5 w-5" />
          <h3 className="font-semibold text-lg">
            {isAgent ? "Client contact info" : "Your contact info"}
          </h3>
        </div>

        {isAgent ? (
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Client: <span className="font-medium text-foreground">{clientName ?? "—"}</span>
            </p>
            {clientPhone ? (
              <p className="text-sm text-muted-foreground">
                Phone / FaceTime: <span className="font-medium text-foreground">{clientPhone}</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Client hasn&apos;t added a phone number yet.</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {agentName && (
              <p className="text-sm text-muted-foreground">
                Agent: <span className="font-medium text-foreground">{agentName}</span>
                {agentPhone && <> · <span className="font-medium text-foreground">{agentPhone}</span></>}
              </p>
            )}
            <div className="space-y-1.5 max-w-sm">
              <Label htmlFor="fallbackPhone">Your phone / FaceTime number</Label>
              <div className="flex gap-2">
                <Input
                  id="fallbackPhone"
                  type="tel"
                  placeholder="e.g. 555-123-4567"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); setPhoneSaved(false); }}
                />
                <Button onClick={handleSavePhone} disabled={phoneSaved || !phone}>
                  {phoneSaved ? <><Check className="h-4 w-4 mr-1" /> Saved</> : "Save"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Your agent will use this as a backup if the meeting link doesn&apos;t work.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
