import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isEmail(value: unknown): value is string {
  return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function cleanText(value: unknown, maxLength = 5000) {
  if (typeof value !== "string") return "";
  return value
    .split("")
    .filter((char) => {
      const code = char.charCodeAt(0);
      return code >= 32 && code !== 127;
    })
    .join("")
    .trim()
    .slice(0, maxLength);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const propertyId = cleanText(body?.property_id, 80);
  const recipientEmail = body?.recipient_email;
  const recipientName = cleanText(body?.recipient_name, 120);
  const selectedQuestionIds: unknown[] = Array.isArray(body?.question_ids) ? body.question_ids : [];

  if (!propertyId || !isEmail(recipientEmail) || selectedQuestionIds.length === 0) {
    return NextResponse.json({ error: "Property, recipient email, and questions are required." }, { status: 400 });
  }

  const { data: property } = await supabase
    .from("properties")
    .select("id, property_name, address")
    .eq("id", propertyId)
    .eq("user_id", user.id)
    .single();

  if (!property) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  const { data: questions } = await supabase
    .from("questions")
    .select("id, question_text")
    .eq("property_id", propertyId)
    .eq("user_id", user.id)
    .in("id", selectedQuestionIds.map((id) => cleanText(id, 80)));

  if (!questions?.length) {
    return NextResponse.json({ error: "No matching questions found." }, { status: 404 });
  }

  const subject = `BuyerIQ questions: ${property.property_name}`;
  const text = [
    `Hello ${recipientName || "there"},`,
    "",
    "I am organizing due diligence in BuyerIQ and would appreciate your help with these questions:",
    "",
    ...questions.map((question, index) => `${index + 1}. ${question.question_text}`),
    "",
    `Property: ${property.address}`,
    "",
    "Thank you.",
  ].join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (apiKey && from) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [recipientEmail],
        subject,
        text,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Resend rejected the email." }, { status: 502 });
    }
  }

  const now = new Date().toISOString();
  await supabase
    .from("questions")
    .update({
      status: "sent",
      recipient_email: recipientEmail,
      recipient_name: recipientName || null,
      sent_at: now,
    })
    .in("id", questions.map((question) => question.id))
    .eq("user_id", user.id);

  await supabase.from("email_logs").insert({
    user_id: user.id,
    property_id: propertyId,
    recipient_email: recipientEmail,
    recipient_name: recipientName || null,
    subject,
    body: text,
    status: apiKey && from ? "sent" : "logged_without_resend",
    sent_at: now,
  });

  await supabase.from("timeline_events").insert({
    user_id: user.id,
    property_id: propertyId,
    event_type: "questions_sent",
    title: "Questions sent",
    notes: `${questions.length} question(s) sent to ${recipientEmail}`,
  });

  return NextResponse.json({ sent: true, count: questions.length });
}
