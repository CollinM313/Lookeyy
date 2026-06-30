import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { BOOKING_STATUS_LABELS, TOUR_TYPE_LABELS } from "@/lib/constants";
import { BookingActions } from "@/components/booking-actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AgentBookingsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const profile = await prisma.agentProfile.findUnique({ where: { userId: session.user.id } });

  if (profile?.status !== "APPROVED") {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
        Your tour partner application is {profile?.status.toLowerCase() ?? "pending"} review. We&apos;ll email
        you once it&apos;s approved.
      </div>
    );
  }

  const bookings = await prisma.booking.findMany({
    where: { agentId: session.user.id },
    include: { listing: true, client: true },
    orderBy: { scheduledAt: "asc" },
  });

  const stats = {
    upcoming: bookings.filter((b) => ["CONFIRMED", "IN_PROGRESS"].includes(b.status)).length,
    completed: bookings.filter((b) => b.status === "COMPLETED").length,
    tourCount: profile.tourCount,
    rating: profile.ratingAvg,
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="p-4"><p className="text-xs text-muted-foreground">Upcoming</p><p className="text-2xl font-semibold">{stats.upcoming}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Completed</p><p className="text-2xl font-semibold">{stats.completed}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Total tours</p><p className="text-2xl font-semibold">{stats.tourCount}</p></Card>
        <Card className="p-4"><p className="text-xs text-muted-foreground">Rating</p><p className="text-2xl font-semibold">★ {stats.rating.toFixed(1)}</p></Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold">My bookings</h2>
        {bookings.length === 0 ? (
          <p className="mt-3 text-muted-foreground">No bookings assigned yet.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {bookings.map((b) => (
              <Card key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <Link href={`/listings/${b.listingId}`} className="font-medium hover:underline">
                    {b.listing.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {b.client.name} &middot; {format(b.scheduledAt, "EEE, MMM d 'at' h:mm a")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{TOUR_TYPE_LABELS[b.tourType]}</Badge>
                  <Badge>{BOOKING_STATUS_LABELS[b.status]}</Badge>
                  <BookingActions bookingId={b.id} status={b.status} tourType={b.tourType} role="AGENT" />
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
