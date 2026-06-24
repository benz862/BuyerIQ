import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_BUCKETS = new Set([
  "property-photos",
  "property-documents",
  "lease-documents",
  "hoa-documents",
  "inspection-documents",
  "reports",
  "contact-photos",
]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const bucket = typeof body?.bucket === "string" ? body.bucket : "";
  const fileName = typeof body?.file_name === "string" ? body.file_name.replace(/[^a-zA-Z0-9._-]/g, "_") : "";

  if (!ALLOWED_BUCKETS.has(bucket) || !fileName) {
    return NextResponse.json({ error: "Invalid bucket or file name." }, { status: 400 });
  }

  const propertyId =
    typeof body?.property_id === "string"
      ? body.property_id.replace(/[^a-zA-Z0-9_-]/g, "")
      : "";
  const path = `${user.id}/${propertyId ? `${propertyId}/` : ""}${crypto.randomUUID()}-${fileName}`;
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ bucket, path, signed_url: data.signedUrl, token: data.token });
}
