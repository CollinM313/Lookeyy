"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { reviewFilmRequest } from "@/app/dashboard/agent/film-requests/actions";
import { CheckCircle, XCircle, Clock } from "lucide-react";

type FilmRequest = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  message: string | null;
  requestingAgent: { name: string | null; email: string };
};

export function IncomingFilmRequests({ requests }: { requests: FilmRequest[] }) {
  if (requests.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-border bg-secondary/30 p-4 space-y-3">
      <p className="text-sm font-medium">Film requests from other agents</p>
      <div className="flex flex-col gap-3">
        {requests.map((r) => (
          <FilmRequestRow key={r.id} request={r} />
        ))}
      </div>
    </div>
  );
}

function FilmRequestRow({ request: r }: { request: FilmRequest }) {
  const [pending, startTransition] = useTransition();

  function review(action: "APPROVED" | "REJECTED") {
    startTransition(() => reviewFilmRequest(r.id, action));
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium">{r.requestingAgent.name ?? r.requestingAgent.email}</p>
          <p className="text-xs text-muted-foreground">{r.requestingAgent.email}</p>
          {r.message && (
            <p className="mt-1.5 text-sm text-muted-foreground">&ldquo;{r.message}&rdquo;</p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {r.status === "PENDING" ? (
            <>
              <Button
                size="sm"
                className="h-7 text-xs"
                disabled={pending}
                onClick={() => review("APPROVED")}
              >
                <CheckCircle className="mr-1 h-3.5 w-3.5" /> Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs"
                disabled={pending}
                onClick={() => review("REJECTED")}
              >
                <XCircle className="mr-1 h-3.5 w-3.5" /> Decline
              </Button>
            </>
          ) : r.status === "APPROVED" ? (
            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
              <CheckCircle className="h-3.5 w-3.5" /> Approved
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <XCircle className="h-3.5 w-3.5" /> Declined
            </span>
          )}
        </div>
      </div>
      {r.status === "PENDING" && (
        <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" /> Waiting for your response
        </p>
      )}
    </div>
  );
}
