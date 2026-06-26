import { NextRequest, NextResponse } from "next/server";
import { searchRentCastListings } from "@/lib/rentcast";
import type { PropertyListingType } from "@/types/property";

function optionalNumber(value: string | null): number | undefined {
  if (!value) return undefined;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const listingType = (searchParams.get("listingType") || "sale") as PropertyListingType;

    if (!["sale", "rent"].includes(listingType)) {
      return NextResponse.json(
        { error: "listingType must be sale or rent." },
        { status: 400 }
      );
    }

    const properties = await searchRentCastListings({
      listingType,
      city: searchParams.get("city") || undefined,
      state: searchParams.get("state") || undefined,
      zipCode: searchParams.get("zipCode") || undefined,
      latitude: optionalNumber(searchParams.get("latitude")),
      longitude: optionalNumber(searchParams.get("longitude")),
      radius: optionalNumber(searchParams.get("radius")) ?? 15,
      minPrice: optionalNumber(searchParams.get("minPrice")),
      maxPrice: optionalNumber(searchParams.get("maxPrice")),
      bedrooms: optionalNumber(searchParams.get("bedrooms")),
      bathrooms: optionalNumber(searchParams.get("bathrooms")),
      limit: optionalNumber(searchParams.get("limit")) ?? 50,
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to search properties." },
      { status: 500 }
    );
  }
}
