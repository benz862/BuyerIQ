"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/data/user-profile";
import { createClient } from "@/lib/supabase/server";
import { PLAN_PROPERTY_LIMITS } from "@/lib/types/plans";
import type { ConditionRating, ProjectMode, PropertyCategory, QuestionStatus, RegionKey } from "@/lib/types/database";

export type PropertyFormState = {
  error?: string;
  success?: boolean;
};

export async function createProperty(
  _prevState: PropertyFormState,
  formData: FormData
): Promise<PropertyFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to add a property." };
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
      return { error: "Free accounts include 1 demo property. Buy BuyerIQ Standard or Pro for unlimited properties." };
    }
  }

  const propertyName = formData.get("property_name")?.toString().trim();
  const address = formData.get("address")?.toString().trim();
  if (!propertyName || !address) {
    return { error: "Property name and address are required." };
  }

  const parseNumber = (key: string) => {
    const value = formData.get(key)?.toString().trim();
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parseScore = (key: string) => {
    const value = parseNumber(key);
    if (value === null) return null;
    return Math.min(100, Math.max(0, Math.round(value)));
  };

  const parseCondition = (key: string): ConditionRating => {
    const value = formData.get(key)?.toString();
    if (
      value === "excellent" ||
      value === "good" ||
      value === "average" ||
      value === "poor" ||
      value === "unknown"
    ) {
      return value;
    }
    return "unknown";
  };

  const parseMode = (): ProjectMode => {
    const value = formData.get("project_mode")?.toString();
    if (value === "buying" || value === "renting" || value === "relocating") return value;
    return "buying";
  };

  const parseCategory = (): PropertyCategory => {
    const value = formData.get("property_category")?.toString();
    if (
      value === "single_family" ||
      value === "condo" ||
      value === "townhome" ||
      value === "apartment" ||
      value === "rental_home" ||
      value === "55_plus" ||
      value === "new_construction" ||
      value === "vacant_land" ||
      value === "investment"
    ) return value;
    return "single_family";
  };

  const parseRegion = (): RegionKey => {
    const value = formData.get("region_key")?.toString();
    if (
      value === "southwest_florida" ||
      value === "texas" ||
      value === "washington" ||
      value === "california" ||
      value === "arizona" ||
      value === "general"
    ) return value;
    return "general";
  };

  const { data, error } = await supabase
    .from("properties")
    .insert({
      user_id: user.id,
      project_mode: parseMode(),
      property_category: parseCategory(),
      region_key: parseRegion(),
      property_name: propertyName,
      address,
      purchase_price: parseNumber("purchase_price"),
      property_taxes: parseNumber("property_taxes"),
      hoa_fees: parseNumber("hoa_fees"),
      insurance_estimate: parseNumber("insurance_estimate"),
      bedrooms: parseNumber("bedrooms"),
      bathrooms: parseNumber("bathrooms"),
      square_footage: parseNumber("square_footage"),
      lot_size: formData.get("lot_size")?.toString().trim() || null,
      year_built: parseNumber("year_built"),
      garage_spaces: parseNumber("garage_spaces"),
      property_description: formData.get("property_description")?.toString().trim() || null,
      buyer_notes: formData.get("buyer_notes")?.toString().trim() || null,
      nearby_amenities: formData.get("nearby_amenities")?.toString().trim() || null,
      shopping_score: parseScore("shopping_score"),
      healthcare_score: parseScore("healthcare_score"),
      restaurants_score: parseScore("restaurants_score"),
      parks_score: parseScore("parks_score"),
      entertainment_score: parseScore("entertainment_score"),
      walkability_score: parseScore("walkability_score"),
      growing_family_score: parseScore("growing_family_score"),
      retirement_score: parseScore("retirement_score"),
      aging_in_place_score: parseScore("aging_in_place_score"),
      resale_potential_score: parseScore("resale_potential_score"),
      remote_work_score: parseScore("remote_work_score"),
      roof_condition: parseCondition("roof_condition"),
      hvac_condition: parseCondition("hvac_condition"),
      foundation_condition: parseCondition("foundation_condition"),
      kitchen_condition: parseCondition("kitchen_condition"),
      bathrooms_condition: parseCondition("bathrooms_condition"),
      flooring_condition: parseCondition("flooring_condition"),
      windows_condition: parseCondition("windows_condition"),
      exterior_condition: parseCondition("exterior_condition"),
      lease_terms: formData.get("lease_terms")?.toString().trim() || null,
      move_timeline: formData.get("move_timeline")?.toString().trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  redirect(`/dashboard/properties/${data.id}`);
}

export async function createQuestion(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const propertyId = formData.get("property_id")?.toString();
  const question = formData.get("question")?.toString().trim();

  if (!propertyId || !question) {
    return;
  }

  await supabase.from("questions").insert({
    user_id: user.id,
    property_id: propertyId,
    category: formData.get("category")?.toString().trim() || "General",
    question_text: question,
    recipient_name: formData.get("recipient_name")?.toString().trim() || null,
    recipient_email: formData.get("recipient_email")?.toString().trim() || null,
    status: "open",
  });

  await supabase.from("timeline_events").insert({
    user_id: user.id,
    property_id: propertyId,
    event_type: "question_created",
    title: "Question created",
    notes: question,
  });

  revalidatePath("/dashboard/questions");
  revalidatePath(`/dashboard/properties/${propertyId}`);
}

export async function updateQuestionStatus(questionId: string, status: QuestionStatus) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const update: Record<string, string> = { status };
  if (status === "sent") update.sent_at = new Date().toISOString();
  if (status === "answered" || status === "closed") update.answered_at = new Date().toISOString();

  await supabase
    .from("questions")
    .update(update)
    .eq("id", questionId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard/questions");
}

export async function sendQuestionEmail(questionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: question } = await supabase
    .from("questions")
    .select("*, properties(property_name, address)")
    .eq("id", questionId)
    .eq("user_id", user.id)
    .single();

  if (!question?.recipient_email) {
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (apiKey && from) {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [question.recipient_email],
        subject: `BuyerIQ question: ${question.properties?.property_name ?? "Property"}`,
        text: [
          `Hello ${question.recipient_name ?? ""}`.trim() + ",",
          "",
          "I am organizing due diligence in BuyerIQ and would appreciate your help with this question:",
          "",
          question.question_text,
          "",
          question.properties?.address ? `Property: ${question.properties.address}` : "",
          "",
          "Thank you.",
        ].filter(Boolean).join("\n"),
      }),
    });
  }

  await supabase
    .from("questions")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", questionId)
    .eq("user_id", user.id);

  await supabase.from("timeline_events").insert({
    user_id: user.id,
    property_id: question.property_id,
    event_type: "question_sent",
    title: "Question sent",
    notes: question.question_text,
  });

  await supabase.from("email_logs").insert({
    user_id: user.id,
    property_id: question.property_id,
    question_id: question.id,
    recipient_email: question.recipient_email,
    recipient_name: question.recipient_name,
    subject: `BuyerIQ question: ${question.properties?.property_name ?? "Property"}`,
    status: apiKey && from ? "sent" : "logged_without_resend",
    sent_at: new Date().toISOString(),
  });

  revalidatePath("/dashboard/questions");
  revalidatePath(`/dashboard/properties/${question.property_id}`);
}

