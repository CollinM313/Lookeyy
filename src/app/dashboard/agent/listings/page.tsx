import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { MapPin, BedDouble, Bath } from "lucide-react";
import { VideoUrlForm } from "@/components/agent/video-url-form";
import { IncomingFilmRequests } from "@/components/agent/incoming-film-requests";

export const dynamic = "force-dynamic";

export default async function AgentListingsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const listings = await prisma.listing.findMany({
    where: { agentId: session.user.id },
    include: {
      photos: { take: 1, orderBy: { order: "asc" } },
      videoRequests: {
        where: { ownerAgentId: session.user.id },
        include: { requestingAgent: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">My listings</h2>
        <p className="text-muted-foreground">
          Add a YouTube tour video to any listing — it will appear on the public browse page.
        </p>
      </div>

      {listings.length === 0 ? (
        <p className="text-muted-foreground">No listings assigned to you yet.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {listings.map((l) => (
            <div key={l.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                {l.photos[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={l.photos[0].url}
                    alt={l.title}
                    className="h-20 w-28 flex-none rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-28 flex-none items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                    No photo
                  </div>
                )}

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{l.title}</p>
                    <Badge variant="outline">{l.status}</Badge>
                    {l.videoUrl && (
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        Video added
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" /> {l.address}, {l.city}, {l.state}
                  </p>
                  <p className="mt-1 text-sm font-medium">
                    ${l.price.toLocaleString()}
                    <span className="ml-3 font-normal text-muted-foreground">
                      <BedDouble className="mr-1 inline h-3.5 w-3.5" />{l.beds} bd
                      <Bath className="ml-2 mr-1 inline h-3.5 w-3.5" />{l.baths} ba
                    </span>
                  </p>
                </div>
              </div>

              <IncomingFilmRequests requests={l.videoRequests} />
              <VideoUrlForm listingId={l.id} currentVideoUrl={l.videoUrl} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
