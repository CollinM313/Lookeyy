import { prisma } from "@/lib/prisma";
import { ApprovalQueueCard } from "@/components/admin/approval-queue-card";
import type { MatchRationale } from "@/lib/smart-match";

export const dynamic = "force-dynamic";

export default async function ApprovalQueuePage() {
  const bookings = await prisma.booking.findMany({
    where: { status: "PENDING_ADMIN_APPROVAL" },
    include: { listing: true, client: true, suggestedAgent: { include: { user: true } } },
    orderBy: { createdAt: "asc" },
  });

  const allAgents = await prisma.agentProfile.findMany({
    where: { status: "APPROVED" },
    include: { user: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Smart-match approval queue</h2>
        <p className="text-muted-foreground">
          Review the system-suggested agent for each new tour request, then approve or override.
        </p>
      </div>

      {bookings.length === 0 ? (
        <p className="text-muted-foreground">Nothing pending — you&apos;re all caught up.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => (
            <ApprovalQueueCard
              key={b.id}
              booking={{
                id: b.id,
                listingTitle: b.listing.title,
                listingAddress: `${b.listing.address}, ${b.listing.city}, ${b.listing.state}`,
                clientName: b.client.name ?? b.contactName,
                tourType: b.tourType,
                scheduledAt: b.scheduledAt.toISOString(),
                suggestedAgentId: b.suggestedAgent?.id ?? null,
                suggestedAgentName: b.suggestedAgent?.user.name ?? null,
                rationale: (b.matchRationale as unknown as MatchRationale[] | null) ?? [],
              }}
              allAgents={allAgents.map((a) => ({ id: a.id, name: a.user.name ?? "Unnamed agent" }))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
