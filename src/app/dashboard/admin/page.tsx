import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { startOfWeek } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const weekStart = startOfWeek(new Date());

  const [bookingsThisWeek, totalBookings, completedBookings, activeAgents, pendingApplications, pendingApprovals] =
    await Promise.all([
      prisma.booking.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: "COMPLETED" } }),
      prisma.agentProfile.count({ where: { status: "APPROVED" } }),
      prisma.agentProfile.count({ where: { status: "PENDING" } }),
      prisma.booking.count({ where: { status: "PENDING_ADMIN_APPROVAL" } }),
    ]);

  const conversionRate = totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 0;

  const stats = [
    { label: "Bookings this week", value: bookingsThisWeek },
    { label: "Conversion rate", value: `${conversionRate}%` },
    { label: "Active agents", value: activeAgents },
    { label: "Pending applications", value: pendingApplications },
    { label: "Awaiting match approval", value: pendingApprovals },
    { label: "Total bookings", value: totalBookings },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Overview</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-1 text-3xl font-semibold">{s.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
