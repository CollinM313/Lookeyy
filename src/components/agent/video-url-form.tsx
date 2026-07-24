"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateListingVideoUrl } from "@/app/dashboard/agent/listings/actions";
import { extractYouTubeId, youTubeThumbnail } from "@/lib/youtube";
import { Play, Trash2, CheckCircle, AlertCircle } from "lucide-react";

type Props = {
  listingId: string;
  currentVideoUrl: string | null;
};

export function VideoUrlForm({ listingId, currentVideoUrl }: Props) {
  const [url, setUrl] = useState(currentVideoUrl ?? "");
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const previewId = extractYouTubeId(url);

  function handleSave() {
    setStatus(null);
    startTransition(async () => {
      const result = await updateListingVideoUrl(listingId, url);
      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: "Video saved — it will appear on the browse page." });
      }
    });
  }

  function handleRemove() {
    setUrl("");
    setStatus(null);
    startTransition(async () => {
      await updateListingVideoUrl(listingId, "");
      setStatus({ type: "success", message: "Video removed." });
    });
  }

  return (
    <div className="mt-4 space-y-3 rounded-xl border border-border bg-secondary/30 p-4">
      <p className="text-sm font-medium">Tour video</p>

      {/* Thumbnail preview */}
      {previewId && (
        <div className="relative aspect-video w-full max-w-xs overflow-hidden rounded-lg bg-black">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={youTubeThumbnail(previewId)}
            alt="Video preview"
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow">
              <Play className="h-4 w-4 translate-x-0.5 text-zinc-900" fill="currentColor" />
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={url}
          onChange={(e) => { setUrl(e.target.value); setStatus(null); }}
          placeholder="https://www.youtube.com/watch?v=..."
          className="flex-1 text-sm"
        />
        <Button size="sm" onClick={handleSave} disabled={pending}>
          {pending ? "Saving…" : "Save"}
        </Button>
        {currentVideoUrl && (
          <Button size="sm" variant="ghost" onClick={handleRemove} disabled={pending} aria-label="Remove video">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>

      {status && (
        <p className={`flex items-center gap-1.5 text-xs ${status.type === "error" ? "text-destructive" : "text-green-600"}`}>
          {status.type === "error"
            ? <AlertCircle className="h-3.5 w-3.5" />
            : <CheckCircle className="h-3.5 w-3.5" />}
          {status.message}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Paste any YouTube link — youtube.com/watch?v=… or youtu.be/… both work.
      </p>
    </div>
  );
}
