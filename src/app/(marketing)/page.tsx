import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listing-card";
import { prisma } from "@/lib/prisma";
import { Video, CalendarCheck, Home as HomeIcon, Star, ShieldCheck, Users } from "lucide-react";

async function getFeaturedListings() {
  try {
    const listings = await prisma.listing.findMany({
      where: { status: "AVAILABLE" },
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { photos: { take: 1, orderBy: { order: "asc" } } },
    });
    return listings.map((l) => ({
      id: l.id,
      title: l.title,
      city: l.city,
      state: l.state,
      price: l.price,
      beds: l.beds,
      baths: l.baths,
      sqft: l.sqft,
      propertyType: l.propertyType,
      status: l.status,
      photoUrl: l.photos[0]?.url ?? null,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const listings = await getFeaturedListings();

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24 lg:px-8">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground">
              <Video className="h-4 w-4" /> Live & recorded video tours
            </span>
            <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Tour any home from your couch.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Request a live FaceTime-style walkthrough or a recorded guided tour from a local
              agent — no open houses, no wasted trips, just the homes you actually want to see.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/listings">Browse homes</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/become-a-partner">Become a tour partner</Link>
              </Button>
            </div>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop"
              alt="Modern home exterior"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y border-border/70 bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold">How Lookeyy works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: HomeIcon,
                title: "1. Pick a home",
                body: "Browse listings and find a property you'd like to see in person — virtually.",
              },
              {
                icon: CalendarCheck,
                title: "2. Request a tour",
                body: "Choose a live video call or a recorded walkthrough, and pick a time that works.",
              },
              {
                icon: Video,
                title: "3. Meet your agent",
                body: "A local, vetted agent gives you the full tour — questions answered in real time.",
              },
            ].map((step) => (
              <div key={step.title} className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
                <step.icon className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-4 font-semibold text-lg">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured listings */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold">Featured homes</h2>
            <Button asChild variant="ghost">
              <Link href="/listings">View all &rarr;</Link>
            </Button>
          </div>
          {listings.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <p className="mt-8 text-muted-foreground">
              No listings yet — seed the database to populate this section.
            </p>
          )}
        </div>
      </section>

      {/* Agent CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Users className="mx-auto h-10 w-10" />
          <h2 className="mt-4 text-3xl font-bold">Are you a local real estate agent?</h2>
          <p className="mt-3 text-primary-foreground/90">
            Join Lookeyy as a tour partner — get matched with motivated buyers and renters in
            your coverage area and conduct tours on your schedule.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link href="/become-a-partner">Apply to become a partner</Link>
          </Button>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold">Loved by home seekers</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              {
                name: "Maya R.",
                quote: "I toured 5 homes in one afternoon without leaving my apartment. Game changer.",
              },
              {
                name: "Devon P.",
                quote: "The live video call let me ask the agent to check water pressure on the spot.",
              },
              {
                name: "Sarah K.",
                quote: "Relocating from out of state was so much less stressful with Lookeyy tours.",
              },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex gap-1 text-primary">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="mt-3 text-sm text-muted-foreground">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="h-4 w-4 text-primary" /> {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
