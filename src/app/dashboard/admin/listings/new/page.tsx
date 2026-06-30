import { prisma } from "@/lib/prisma";
import { ListingForm } from "@/components/admin/listing-form";
import { createListing } from "@/app/actions/listings";

export const dynamic = "force-dynamic";

export default async function NewListingPage() {
  const agentProfiles = await prisma.agentProfile.findMany({
    where: { status: "APPROVED" },
    include: { user: true },
  });

  return (
    <div className="max-w-3xl space-y-6">
      <h2 className="text-2xl font-semibold">Add listing</h2>
      <ListingForm
        action={createListing}
        agents={agentProfiles.map((a) => ({ id: a.userId, name: a.user.name ?? "Unnamed" }))}
        defaults={{
          title: "",
          address: "",
          city: "",
          state: "",
          zip: "",
          price: 0,
          beds: 0,
          baths: 0,
          sqft: 0,
          description: "",
          propertyType: "HOUSE",
          status: "AVAILABLE",
          lat: 0,
          lng: 0,
          neighborhoodInfo: "",
          agentId: "",
          photoUrls: "",
        }}
      />
    </div>
  );
}
