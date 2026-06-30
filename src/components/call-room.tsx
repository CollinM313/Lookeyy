"use client";

import { useEffect, useRef, useState } from "react";
import { getOrCreateCallRoom, setFallbackPhone } from "@/app/actions/video-call";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { PhoneCall, Video } from "lucide-react";

type CallState =
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "error"; message: string }
  | { status: "ready"; roomUrl: string; token: string | null };

export function CallRoom({ bookingId, fallbackPhone }: { bookingId: string; fallbackPhone: string | null }) {
  const [state, setState] = useState<CallState>({ status: "loading" });
  const [phone, setPhone] = useState(fallbackPhone ?? "");
  const frameRef = useRef<HTMLDivElement>(null);
  const callObjectRef = useRef<unknown>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await getOrCreateCallRoom(bookingId);
      if (cancelled) return;
      if ("error" in result && result.error) {
        setState({ status: "error", message: result.error });
        return;
      }
      if ("configured" in result && !result.configured) {
        setState({ status: "unconfigured" });
        return;
      }
      if ("roomUrl" in result && result.roomUrl) {
        setState({ status: "ready", roomUrl: result.roomUrl, token: result.token ?? null });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  useEffect(() => {
    if (state.status !== "ready" || !frameRef.current) return;

    let destroyed = false;
    import("@daily-co/daily-js").then(({ default: DailyIframe }) => {
      if (destroyed || !frameRef.current) return;
      const callFrame = DailyIframe.createFrame(frameRef.current, {
        iframeStyle: { width: "100%", height: "100%", border: "0", borderRadius: "1rem" },
        showLeaveButton: true,
      });
      callObjectRef.current = callFrame;
      callFrame.join({ url: state.roomUrl, token: state.token ?? undefined });
    });

    return () => {
      destroyed = true;
      const frame = callObjectRef.current as { destroy?: () => void } | null;
      frame?.destroy?.();
    };
  }, [state]);

  async function handleSavePhone() {
    const r = await setFallbackPhone(bookingId, phone);
    if (r.error) toast.error(r.error);
    else toast.success("We'll coordinate a call to this number.");
  }

  if (state.status === "loading") {
    return <div className="flex h-96 items-center justify-center text-muted-foreground">Connecting…</div>;
  }

  if (state.status === "error") {
    return <div className="flex h-96 items-center justify-center text-destructive">{state.message}</div>;
  }

  if (state.status === "unconfigured") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8">
        <div className="flex items-center gap-2 text-primary">
          <Video className="h-5 w-5" />
          <p className="font-semibold">Live video isn&apos;t configured yet</p>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          This is the integration point for in-app live video. Set <code className="rounded bg-muted px-1">DAILY_API_KEY</code> (and
          optionally <code className="rounded bg-muted px-1">NEXT_PUBLIC_DAILY_DOMAIN</code>) in your environment to enable
          embedded Daily.co video calls here — see the README for setup steps.
        </p>

        <div className="mt-6 rounded-xl bg-secondary/50 p-5">
          <div className="flex items-center gap-2">
            <PhoneCall className="h-4 w-4 text-primary" />
            <p className="font-medium">In the meantime: schedule a phone / FaceTime call</p>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Leave a number and your agent will call or FaceTime you at the scheduled time.
          </p>
          <div className="mt-3 flex max-w-sm items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label htmlFor="fallbackPhone">Phone number</Label>
              <Input id="fallbackPhone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <Button onClick={handleSavePhone}>Save</Button>
          </div>
        </div>
      </div>
    );
  }

  return <div ref={frameRef} className="h-[70vh] w-full overflow-hidden rounded-2xl bg-black" />;
}
