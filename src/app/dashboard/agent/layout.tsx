import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";
import { CalendarDays, Clock, Home, User, Video } from "lucide-react";

const navItems = [
  { href: "/dashboard/agent", label: "My bookings", icon: CalendarDays },
  { href: "/dashboard/agent/availability", label: "Availability", icon: Clock },
  { href: "/dashboard/agent/listings", label: "My listings", icon: Home },
  { href: "/dashboard/agent/film-requests", label: "Film a tour", icon: Video },
  { href: "/dashboard/agent/profile", label: "Profile", icon: User },
];

export default async function AgentDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <DashboardShell title="Agent dashboard" navItems={navItems} userName={session?.user?.name}>
      {children}
    </DashboardShell>
  );
}
