"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { approveBookingMatch, rejectBookingMatch } from "@/app/actions/bookings";
import { TOUR_TYPE_LABELS } from "@/lib/constants";
import type { MatchRationale } from "@/lib/smart-match";

export function ApprovalQueueCard({
  booking,
  allAgents,
}: {
  booking: {
    id: string;
    listingTitle: string;
    listingAddress: string;
    clientName: string;
    tourType: string;
    scheduledAt: string;
    suggestedAgentId: string | null;
    suggestedAgentName: string | null;
    rationale: MatchRationale[];
  };
  allAgents: { id: string; name: string }[];
}) {
  const [selectedAgent, setSelectedAgent] = useState(booking.suggestedAgentId ?? "");
  const [loading, setLoading] = useState(false);

  async function handleApprove() {
    if (!selectedAgent) {
      toast.error("Select an agent first.");
      return;
    }
    setLoading(true);
    const result = await approveBookingMatch(booking.id, selectedAgent);
    setLoading(false);
    if (result.error) toast.error(result.error);
    else toast.success("Booking confirmed and agent notified.");
  }

  async function handleReject() {
    setLoading(true);
    const result = await rejectBookingMatch(booking.id, "No suitable agent — cancelled by admin");
    setLoading(false);
    if (result.error) toast.error(result.error);
    else toast.success("Booking cancelled.");
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{booking.listingTitle}</p>
          <p className="text-sm text-muted-foreground">{booking.listingAddress}</p>
          <p className="mt-1 text-sm">
            Client: <span className="font-medium">{booking.clientName}</span>
          </p>
        </div>
        <div className="text-right text-sm">
          <Badge variant="outline">{TOUR_TYPE_LABELS[booking.tourType]}</Badge>
          <p className="mt-1 text-muted-foreground">
            {format(new Date(booking.scheduledAt), "EEE, MMM d 'at' h:mm a")}
          </p>
        </div>
      </div>

      {booking.rationale.length > 0 && (
        <div className="mt-4 rounded-lg bg-secondary/50 p-3 text-sm">
          <p className="mb-2 font-medium text-muted-foreground">System-suggested matches</p>
          <ul className="space-y-1">
            {booking.rationale.map((r) => (
              <li key={r.agentId} className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-medium">{r.agentName}</span>
                <span className="text-muted-foreground">score {r.score}</span>
                <span className="text-muted-foreground">{r.distanceMiles}mi away</span>
                <span className="text-muted-foreground">{r.activeLoad} active tours</span>
                <span className="text-muted-foreground">★ {r.ratingAvg.toFixed(1)}</span>
                {r.availabilityMatch && <Badge variant="secondary">Available</Badge>}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-48 flex-1">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Assign agent</p>
          <Select value={selectedAgent} onValueChange={(v) => setSelectedAgent(v ?? "")}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose an agent" />
            </SelectTrigger>
            <SelectContent>
              {allAgents.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                  {a.id === booking.suggestedAgentId ? " (suggested)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleApprove} disabled={loading}>
          Approve & confirm
        </Button>
        <Button onClick={handleReject} variant="outline" disabled={loading}>
          Cancel request
        </Button>
      </div>
    </Card>
  );
}
