import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const [properties, buyerProfiles, questions, emailLogs, timelineEvents, reports] =
    await Promise.all([
      supabase.from("properties").select("*").eq("user_id", user.id),
      supabase.from("buyer_profiles").select("*").eq("user_id", user.id),
      supabase.from("questions").select("*").eq("user_id", user.id),
      supabase.from("email_logs").select("*").eq("user_id", user.id),
      supabase.from("timeline_events").select("*").eq("user_id", user.id),
      supabase.from("reports").select("*").eq("user_id", user.id),
    ]);

  return NextResponse.json({
    exported_at: new Date().toISOString(),
    user_id: user.id,
    properties: properties.data ?? [],
    buyer_profiles: buyerProfiles.data ?? [],
    questions: questions.data ?? [],
    email_logs: emailLogs.data ?? [],
    timeline_events: timelineEvents.data ?? [],
    reports: reports.data ?? [],
  });
}
