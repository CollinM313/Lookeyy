import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrowseListingsClient, type DbVideoTour } from "@/components/browse-listings-client";
import { getAllListings } from "@/lib/idx-broker";
import { prisma } from "@/lib/prisma";
import { extractYouTubeId } from "@/lib/youtube";
import { Star, ShieldCheck, Users, CalendarCheck, Home as HomeIcon, Video } from "lucide-react";

export default async function HomePage() {
  const [listings, dbListingsWithVideo] = await Promise.all([
    getAllListings().catch(() => []),
    prisma.listing.findMany({
      where: { videoUrl: { not: null } },
      select: {
        id: true, title: true, address: true, city: true, state: true,
        price: true, beds: true, baths: true, videoUrl: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const dbVideos: DbVideoTour[] = dbListingsWithVideo
    .map((l) => ({ ...l, videoId: extractYouTubeId(l.videoUrl!) }))
    .filter((l): l is DbVideoTour => l.videoId !== null);

  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <div className="border-b border-border px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-[1600px]">
          <h1 className="text-2xl font-bold sm:text-3xl">The smarter way to home shop</h1>
          <p className="mt-1 text-muted-foreground">
            Browse agent-filmed video tours, explore listings on the map, and request a live or recorded tour — all before stepping foot inside.
          </p>
        </div>
      </div>

      {/* ── Browse: filter pills + feed + map ── */}
      <BrowseListingsClient listings={listings} dbVideos={dbVideos} />

      {/* ── How it works ── */}
      <section className="border-y border-border/70 bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold">How Lookeyy works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: HomeIcon,
                title: "1. Browse tours",
                body: "Scroll through real agent-filmed video tours and see every room before you ever set foot inside.",
              },
              {
                icon: Video,
                title: "2. Request your tour",
                body: "Like what you see? Request a live video walkthrough or a custom recorded tour — on your schedule.",
              },
              {
                icon: CalendarCheck,
                title: "3. Meet your agent",
                body: "A vetted local agent walks you through the home, answers your questions, and helps you make an offer.",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-border bg-card p-6 text-center shadow-sm"
              >
                <step.icon className="mx-auto h-8 w-8 text-primary" />
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Agent CTA ── */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Users className="mx-auto h-10 w-10" />
          <h2 className="mt-4 text-3xl font-bold">Are you a local real estate agent?</h2>
          <p className="mt-3 text-primary-foreground/90">
            Join Lookeyy as a tour partner — get matched with motivated buyers and conduct tours on your schedule.
          </p>
          <Button asChild size="lg" variant="secondary" className="mt-6">
            <Link href="/become-a-partner">Apply to become a partner</Link>
          </Button>
        </div>
      </section>

      {/* ── Testimonials ── */}
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
              <div
                key={t.name}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm"
              >
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
