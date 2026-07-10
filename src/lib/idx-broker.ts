export type IdxImage = {
  url: string;
  caption: string;
};

export type IdxListing = {
  listingID: string;
  idxID: string;
  address: string;
  streetNumber: string;
  streetName: string;
  cityName: string;
  state: string;
  zipcode: string;
  listingPrice: string;
  price: number;
  bedrooms: number;
  totalBaths: number;
  sqFt: string;
  propType: string;
  propSubType: string;
  idxStatus: string;
  idxPropType: string;
  remarksConcat: string;
  yearBuilt: number;
  latitude: number;
  longitude: number;
  detailsURL: string;
  detailsUrlSlug: string;
  fullDetailsURL: string;
  image: Record<string, IdxImage | number>;
  rntLse: string;
  narContact: string;
  listingAgentID: string;
  listingOfficeID: string;
  dateAdded: string;
};

const BASE_URL = "https://api.idxbroker.com";

function headers() {
  return {
    accesskey: process.env.IDX_BROKER_API_KEY ?? "",
    outputtype: "json",
  };
}

function parseImages(image: Record<string, IdxImage | number>): IdxImage[] {
  return Object.entries(image)
    .filter(([k]) => k !== "totalCount" && !isNaN(Number(k)))
    .map(([, v]) => v as IdxImage);
}

export function getIdxThumbnail(listing: IdxListing): string | null {
  const images = parseImages(listing.image);
  return images[0]?.url ?? null;
}

export function getIdxImages(listing: IdxListing): IdxImage[] {
  return parseImages(listing.image);
}

const SAVED_LINK_ID = "497";

export type IdxSearchParams = {
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  baths?: number;
  city?: string;
  propType?: string;
};

export async function getAllListings(params?: IdxSearchParams): Promise<IdxListing[]> {
  try {
    const res = await fetch(
      `${BASE_URL}/clients/savedlinks/${SAVED_LINK_ID}/results?count=250&pt=all`,
      { headers: headers(), next: { revalidate: 300 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    if (!Array.isArray(json)) return [];

    let listings = json as IdxListing[];

    // Filter out non-active, leases, land, and commercial
    const excludedTypes = ["Land", "Commercial Sale", "Commercial Lease", "Business Opportunity", "Lots and Land"];
    listings = listings.filter((l) =>
      l.idxStatus === "active" &&
      l.rntLse !== "lease" &&
      !excludedTypes.includes(l.propType) &&
      !excludedTypes.includes(l.idxPropType)
    );

    if (params?.minPrice) listings = listings.filter((l) => l.price >= params.minPrice!);
    if (params?.maxPrice) listings = listings.filter((l) => l.price <= params.maxPrice!);
    if (params?.beds) listings = listings.filter((l) => l.bedrooms >= params.beds!);
    if (params?.baths) listings = listings.filter((l) => l.totalBaths >= params.baths!);
    if (params?.city) listings = listings.filter((l) =>
      l.cityName.toLowerCase().includes(params.city!.toLowerCase())
    );

    // Sort by price descending (nicer homes first)
    listings.sort((a, b) => b.price - a.price);

    return listings;
  } catch {
    return [];
  }
}

export async function getFeaturedListings(): Promise<IdxListing[]> {
  try {
    const res = await fetch(`${BASE_URL}/clients/featured?count=50`, {
      headers: headers(),
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    if (!json?.data) return [];
    return Object.values(json.data) as IdxListing[];
  } catch {
    return [];
  }
}

export async function getIdxListing(idxID: string, listingID: string): Promise<IdxListing | null> {
  const listings = await getAllListings();
  return listings.find((l) => l.idxID === idxID && l.listingID === listingID) ?? null;
}
