import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ImportedProperty = {
  project_mode?: string;
  property_category?: string;
  region_key?: string;
  property_name?: string;
  address?: string;
  purchase_price?: unknown;
  property_description?: string;
  buyer_notes?: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);
  const properties: ImportedProperty[] = Array.isArray(payload?.properties) ? payload.properties : [];

  if (properties.length === 0) {
    return NextResponse.json({ imported: 0 });
  }

  const sanitized = properties.slice(0, 100).map((property) => ({
    user_id: user.id,
    project_mode: property.project_mode ?? "buying",
    property_category: property.property_category ?? "single_family",
    region_key: property.region_key ?? "general",
    property_name: String(property.property_name ?? "Imported property").slice(0, 200),
    address: String(property.address ?? "Unknown address").slice(0, 300),
    purchase_price: Number.isFinite(Number(property.purchase_price)) ? Number(property.purchase_price) : null,
    property_description: typeof property.property_description === "string" ? property.property_description.slice(0, 5000) : null,
    buyer_notes: typeof property.buyer_notes === "string" ? property.buyer_notes.slice(0, 5000) : null,
  }));

  const { error } = await supabase.from("properties").insert(sanitized);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ imported: sanitized.length });
}
