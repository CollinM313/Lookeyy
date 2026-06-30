import { prisma } from "@/lib/prisma";

function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export type MatchRationale = {
  agentId: string;
  agentName: string;
  distanceMiles: number;
  activeLoad: number;
  availabilityMatch: boolean;
  ratingAvg: number;
  score: number;
};

/**
 * Scores approved agents against a listing + requested time, weighting
 * proximity, current active-booking load, availability overlap, and rating.
 * Returns candidates sorted best-first; the caller picks candidates[0] as the suggestion.
 */
export async function suggestAgentForBooking(opts: {
  listingLat: number;
  listingLng: number;
  scheduledAt: Date;
}): Promise<MatchRationale[]> {
  const agents = await prisma.agentProfile.findMany({
    where: { status: "APPROVED" },
    include: { user: true },
  });

  const dayStart = new Date(opts.scheduledAt);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const candidates: MatchRationale[] = [];

  for (const agent of agents) {
    const distanceMiles =
      agent.lat != null && agent.lng != null
        ? haversineMiles(opts.listingLat, opts.listingLng, agent.lat, agent.lng)
        : 25; // unknown location -> neutral-ish distance penalty

    const activeLoad = await prisma.booking.count({
      where: {
        agentId: agent.userId,
        status: { in: ["CONFIRMED", "IN_PROGRESS"] },
      },
    });

    const slotsThatDay = await prisma.availability.findMany({
      where: { agentId: agent.id, date: { gte: dayStart, lt: dayEnd }, isBooked: false },
    });
    const requestedTime = `${String(opts.scheduledAt.getHours()).padStart(2, "0")}:${String(
      opts.scheduledAt.getMinutes()
    ).padStart(2, "0")}`;
    const availabilityMatch = slotsThatDay.some(
      (s) => requestedTime >= s.startTime && requestedTime < s.endTime
    );

    // Lower distance, lower load, higher rating, and availability match are all favorable.
    const distanceScore = Math.max(0, 50 - distanceMiles); // up to 50 pts, decays past 50mi
    const loadScore = Math.max(0, 20 - activeLoad * 4); // up to 20 pts
    const ratingScore = agent.ratingAvg * 6; // up to 30 pts at 5.0 rating
    const availabilityBonus = availabilityMatch ? 25 : 0;

    const score = distanceScore + loadScore + ratingScore + availabilityBonus;

    candidates.push({
      agentId: agent.id,
      agentName: agent.user.name ?? "Unknown agent",
      distanceMiles: Math.round(distanceMiles * 10) / 10,
      activeLoad,
      availabilityMatch,
      ratingAvg: agent.ratingAvg,
      score: Math.round(score * 10) / 10,
    });
  }

  return candidates.sort((a, b) => b.score - a.score);
}
