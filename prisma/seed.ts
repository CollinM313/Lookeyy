import { PrismaClient, PropertyType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PHOTO = (seed: string) => `https://images.unsplash.com/${seed}?q=80&w=1200&auto=format&fit=crop`;

const CITIES = [
  { city: "Austin", state: "TX", lat: 30.2672, lng: -97.7431 },
  { city: "Denver", state: "CO", lat: 39.7392, lng: -104.9903 },
  { city: "Raleigh", state: "NC", lat: 35.7796, lng: -78.6382 },
  { city: "Phoenix", state: "AZ", lat: 33.4484, lng: -112.074 },
];

async function main() {
  console.log("Seeding…");

  const password = await bcrypt.hash("password123", 10);

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: "admin@lookeyy.com" },
    update: {},
    create: { name: "Lookeyy Admin", email: "admin@lookeyy.com", passwordHash: password, role: "ADMIN" },
  });

  // Client
  const client = await prisma.user.upsert({
    where: { email: "client@lookeyy.com" },
    update: {},
    create: { name: "Jamie Client", email: "client@lookeyy.com", passwordHash: password, role: "CLIENT", phone: "555-010-0001" },
  });

  // Agents
  const agentSeeds = [
    { name: "Maria Gomez", email: "maria@lookeyy.com", coverage: CITIES[0], expertise: ["First-time buyers", "Luxury"] },
    { name: "Tom Becker", email: "tom@lookeyy.com", coverage: CITIES[1], expertise: ["Relocation", "Condos"] },
    { name: "Priya Shah", email: "priya@lookeyy.com", coverage: CITIES[2], expertise: ["New construction"] },
    { name: "Carlos Diaz", email: "carlos@lookeyy.com", coverage: CITIES[3], expertise: ["Investment properties"] },
    { name: "Emily Chen", email: "emily@lookeyy.com", coverage: CITIES[0], expertise: ["Townhomes", "Luxury"] },
  ];

  const agents = [];
  for (const a of agentSeeds) {
    const user = await prisma.user.upsert({
      where: { email: a.email },
      update: {},
      create: {
        name: a.name,
        email: a.email,
        passwordHash: password,
        role: "AGENT",
        phone: "555-010-0002",
      },
    });

    const profile = await prisma.agentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        licenseNumber: `LIC-${Math.floor(Math.random() * 90000 + 10000)}`,
        brokerage: "Lookeyy Partner Realty",
        coverageArea: `${a.coverage.city} metro, ${a.coverage.state}`,
        city: a.coverage.city,
        state: a.coverage.state,
        lat: a.coverage.lat,
        lng: a.coverage.lng,
        bio: `${a.name} is a local expert specializing in ${a.expertise.join(", ").toLowerCase()}, ready to guide you through video tours.`,
        areasOfExpertise: a.expertise,
        status: "APPROVED",
        ratingAvg: 4 + Math.random(),
        ratingCount: Math.floor(Math.random() * 30) + 5,
        tourCount: Math.floor(Math.random() * 50),
      },
    });

    // Availability for the next 7 days
    for (let d = 1; d <= 7; d++) {
      const date = new Date();
      date.setDate(date.getDate() + d);
      date.setHours(0, 0, 0, 0);
      await prisma.availability.create({
        data: { agentId: profile.id, date, startTime: "09:00", endTime: "12:00" },
      });
      await prisma.availability.create({
        data: { agentId: profile.id, date, startTime: "14:00", endTime: "17:00" },
      });
    }

    agents.push({ user, profile, coverage: a.coverage });
  }

  // Pending agent application (for the admin review queue demo)
  const pendingUser = await prisma.user.upsert({
    where: { email: "pendingagent@lookeyy.com" },
    update: {},
    create: { name: "Sam Rivera", email: "pendingagent@lookeyy.com", passwordHash: password, role: "CLIENT" },
  });
  await prisma.agentProfile.upsert({
    where: { userId: pendingUser.id },
    update: {},
    create: {
      userId: pendingUser.id,
      licenseNumber: "LIC-77721",
      brokerage: "Independent",
      coverageArea: "Seattle metro, WA",
      bio: "5 years of experience helping renters find their next home.",
      areasOfExpertise: ["Rentals"],
      status: "PENDING",
    },
  });

  // Listings
  const propertyTypes: PropertyType[] = ["HOUSE", "CONDO", "TOWNHOUSE", "APARTMENT", "MULTI_FAMILY"];
  const photoSets = [
    ["photo-1600585154340-be6161a56a0c", "photo-1600596542815-ffad4c1539a9", "photo-1600607687939-ce8a6c25118c"],
    ["photo-1568605114967-8130f3a36994", "photo-1570129477492-45c003edd2be", "photo-1599423300746-b62533397364"],
    ["photo-1512917774080-9991f1c4c750", "photo-1576941089067-2de3c901e126", "photo-1502672260266-1c1ef2d93688"],
  ];

  const listings = [];
  for (let i = 0; i < 15; i++) {
    const coverage = CITIES[i % CITIES.length];
    const agent = agents[i % agents.length];
    const photos = photoSets[i % photoSets.length];

    const listing = await prisma.listing.create({
      data: {
        title: `${["Modern", "Charming", "Spacious", "Cozy", "Sunlit"][i % 5]} ${["Home", "Townhouse", "Condo"][i % 3]} in ${coverage.city}`,
        address: `${100 + i} Main St`,
        city: coverage.city,
        state: coverage.state,
        zip: `${78700 + i}`,
        price: 300000 + i * 45000,
        beds: 2 + (i % 4),
        baths: 1.5 + (i % 3),
        sqft: 1200 + i * 150,
        description:
          "A beautifully maintained property featuring an open floor plan, updated kitchen, and a private backyard — perfect for entertaining. Schedule a live or recorded video tour to see it for yourself.",
        propertyType: propertyTypes[i % propertyTypes.length],
        status: i % 7 === 0 ? "PENDING" : "AVAILABLE",
        lat: coverage.lat + (Math.random() - 0.5) * 0.1,
        lng: coverage.lng + (Math.random() - 0.5) * 0.1,
        neighborhoodInfo: `Located minutes from downtown ${coverage.city}, with great schools, parks, and dining nearby.`,
        agentId: agent.user.id,
        photos: { create: photos.map((p, order) => ({ url: PHOTO(p), order })) },
      },
    });
    listings.push(listing);
  }

  // Bookings across statuses
  const statuses = ["REQUESTED", "PENDING_ADMIN_APPROVAL", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
  for (let i = 0; i < 10; i++) {
    const listing = listings[i % listings.length];
    const agent = agents[i % agents.length];
    const status = statuses[i % statuses.length];
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + (status === "COMPLETED" ? -3 : i + 1));
    scheduledAt.setHours(10 + (i % 6), 0, 0, 0);

    const booking = await prisma.booking.create({
      data: {
        listingId: listing.id,
        clientId: client.id,
        agentId: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"].includes(status) ? agent.user.id : null,
        suggestedAgentId: agent.profile.id,
        tourType: i % 2 === 0 ? "LIVE" : "RECORDED",
        status,
        scheduledAt,
        contactName: client.name!,
        contactPhone: "555-010-0001",
        contactEmail: client.email,
        specialRequests: i % 3 === 0 ? "Please check the water pressure in the main bathroom." : null,
      },
    });

    if (status === "COMPLETED") {
      await prisma.review.create({
        data: {
          bookingId: booking.id,
          clientId: client.id,
          agentId: agent.profile.id,
          rating: 4 + (i % 2),
          comment: "Great tour, very thorough and answered all my questions!",
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log("Login as admin@lookeyy.com / password123");
  console.log("Login as client@lookeyy.com / password123");
  console.log("Login as maria@lookeyy.com / password123 (approved agent)");
  console.log("Login as pendingagent@lookeyy.com / password123 (pending agent application)");
  void admin;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
