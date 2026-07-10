import { NextRequest, NextResponse } from "next/server";
import { RentCastRequestError, searchRentCastListings } from "@/lib/rentcast";
import type { PropertyListingType, PropertySearchType } from "@/types/property";

const propertyTypes: PropertySearchType[] = [
  "all",
  "Single Family",
  "Condo",
  "Townhouse",
  "Apartment",
  "Manufactured",
  "Multi-Family",
];

function optionalNumber(value: string | null): number | undefined {
  if (!value) return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingType = (searchParams.get("listingType") || "sale") as PropertyListingType;
    const propertyType = (searchParams.get("propertyType") || "all") as PropertySearchType;

    if (!["sale", "rent"].includes(listingType)) {
      return NextResponse.json(
        { error: "listingType must be sale or rent." },
        { status: 400 }
      );
    }

    if (!propertyTypes.includes(propertyType)) {
      return NextResponse.json({ error: "Unsupported property type." }, { status: 400 });
    }

    const properties = await searchRentCastListings({
      listingType,
      city: searchParams.get("city") || undefined,
      state: searchParams.get("state") || undefined,
      zipCode: searchParams.get("zipCode") || undefined,
      latitude: optionalNumber(searchParams.get("latitude")),
      longitude: optionalNumber(searchParams.get("longitude")),
      radius: optionalNumber(searchParams.get("radius")),
      minPrice: optionalNumber(searchParams.get("minPrice")),
      maxPrice: optionalNumber(searchParams.get("maxPrice")),
      bedrooms: optionalNumber(searchParams.get("bedrooms")),
      bathrooms: optionalNumber(searchParams.get("bathrooms")),
      propertyType: propertyType === "all" ? undefined : propertyType,
      limit: optionalNumber(searchParams.get("limit")) ?? 50,
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error(error);
    const message = (() => {
      if (error instanceof Error && error.message.includes("Missing RENTCAST_API_KEY")) {
        return "RentCast API key is not configured.";
      }

      if (error instanceof RentCastRequestError) {
        return error.message;
      }

      return "Unable to search properties.";
    })();

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
