import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ListingForm } from "@/components/admin/listing-form";
import { updateListing } from "@/app/actions/listings";

export const dynamic = "force-dynamic";

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [listing, agentProfiles] = await Promise.all([
    prisma.listing.findUnique({ where: { id }, include: { photos: { orderBy: { order: "asc" } } } }),
    prisma.agentProfile.findMany({ where: { status: "APPROVED" }, include: { user: true } }),
  ]);
  if (!listing) notFound();

  async function action(formData: FormData) {
    "use server";
    await updateListing(id, formData);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-semibold">Edit listing</h2>
      <ListingForm
        action={action}
        agents={agentProfiles.map((a) => ({ id: a.userId, name: a.user.name ?? "Unnamed" }))}
        defaults={{
          title: listing.title,
          address: listing.address,
          city: listing.city,
          state: listing.state,
          zip: listing.zip,
          price: listing.price,
          beds: listing.beds,
          baths: listing.baths,
          sqft: listing.sqft,
          description: listing.description,
          propertyType: listing.propertyType,
          status: listing.status,
          lat: listing.lat,
          lng: listing.lng,
          neighborhoodInfo: listing.neighborhoodInfo ?? "",
          agentId: listing.agentId ?? "",
          photoUrls: listing.photos.map((p) => p.url).join("\n"),
        }}
      />
    </div>
  );
}
