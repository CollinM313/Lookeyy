"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cancelBooking, updateBookingStatus } from "@/app/actions/bookings";
import { Video } from "lucide-react";

export function BookingActions({
  bookingId,
  status,
  tourType,
  role,
}: {
  bookingId: string;
  status: string;
  tourType: string;
  role: "CLIENT" | "AGENT";
}) {
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setLoading(true);
    const r = await cancelBooking(bookingId);
    setLoading(false);
    if (r.error) toast.error(r.error);
    else toast.success("Booking cancelled.");
  }

  async function handleStatus(next: "IN_PROGRESS" | "COMPLETED" | "NO_SHOW") {
    setLoading(true);
    const r = await updateBookingStatus(bookingId, next);
    setLoading(false);
    if (r.error) toast.error(r.error);
    else toast.success("Status updated.");
  }

  return (
    <div className="flex items-center gap-2">
      {status === "CONFIRMED" && tourType === "LIVE" && (
        <Button asChild size="sm" variant="secondary">
          <Link href={`/tour/${bookingId}/call`}>
            <Video className="mr-1 h-3.5 w-3.5" /> Join call
          </Link>
        </Button>
      )}
      {role === "AGENT" && status === "CONFIRMED" && (
        <Button size="sm" variant="outline" disabled={loading} onClick={() => handleStatus("IN_PROGRESS")}>
          Start tour
        </Button>
      )}
      {role === "AGENT" && status === "IN_PROGRESS" && (
        <>
          <Button size="sm" disabled={loading} onClick={() => handleStatus("COMPLETED")}>
            Mark complete
          </Button>
          <Button size="sm" variant="outline" disabled={loading} onClick={() => handleStatus("NO_SHOW")}>
            No-show
          </Button>
        </>
      )}
      {["REQUESTED", "PENDING_ADMIN_APPROVAL", "CONFIRMED"].includes(status) && (
        <Button size="sm" variant="ghost" disabled={loading} onClick={handleCancel}>
          Cancel
        </Button>
      )}
    </div>
  );
}
