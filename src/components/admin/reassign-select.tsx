"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { reassignBooking } from "@/app/actions/bookings";

export function ReassignSelect({
  bookingId,
  currentAgentId,
  agents,
}: {
  bookingId: string;
  currentAgentId: string | null;
  agents: { id: string; name: string }[];
}) {
  async function handleChange(value: string | null) {
    if (!value || value === currentAgentId) return;
    const r = await reassignBooking(bookingId, value);
    if (r.error) toast.error(r.error);
    else toast.success("Booking reassigned.");
  }

  return (
    <Select value={currentAgentId ?? ""} onValueChange={handleChange}>
      <SelectTrigger className="w-44">
        <SelectValue placeholder="Reassign…" />
      </SelectTrigger>
      <SelectContent>
        {agents.map((a) => (
          <SelectItem key={a.id} value={a.id}>
            {a.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
