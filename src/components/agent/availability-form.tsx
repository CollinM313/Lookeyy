"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateAvailability } from "@/app/actions/agents";
import { useRouter } from "next/navigation";

export function AvailabilityForm({ agentProfileId }: { agentProfileId: string }) {
  const router = useRouter();
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      toast.error("Fill out all fields.");
      return;
    }
    setLoading(true);
    const r = await updateAvailability(agentProfileId, [{ date, startTime, endTime }]);
    setLoading(false);
    if (r.error) {
      toast.error(r.error);
      return;
    }
    toast.success("Slot added.");
    setDate("");
    setStartTime("");
    setEndTime("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="date">Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="startTime">Start</Label>
        <Input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="endTime">End</Label>
        <Input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading}>Add slot</Button>
    </form>
  );
}
