import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const dashboardPathForRole: Record<string, string> = {
  CLIENT: "/dashboard/client",
  AGENT: "/dashboard/agent",
  ADMIN: "/dashboard/admin",
};

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Home className="h-4 w-4" />
          </span>
          Lookeyy
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/listings" className="hover:text-foreground transition-colors">
            Browse homes
          </Link>
          <Link href="/become-a-partner" className="hover:text-foreground transition-colors">
            Become a tour partner
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href={dashboardPathForRole[session.user.role] ?? "/dashboard/client"}>
                  Dashboard
                </Link>
              </Button>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <Button variant="outline" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/listings">Find a home</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
