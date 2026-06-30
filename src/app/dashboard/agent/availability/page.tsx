import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { AvailabilityForm } from "@/components/agent/availability-form";
import { Card } from "@/components/ui/card";
import { DeleteSlotButton } from "@/components/agent/delete-slot-button";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const session = await auth();
  if (!session?.user) return null;

  const profile = await prisma.agentProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) return <p className="text-muted-foreground">Complete your agent application first.</p>;

  const slots = await prisma.availability.findMany({
    where: { agentId: profile.id, date: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    orderBy: { date: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Availability</h2>
        <p className="text-muted-foreground">Add time slots when you&apos;re available to conduct tours.</p>
      </div>

      <Card className="p-5">
        <AvailabilityForm agentProfileId={profile.id} />
      </Card>

      <div className="space-y-2">
        {slots.length === 0 ? (
          <p className="text-muted-foreground">No upcoming availability added yet.</p>
        ) : (
          slots.map((s) => (
            <Card key={s.id} className="flex items-center justify-between p-3 px-4">
              <p className="text-sm">
                {format(s.date, "EEE, MMM d")} &middot; {s.startTime}–{s.endTime}
                {s.isBooked && <span className="ml-2 text-xs text-muted-foreground">(booked)</span>}
              </p>
              {!s.isBooked && <DeleteSlotButton slotId={s.id} />}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
