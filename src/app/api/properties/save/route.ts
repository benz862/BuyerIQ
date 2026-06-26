import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { BuyerIQProperty } from "@/types/property";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const property = (await request.json()) as BuyerIQProperty;

    const { error } = await supabase.from("saved_properties").insert({
      user_id: user.id,
      source: property.source,
      source_property_id: property.id,
      listing_type: property.listingType,
      address: property.address,
      city: property.city,
      state: property.state,
      zip_code: property.zipCode,
      price: property.price,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      square_feet: property.squareFeet,
      property_type: property.propertyType,
      latitude: property.latitude,
      longitude: property.longitude,
      photos: property.photos ?? [],
      listing_url: property.listingUrl,
      status: property.status,
      listed_date: property.listedDate,
      days_on_market: property.daysOnMarket,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Unable to save property." },
      { status: 500 }
    );
  }
}
