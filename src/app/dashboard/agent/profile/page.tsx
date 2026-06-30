import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/profile-form";

export const dynamic = "force-dynamic";

export default async function AgentProfilePage() {
  const session = await auth();
  if (!session?.user) return null;

  const [user, agentProfile] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.agentProfile.findUnique({ where: { userId: session.user.id } }),
  ]);
  if (!user) return null;

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-2xl font-semibold">Profile</h2>
      <ProfileForm
        isAgent
        defaultValues={{
          name: user.name ?? "",
          phone: user.phone ?? "",
          bio: agentProfile?.bio ?? "",
          brokerage: agentProfile?.brokerage ?? "",
          coverageArea: agentProfile?.coverageArea ?? "",
        }}
      />
    </div>
  );
}
