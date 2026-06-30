import { prisma } from "@/lib/prisma";
import { AgentReviewCard } from "@/components/admin/agent-review-card";

export const dynamic = "force-dynamic";

export default async function AgentApplicationsPage() {
  const pending = await prisma.agentProfile.findMany({
    where: { status: "PENDING" },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Agent applications</h2>
        <p className="text-muted-foreground">Review and approve new tour partner applicants.</p>
      </div>

      {pending.length === 0 ? (
        <p className="text-muted-foreground">No pending applications.</p>
      ) : (
        <div className="space-y-4">
          {pending.map((a) => (
            <AgentReviewCard
              key={a.id}
              agent={{
                id: a.id,
                name: a.user.name ?? "Unknown",
                email: a.user.email,
                phone: a.user.phone,
                licenseNumber: a.licenseNumber,
                brokerage: a.brokerage,
                coverageArea: a.coverageArea,
                bio: a.bio,
                areasOfExpertise: a.areasOfExpertise,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
