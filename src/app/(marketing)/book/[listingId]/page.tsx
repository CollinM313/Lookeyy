import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { BookingForm } from "@/components/booking-form";

export const dynamic = "force-dynamic";

export default async function BookTourPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { photos: { take: 1, orderBy: { order: "asc" } } },
  });
  if (!listing) notFound();

  const session = await auth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Request a tour</h1>
      <p className="mt-2 text-muted-foreground">
        {listing.title} &middot; {listing.address}, {listing.city}, {listing.state}
      </p>

      <div className="mt-8">
        <BookingForm
          listingId={listing.id}
          defaultName={session?.user?.name ?? ""}
          defaultEmail={session?.user?.email ?? ""}
          isSignedIn={!!session?.user}
        />
      </div>
    </div>
  );
}
