import type { BuyerIQProperty, PropertyListingType } from "@/types/property";

const RENTCAST_BASE_URL = "https://api.rentcast.io/v1";

type RentCastListing = Record<string, unknown>;

function requireRentCastKey() {
  const key = process.env.RENTCAST_API_KEY;

  if (!key) {
    throw new Error("Missing RENTCAST_API_KEY environment variable.");
  }

  return key;
}

function toNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return undefined;
}

function toString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function normalizeRentCastListing(
  raw: RentCastListing,
  listingType: PropertyListingType
): BuyerIQProperty | null {
  const latitude = toNumber(raw.latitude ?? raw.lat);
  const longitude = toNumber(raw.longitude ?? raw.lng ?? raw.lon);

  if (latitude === undefined || longitude === undefined) {
    return null;
  }

  const address =
    toString(raw.formattedAddress) ??
    toString(raw.address) ??
    [
      toString(raw.addressLine1),
      toString(raw.city),
      toString(raw.state),
      toString(raw.zipCode),
    ]
      .filter(Boolean)
      .join(", ");

  if (!address) return null;

  const price =
    listingType === "rent"
      ? toNumber(raw.price ?? raw.rent ?? raw.listPrice)
      : toNumber(raw.price ?? raw.listPrice);

  const photos = Array.isArray(raw.photos)
    ? raw.photos.filter((photo): photo is string => typeof photo === "string")
    : [];

  return {
    id: String(raw.id ?? raw.listingId ?? raw.propertyId ?? `${latitude},${longitude},${address}`),
    source: "rentcast",
    listingType,
    address,
    city: toString(raw.city),
    state: toString(raw.state),
    zipCode: toString(raw.zipCode),
    price,
    bedrooms: toNumber(raw.bedrooms ?? raw.beds),
    bathrooms: toNumber(raw.bathrooms ?? raw.baths),
    squareFeet: toNumber(raw.squareFootage ?? raw.squareFeet ?? raw.sqft),
    propertyType: toString(raw.propertyType),
    latitude,
    longitude,
    photos,
    listingUrl: toString(raw.listingUrl ?? raw.url),
    status: toString(raw.status),
    listedDate: toString(raw.listedDate),
    daysOnMarket: toNumber(raw.daysOnMarket),
  };
}

export async function searchRentCastListings(params: {
  listingType: PropertyListingType;
  city?: string;
  state?: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  limit?: number;
}): Promise<BuyerIQProperty[]> {
  const key = requireRentCastKey();

  const endpoint =
    params.listingType === "rent"
      ? "/listings/rental/long-term"
      : "/listings/sale";

  const query = new URLSearchParams();

  if (params.city) query.set("city", params.city);
  if (params.state) query.set("state", params.state);
  if (params.zipCode) query.set("zipCode", params.zipCode);
  if (params.latitude !== undefined) query.set("latitude", String(params.latitude));
  if (params.longitude !== undefined) query.set("longitude", String(params.longitude));
  if (params.radius !== undefined) query.set("radius", String(params.radius));
  if (params.minPrice !== undefined) query.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined) query.set("maxPrice", String(params.maxPrice));
  if (params.bedrooms !== undefined) query.set("bedrooms", String(params.bedrooms));
  if (params.bathrooms !== undefined) query.set("bathrooms", String(params.bathrooms));
  query.set("limit", String(params.limit ?? 50));

  const response = await fetch(`${RENTCAST_BASE_URL}${endpoint}?${query.toString()}`, {
    headers: {
      "X-Api-Key": key,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`RentCast request failed: ${response.status} ${message}`);
  }

  const data: unknown = await response.json();
  const rows = Array.isArray(data)
    ? data
    : typeof data === "object" && data !== null && "listings" in data && Array.isArray(data.listings)
      ? data.listings
      : typeof data === "object" && data !== null && "data" in data && Array.isArray(data.data)
        ? data.data
        : [];

  return rows
    .map((item) => normalizeRentCastListing(item as RentCastListing, params.listingType))
    .filter((property): property is BuyerIQProperty => property !== null);
}