export async function deleteProperty(propertyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  await supabase
    .from("properties")
    .delete()
    .eq("id", propertyId)
    .eq("user_id", user.id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  redirect("/dashboard/properties");
}

export async function saveBuyerProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parseNumber = (key: string) => {
    const value = formData.get(key)?.toString().trim();
    if (!value) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const parseBool = (key: string) => formData.get(key) === "on";
  const parseText = (key: string) => formData.get(key)?.toString().trim() || null;
  const parsePriority = (key: string) => {
    const value = parseNumber(key);
    if (value === null) return null;
    return Math.max(0, Math.min(4, Math.round(value)));
  };

  await supabase.from("buyer_profiles").upsert({
    user_id: user.id,
    name: parseText("name"),
    budget: parseNumber("budget"),
    desired_monthly_payment: parseNumber("desired_monthly_payment"),
    household_size: parseNumber("household_size"),
    pets: parseBool("pets"),
    work_from_home: parseBool("work_from_home"),
    school_importance: parseNumber("school_importance"),
    commute_importance: parseNumber("commute_importance"),
    retirement_planning: parseBool("retirement_planning"),
    accessibility_needs: parseText("accessibility_needs"),
    must_have_features: parseText("must_have_features"),
    nice_to_have_features: parseText("nice_to_have_features"),
    deal_breakers: parseText("deal_breakers"),
  }, { onConflict: "user_id" });

  await supabase.from("lifestyle_profiles").upsert({
    user_id: user.id,
    life_stage: parseText("life_stage"),
    age_range: parseText("age_range"),
    retirement_status: parseText("retirement_status"),
    household_size: parseNumber("household_size"),
    pet_ownership: parseBool("pets"),
    work_from_home: parseBool("work_from_home"),
  }, { onConflict: "user_id" });

  await supabase.from("future_readiness_profiles").upsert({
    user_id: user.id,
    reduce_driving: parseText("reduce_driving"),
    accessibility_importance: parsePriority("accessibility_importance"),
    maintenance_tolerance: parseText("maintenance_tolerance"),
    stair_tolerance: parseText("stair_tolerance"),
  }, { onConflict: "user_id" });

  await supabase.from("user_priorities").upsert({
    user_id: user.id,
    hospitals: parsePriority("hospitals"),
    primary_care: parsePriority("primary_care"),
    specialists: parsePriority("specialists"),
    urgent_care: parsePriority("urgent_care"),
    pharmacies: parsePriority("pharmacies"),
    medical_centers: parsePriority("medical_centers"),
    grocery_stores: parsePriority("grocery_stores"),
    shopping: parsePriority("shopping"),
    banking: parsePriority("banking"),
    restaurants: parsePriority("restaurants"),
    coffee_shops: parsePriority("coffee_shops"),
    veterinarians: parsePriority("veterinarians"),
    golf: parsePriority("golf"),
    pickleball: parsePriority("pickleball"),
    beaches: parsePriority("beaches"),
    parks: parsePriority("parks"),
    walking_trails: parsePriority("walking_trails"),
    boating: parsePriority("boating"),
    fishing: parsePriority("fishing"),
    fitness_centers: parsePriority("fitness_centers"),
    churches: parsePriority("churches"),
    community_centers: parsePriority("community_centers"),
    volunteer_opportunities: parsePriority("volunteer_opportunities"),
    clubs: parsePriority("clubs"),
    senior_activities: parsePriority("senior_activities"),
    social_events: parsePriority("social_events"),
    schools: parsePriority("schools"),
    daycare: parsePriority("daycare"),
    family_activities: parsePriority("family_activities"),
    nearby_relatives: parsePriority("nearby_relatives"),
    public_transportation: parsePriority("public_transportation"),
    walkability: parsePriority("walkability"),
    bike_access: parsePriority("bike_access"),
    airport_access: parsePriority("airport_access"),
    ride_share: parsePriority("ride_share"),
    assisted_transportation: parsePriority("assisted_transportation"),
  }, { onConflict: "user_id" });

  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
