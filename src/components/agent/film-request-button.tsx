"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { requestToFilm } from "@/app/dashboard/agent/film-requests/actions";
import { Video, CheckCircle, Clock, XCircle } from "lucide-react";

type Props = {
  listingId: string;
  existingStatus: "PENDING" | "REJECTED" | null;
};

export function FilmRequestButton({ listingId, existingStatus }: Props) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (existingStatus === "PENDING") {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
        <Clock className="h-4 w-4 shrink-0" />
        Permission request sent — waiting for the listing agent to respond.
      </div>
    );
  }

  if (existingStatus === "REJECTED") {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <XCircle className="h-4 w-4 shrink-0" />
        Your request was declined. You can send a new request below if circumstances have changed.
        <button className="ml-auto underline" onClick={() => { setOpen(true); setSent(false); }}>
          Re-request
        </button>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
        <CheckCircle className="h-4 w-4 shrink-0" />
        Request sent — you'll be able to add your video once the listing agent approves.
      </div>
    );
  }

  return (
    <div className="mt-4">
      {open ? (
        <div className="rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
          <p className="text-sm font-medium">Request permission to film</p>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Briefly introduce yourself — e.g. 'Hi, I specialize in this area and would love to film a tour for this property.'"
            rows={3}
            className="text-sm"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={pending}
              onClick={() => {
                setError(null);
                startTransition(async () => {
                  const res = await requestToFilm(listingId, message);
                  if (res.error) setError(res.error);
                  else setSent(true);
                });
              }}
            >
              {pending ? "Sending…" : "Send request"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" className="mt-4" onClick={() => setOpen(true)}>
          <Video className="mr-1.5 h-4 w-4" /> Request permission to film
        </Button>
      )}
    </div>
  );
}
