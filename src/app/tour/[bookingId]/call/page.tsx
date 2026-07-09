import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { CallRoom } from "@/components/call-room";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function CallPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const session = await auth();
  if (!session?.user) redirect(`/sign-in?callbackUrl=/tour/${bookingId}/call`);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      listing: true,
      agent: true,
      client: true,
    },
  });
  if (!booking) notFound();

  const isAgent = booking.agentId === session.user.id;
  const isClient = booking.clientId === session.user.id;
  if (!isAgent && !isClient) redirect("/");

  return (
    <div className="mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{booking.listing.title}</h1>
        <p className="text-muted-foreground">
          Tour scheduled for {format(booking.scheduledAt, "EEE, MMM d 'at' h:mm a")}
        </p>
      </div>
      <CallRoom
        bookingId={booking.id}
        fallbackPhone={booking.fallbackPhone}
        agentPhone={booking.agent?.phone ?? null}
        agentName={booking.agent?.name ?? null}
        clientName={booking.client?.name ?? null}
        clientPhone={booking.fallbackPhone}
        meetingLink={booking.dailyRoomUrl}
        isAgent={isAgent}
      />
    </div>
  );
}
