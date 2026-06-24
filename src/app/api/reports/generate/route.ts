import { NextResponse } from "next/server";
import {
  generatePropertyInsights,
  informationCompletenessScore,
  propertyScoreBreakdown,
  recommendationForScore,
  type Property,
} from "@/lib/types/database";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const propertyId = typeof body?.property_id === "string" ? body.property_id : "";

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", propertyId)
    .eq("user_id", user.id)
    .single();

  if (!property) {
    return NextResponse.json({ error: "Property not found." }, { status: 404 });
  }

  const typedProperty = property as Property;
  const [{ data: buyerProfile }, { data: userPriorities }, { data: futureReadiness }] =
    await Promise.all([
      supabase.from("buyer_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("user_priorities").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("future_readiness_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    ]);
  const scores = propertyScoreBreakdown(
    typedProperty,
    buyerProfile,
    userPriorities,
    futureReadiness
  );
  const completeness = informationCompletenessScore(typedProperty);
  const insights = generatePropertyInsights(
    typedProperty,
    buyerProfile,
    userPriorities,
    futureReadiness
  );
  const recommendation = recommendationForScore(scores.overall);
  const reportPayload = {
    property,
    scores,
    completeness,
    insights,
    recommendation,
    generated_at: new Date().toISOString(),
  };

  await supabase.from("property_scores").insert({
    user_id: user.id,
    property_id: propertyId,
    property_fit_score: scores.propertyFitScore,
    risk_score: scores.riskScore,
    lifestyle_score: scores.lifestyleScore,
    cost_score: scores.costScore,
    confidence_score: scores.confidenceScore,
    information_completeness_score: completeness.score,
    explanations: {
      cost: "Uses entered price, taxes, HOA, insurance, and target monthly payment when available.",
      risk: "Increases when condition and future expense information is weak or concerning.",
      confidence: "Falls when required due diligence information is missing.",
    },
  });

  const { data: report, error } = await supabase
    .from("reports")
    .insert({
      user_id: user.id,
      property_id: propertyId,
      property_score: scores.propertyFitScore,
      information_completeness_score: completeness.score,
      recommendation,
      report_payload: reportPayload,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ report });
}
