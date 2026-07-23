import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IdxListingCard } from "@/components/idx-listing-card";
import { VideoTourSection, type FeaturedVideo } from "@/components/video-tour-section";
import { ListingsMap, type MapListing } from "@/components/listings-map";
import { getAllListings } from "@/lib/idx-broker";
import { Star, ShieldCheck, Users, CalendarCheck, Home as HomeIcon, Video } from "lucide-react";

const FEATURED_VIDEOS: FeaturedVideo[] = [
  {
    youtubeId: "F7afbjxVYCY",
    title: "649 Saint Moritz Dr",
    address: "649 Saint Moritz Dr",
    city: "Big Bear Lake",
    state: "CA",
    description:
      "A stunning mountain retreat in Big Bear Lake. Watch the full agent-guided walkthrough and see every room, the views, and the neighborhood — no trip required.",
  },
];

export default async function HomePage() {
  const allListings = await getAllListings().catch(() => []);

  const mapListings: MapListing[] = allListings
    .filter((l) => l.latitude && l.longitude)
    .slice(0, 150)
    .map((l) => ({
      idxID: l.idxID,
      listingID: l.listingID,
      address: l.address,
      cityName: l.cityName,
      state: l.state,
      latitude: l.latitude,
      longitude: l.longitude,
      listingPrice: l.listingPrice,
      bedrooms: l.bedrooms,
      totalBaths: l.totalBaths,
    }));

  const featuredListings = allListings.slice(0, 6);

  return (
    <div>
      {/* ── Video Tours Hero ── */}
      <VideoTourSection videos={FEATURED_VIDEOS} />

      {/* ── Interactive Map ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1">
            <h2 className="text-3xl font-bold">Explore homes near you</h2>
            <p className="text-muted-foreground">
              Click any pin to see listing details and request a video tour
            </p>
          </div>
          <div className="mt-6 h-[480px] overflow-hidden rounded-2xl border border-border shadow-sm">
            <ListingsMap listings={mapListings} />
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="border-y border-border/70 bg-secondary/40 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold">How Lookeyy works</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-3">
            {[
              {
                icon: HomeIcon,
                title: "1. Watch a home tour",
                body: "Browse real agent-filmed video tours and see every room before you ever set foot inside.",
              },
              {
                icon: Video,
                title: "2. Request your tour",
                body: "Like what you see? Request a live FaceTime-style walkthrough or a custom recorded tour.",
              },
              {
                icon: CalendarCheck,
                title: "3. Meet your agent",
                body: "A vetted local agent walks you through the home — live or on video — on your schedule.",
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

      {/* ── Featured Listings ── */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <h2 className="text-3xl font-bold">Featured homes</h2>
            <Button asChild variant="ghost">
              <Link href="/listings">View all &rarr;</Link>
            </Button>
          </div>

          {featuredListings.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredListings.map((l) => (
                <IdxListingCard key={`${l.idxID}-${l.listingID}`} listing={l} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-border py-12 text-center text-muted-foreground">
              <p>Listings loading — check back shortly.</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/listings">Browse all listings</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* ── Agent CTA ── */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <Users className="mx-auto h-10 w-10" />
          <h2 className="mt-4 text-3xl font-bold">Are you a local real estate agent?</h2>
          <p className="mt-3 text-primary-foreground/90">
            Join Lookeyy as a tour partner — get matched with motivated buyers and conduct tours
            on your schedule.
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
