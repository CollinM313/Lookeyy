import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { CalendarDays, Heart, User } from "lucide-react";

const navItems = [
  { href: "/dashboard/client", label: "My tours", icon: CalendarDays },
  { href: "/dashboard/client/favorites", label: "Saved homes", icon: Heart },
  { href: "/dashboard/client/profile", label: "Profile", icon: User },
];

export default async function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <DashboardShell title="Client dashboard" navItems={navItems} userName={session?.user?.name}>
      {children}
    </DashboardShell>
  );
}
