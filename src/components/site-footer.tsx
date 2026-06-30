import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-semibold text-lg">Lookeyy</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Tour any home from your couch — live or recorded video tours with local agents.
            </p>
          </div>
          <div>
            <p className="font-medium text-sm mb-3">Explore</p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/listings" className="hover:text-foreground">Browse homes</Link></li>
              <li><Link href="/become-a-partner" className="hover:text-foreground">Become a tour partner</Link></li>
              <li><Link href="/sign-in" className="hover:text-foreground">Sign in</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-medium text-sm mb-3">Lookeyy</p>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Lookeyy. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
