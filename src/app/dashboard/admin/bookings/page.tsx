import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { BOOKING_STATUS_LABELS, TOUR_TYPE_LABELS } from "@/lib/constants";
import { ReassignSelect } from "@/components/admin/reassign-select";

export const dynamic = "force-dynamic";

export default async function AllBookingsPage() {
  const [bookings, agents] = await Promise.all([
    prisma.booking.findMany({
      include: { listing: true, client: true, agent: true },
      orderBy: { scheduledAt: "desc" },
      take: 100,
    }),
    prisma.agentProfile.findMany({ where: { status: "APPROVED" }, include: { user: true } }),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">All bookings</h2>
      <div className="space-y-3">
        {bookings.map((b) => (
          <Card key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-medium">{b.listing.title}</p>
              <p className="text-sm text-muted-foreground">
                {b.client.name} &middot; {format(b.scheduledAt, "EEE, MMM d 'at' h:mm a")}
                {b.agent ? ` · Agent: ${b.agent.name}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{TOUR_TYPE_LABELS[b.tourType]}</Badge>
              <Badge>{BOOKING_STATUS_LABELS[b.status]}</Badge>
              {["CONFIRMED", "IN_PROGRESS"].includes(b.status) && (
                <ReassignSelect
                  bookingId={b.id}
                  currentAgentId={b.agentId}
                  agents={agents.map((a) => ({ id: a.userId, name: a.user.name ?? "Unnamed" }))}
                />
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
