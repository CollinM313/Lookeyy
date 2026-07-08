import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { LayoutDashboard, ListChecks, Home, Users, UserCheck, KeyRound } from "lucide-react";

const navItems = [
  { href: "/dashboard/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/admin/bookings/queue", label: "Approval queue", icon: ListChecks },
  { href: "/dashboard/admin/bookings", label: "All bookings", icon: ListChecks },
  { href: "/dashboard/admin/listings", label: "Listings", icon: Home },
  { href: "/dashboard/admin/agents", label: "Agent applications", icon: UserCheck },
  { href: "/dashboard/admin/agents/all", label: "All agents", icon: Users },
  { href: "/dashboard/admin/password", label: "Change password", icon: KeyRound },
];

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <DashboardShell title="Admin dashboard" navItems={navItems} userName={session?.user?.name}>
      {children}
    </DashboardShell>
  );
}
