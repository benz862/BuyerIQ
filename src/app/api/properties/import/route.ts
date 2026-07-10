import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/data/user-profile";
import { PLAN_PROPERTY_LIMITS } from "@/lib/types/plans";
import type { BuyerIQProperty } from "@/types/property";
import type { PropertyCategory } from "@/lib/types/database";

function mapPropertyCategory(property: BuyerIQProperty): PropertyCategory {
  const type = property.propertyType?.toLowerCase() ?? "";

  if (type.includes("condo")) return "condo";
  if (type.includes("town")) return "townhome";
  if (property.listingType === "rent" && (type.includes("single") || type.includes("home"))) {
    return "rental_home";
  }
  if (type.includes("apartment") || property.listingType === "rent") return "apartment";
  if (type.includes("land")) return "vacant_land";
  if (type.includes("multi") || type.includes("investment")) return "investment";

  return "single_family";
}

function asSmallInt(value: number | undefined) {
  if (value === undefined) return null;
  const rounded = Math.round(value);
  return Number.isFinite(rounded) ? rounded : null;
}

function asNumber(value: number | undefined) {
  return value !== undefined && Number.isFinite(value) ? value : null;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const property = (await request.json()) as BuyerIQProperty;

    if (
      !property?.id ||
      !property.address ||
      !Number.isFinite(property.latitude) ||
      !Number.isFinite(property.longitude)
    ) {
      return NextResponse.json({ error: "A valid property listing is required." }, { status: 400 });
    }

    const profile = await getUserProfile();
    const plan = profile?.plan ?? "free";
    const limit = PLAN_PROPERTY_LIMITS[plan];

    if (limit !== null) {
      const { count } = await supabase
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if ((count ?? 0) >= limit) {
        return NextResponse.json(
          { error: "Free accounts include 1 demo property. Upgrade for unlimited properties." },
          { status: 403 }
        );
      }
    }

    const importedNotes = [
      "Imported from RentCast search.",
      property.listingUrl ? `Listing URL: ${property.listingUrl}` : null,
      property.status ? `Listing status: ${property.status}` : null,
      property.daysOnMarket !== undefined ? `Days on market: ${property.daysOnMarket}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const { data, error } = await supabase
      .from("properties")
      .insert({
        user_id: user.id,
        project_mode: property.listingType === "rent" ? "renting" : "buying",
        property_category: mapPropertyCategory(property),
        region_key: property.state === "FL" ? "southwest_florida" : "general",
        property_name: property.address,
        address: property.address,
        purchase_price: asNumber(property.price),
        bedrooms: asSmallInt(property.bedrooms),
        bathrooms: asNumber(property.bathrooms),
        square_footage: asSmallInt(property.squareFeet),
        lot_size: property.lotSize ? `${property.lotSize.toLocaleString()} sq ft` : null,
        year_built: asSmallInt(property.yearBuilt),
        hoa_fees: asNumber(property.hoaFee),
        property_description: property.propertyType ?? null,
        buyer_notes: importedNotes || null,
        nearby_amenities: [property.city, property.state, property.zipCode].filter(Boolean).join(", ") || null,
        lease_terms: property.listingType === "rent" ? "Imported rental listing" : null,
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ propertyId: data.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to add property to your list." },
      { status: 500 }
    );
  }
}
