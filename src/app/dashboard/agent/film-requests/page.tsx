import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { MapPin, BedDouble, Bath } from "lucide-react";
import { FilmRequestButton } from "@/components/agent/film-request-button";
import { VideoUrlForm } from "@/components/agent/video-url-form";

export const dynamic = "force-dynamic";

export default async function FilmRequestsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const [allListings, myRequests] = await Promise.all([
    prisma.listing.findMany({
      where: { agentId: { not: session.user.id } },
      include: { photos: { take: 1, orderBy: { order: "asc" } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.videoTourRequest.findMany({
      where: { requestingAgentId: session.user.id },
      select: { listingId: true, status: true, id: true },
    }),
  ]);

  const requestMap = new Map(myRequests.map((r) => [r.listingId, r]));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Film a tour</h2>
        <p className="text-muted-foreground">
          Request permission to film a video tour for any listing. Once the listing agent approves, you can add your YouTube video.
        </p>
      </div>

      {allListings.length === 0 ? (
        <p className="text-muted-foreground">No other listings available right now.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {allListings.map((l) => {
            const req = requestMap.get(l.id);
            return (
              <div key={l.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-start gap-4">
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
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{l.title}</p>
                      <Badge variant="outline">{l.status}</Badge>
                      {req && (
                        <Badge
                          className={
                            req.status === "APPROVED"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : req.status === "REJECTED"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : "bg-yellow-100 text-yellow-700 border-yellow-200"
                          }
                        >
                          {req.status === "APPROVED" ? "Approved to film" : req.status === "REJECTED" ? "Request declined" : "Request pending"}
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

                {req?.status === "APPROVED" ? (
                  <VideoUrlForm listingId={l.id} currentVideoUrl={l.videoUrl} />
                ) : (
                  <FilmRequestButton
                    listingId={l.id}
                    existingStatus={req?.status ?? null}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
