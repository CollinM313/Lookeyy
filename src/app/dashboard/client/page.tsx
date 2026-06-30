import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Link from "next/link";
import { BOOKING_STATUS_LABELS, TOUR_TYPE_LABELS } from "@/lib/constants";
import { BookingActions } from "@/components/booking-actions";
import { ReviewForm } from "@/components/review-form";

export const dynamic = "force-dynamic";

export default async function ClientBookingsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const bookings = await prisma.booking.findMany({
    where: { clientId: session.user.id },
    include: { listing: true, agent: true, review: true },
    orderBy: { scheduledAt: "desc" },
  });

  const upcoming = bookings.filter((b) => ["REQUESTED", "PENDING_ADMIN_APPROVAL", "CONFIRMED", "IN_PROGRESS"].includes(b.status));
  const past = bookings.filter((b) => ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(b.status));

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-2xl font-semibold">Upcoming tours</h2>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-muted-foreground">
            No upcoming tours. <Link href="/listings" className="text-primary hover:underline">Browse homes</Link> to request one.
          </p>
        ) : (
          <div className="mt-3 space-y-3">
            {upcoming.map((b) => (
              <Card key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link href={`/listings/${b.listingId}`} className="font-medium hover:underline">
                    {b.listing.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {format(b.scheduledAt, "EEE, MMM d 'at' h:mm a")}
                    {b.agent ? ` · Agent: ${b.agent.name}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{TOUR_TYPE_LABELS[b.tourType]}</Badge>
                  <Badge>{BOOKING_STATUS_LABELS[b.status]}</Badge>
                  <BookingActions bookingId={b.id} status={b.status} tourType={b.tourType} role="CLIENT" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold">Past tours</h2>
        {past.length === 0 ? (
          <p className="mt-3 text-muted-foreground">No past tours yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {past.map((b) => (
              <Card key={b.id} className="space-y-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <Link href={`/listings/${b.listingId}`} className="font-medium hover:underline">
                      {b.listing.title}
                    </Link>
                    <p className="text-sm text-muted-foreground">{format(b.scheduledAt, "EEE, MMM d 'at' h:mm a")}</p>
                  </div>
                  <Badge variant="outline">{BOOKING_STATUS_LABELS[b.status]}</Badge>
                </div>
                {b.status === "COMPLETED" && !b.review && <ReviewForm bookingId={b.id} />}
                {b.review && <p className="text-sm text-muted-foreground">You rated this tour {b.review.rating}/5.</p>}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
