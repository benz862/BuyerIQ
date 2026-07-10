export type ConditionRating = "excellent" | "good" | "average" | "poor" | "unknown";
export type ProjectMode = "buying" | "renting" | "relocating";
export type PropertyCategory =
  | "single_family"
  | "condo"
  | "townhome"
  | "apartment"
  | "rental_home"
  | "55_plus"
  | "new_construction"
  | "vacant_land"
  | "investment";
export type RegionKey = "southwest_florida" | "texas" | "washington" | "california" | "arizona" | "general";
export type QuestionStatus = "draft" | "open" | "sent" | "answered" | "follow_up_required" | "closed";
export type PriorityScore = 0 | 1 | 2 | 3 | 4;

export type BuyerProfile = {
  id: string;
  user_id: string;
  name: string | null;
  budget: number | null;
  desired_monthly_payment: number | null;
  household_size: number | null;
  pets: boolean | null;
  work_from_home: boolean | null;
  school_importance: number | null;
  commute_importance: number | null;
  retirement_planning: boolean | null;
  accessibility_needs: string | null;
  must_have_features: string | null;
  nice_to_have_features: string | null;
  deal_breakers: string | null;
  requires_pool: boolean;
  requires_lanai: boolean;
  requires_no_carpet: boolean;
  minimum_garage_spaces: number | null;
  created_at: string;
  updated_at: string;
};

export type UserPriorities = {
  id: string;
  user_id: string;
  hospitals: PriorityScore | null;
  primary_care: PriorityScore | null;
  specialists: PriorityScore | null;
  urgent_care: PriorityScore | null;
  pharmacies: PriorityScore | null;
  medical_centers: PriorityScore | null;
  grocery_stores: PriorityScore | null;
  shopping: PriorityScore | null;
  banking: PriorityScore | null;
  restaurants: PriorityScore | null;
  coffee_shops: PriorityScore | null;
  veterinarians: PriorityScore | null;
  golf: PriorityScore | null;
  pickleball: PriorityScore | null;
  beaches: PriorityScore | null;
  parks: PriorityScore | null;
  walking_trails: PriorityScore | null;
  boating: PriorityScore | null;
  fishing: PriorityScore | null;
  fitness_centers: PriorityScore | null;
  churches: PriorityScore | null;
  community_centers: PriorityScore | null;
  volunteer_opportunities: PriorityScore | null;
  clubs: PriorityScore | null;
  senior_activities: PriorityScore | null;
  social_events: PriorityScore | null;
  schools: PriorityScore | null;
  daycare: PriorityScore | null;
  family_activities: PriorityScore | null;
  nearby_relatives: PriorityScore | null;
  public_transportation: PriorityScore | null;
  walkability: PriorityScore | null;
  bike_access: PriorityScore | null;
  airport_access: PriorityScore | null;
  ride_share: PriorityScore | null;
  assisted_transportation: PriorityScore | null;
  created_at: string;
  updated_at: string;
};

export type FutureReadinessProfile = {
  id: string;
  user_id: string;
  reduce_driving: "yes" | "no" | "unsure" | null;
  accessibility_importance: PriorityScore | null;
  maintenance_tolerance: "very_little" | "some" | "moderate" | "significant" | null;
  stair_tolerance: "prefer_single_level" | "moderate_stairs" | "no_preference" | null;
  created_at: string;
  updated_at: string;
};

export type LifestyleProfile = {
  id: string;
  user_id: string;
  life_stage:
    | "young_professional"
    | "couple"
    | "family_with_children"
    | "empty_nester"
    | "active_adult"
    | "retiree"
    | "other"
    | "prefer_not_to_say"
    | null;
  age_range: string | null;
  retirement_status: string | null;
  household_size: number | null;
  pet_ownership: boolean | null;
  work_from_home: boolean | null;
  created_at: string;
  updated_at: string;
};

export type Property = {
  id: string;
  user_id: string;
  project_mode: ProjectMode;
  property_category: PropertyCategory;
  region_key: RegionKey;
  property_name: string;
  address: string;
  purchase_price: number | null;
  property_taxes: number | null;
  hoa_fees: number | null;
  insurance_estimate: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_footage: number | null;
  lot_size: string | null;
  year_built: number | null;
  garage_spaces: number | null;
  has_pool: boolean | null;
  has_lanai: boolean | null;
  flooring_type: "unknown" | "hard_surface" | "mixed" | "carpet";
  latitude: number | null;
  longitude: number | null;
  fema_flood_status: "mapped" | "not_mapped" | "unavailable" | null;
  fema_flood_zone: string | null;
  fema_zone_subtype: string | null;
  fema_sfha: boolean | null;
  fema_base_flood_elevation: number | null;
  fema_flood_depth: number | null;
  fema_flood_risk_level: "high" | "moderate" | "minimal" | "undetermined" | null;
  fema_checked_at: string | null;
  property_description: string | null;
  buyer_notes: string | null;
  nearby_amenities: string | null;
  shopping_score: number | null;
  healthcare_score: number | null;
  restaurants_score: number | null;
  parks_score: number | null;
  entertainment_score: number | null;
  walkability_score: number | null;
  growing_family_score: number | null;
  retirement_score: number | null;
  aging_in_place_score: number | null;
  resale_potential_score: number | null;
  remote_work_score: number | null;
  roof_condition: ConditionRating;
  hvac_condition: ConditionRating;
  foundation_condition: ConditionRating;
  kitchen_condition: ConditionRating;
  bathrooms_condition: ConditionRating;
  flooring_condition: ConditionRating;
  windows_condition: ConditionRating;
  exterior_condition: ConditionRating;
  lease_terms: string | null;
  move_timeline: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertyQuestion = {
  id: string;
  user_id: string;
  property_id: string;
  category: string;
  question_text: string;
  recipient_name: string | null;
  recipient_email: string | null;
  status: QuestionStatus;
  answer_text: string | null;
  sent_at: string | null;
  answered_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TimelineEvent = {
  id: string;
  user_id: string;
  property_id: string;
  event_type: string;
  title: string;
  notes: string | null;
  occurred_at: string;
  created_at: string;
};

export type PropertyPhoto = {
  id: string;
  property_id: string;
  user_id: string;
  storage_path: string;
  category: string | null;
  caption: string | null;
  concern_level: string | null;
  concern_tags: string[] | null;
  created_at: string;
};

export type PropertyContact = {
  id: string;
  user_id: string;
  property_id: string;
  contact_type: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  phone: string | null;
  photo_storage_path: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type ScoreBreakdown = {
  propertyFitScore: number;
  riskScore: number;
  lifestyleScore: number;
  costScore: number;
  confidenceScore: number;
  propertyRisk: number;
  locationRisk: number;
  futureExpenseRisk: number;
  overall: number;
  fitScore: number;
};

export type RecommendationLevel =
  | "Excellent Match"
  | "Strong Candidate"
  | "Proceed With Caution"
  | "High Risk"
  | "Not Recommended";

export const PROPERTY_CATEGORY_LABELS: Record<PropertyCategory, string> = {
  single_family: "Single Family",
  condo: "Condo",
  townhome: "Townhome",
  apartment: "Apartment",
  rental_home: "Rental Home",
  "55_plus": "55+ Community",
  new_construction: "New Construction",
  vacant_land: "Vacant Land",
  investment: "Investment Property",
};

export const REGION_LABELS: Record<RegionKey, string> = {
  general: "General",
  southwest_florida: "Southwest Florida",
  texas: "Texas",
  washington: "Washington State",
  california: "California",
  arizona: "Arizona",
};

export const REGIONAL_INTELLIGENCE: Record<RegionKey, string[]> = {
  southwest_florida: [
    "Flood risk",
    "Hurricane exposure",
    "Roof age",
    "Wind mitigation",
    "Impact windows",
    "HOA reserves",
    "Condo assessments",
    "Milestone inspections",
    "Seawall conditions",
    "Salt air exposure",
    "Flood insurance",
    "Insurance availability",
  ],
  texas: [
    "Foundation movement",
    "Clay soil",
    "Property tax burden",
    "MUD taxes",
    "Water restrictions",
  ],
  washington: [
    "Moisture intrusion",
    "Mold risks",
    "Drainage",
    "Roof moss",
    "Septic systems",
  ],
  california: [
    "Wildfire zones",
    "Earthquake concerns",
    "Insurance availability",
    "Drought restrictions",
  ],
  arizona: [
    "Heat exposure",
    "Water availability",
    "Roof and HVAC wear",
    "Flash flood drainage",
    "Desert pest concerns",
  ],
  general: [
    "Insurance availability",
    "Utility costs",
    "Deferred maintenance",
    "Local restrictions",
    "Future resale concerns",
  ],
};

const CATEGORY_WEIGHTS = {
  costScore: 0.25,
  lifestyleScore: 0.2,
  propertyRisk: 0.2,
  locationRisk: 0.2,
  futureExpenseRisk: 0.15,
} as const;

const CONDITION_SCORES: Record<ConditionRating, number> = {
  excellent: 100,
  good: 82,
  average: 65,
  poor: 35,
  unknown: 55,
};

function average(values: Array<number | null | undefined>, fallback = 70) {
  const valid = values.filter((value): value is number => typeof value === "number");
  if (!valid.length) return fallback;
  return Math.round(valid.reduce((sum, value) => sum + value, 0) / valid.length);
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function priorityAverage(values: Array<PriorityScore | null | undefined>) {
  return average(values, 0);
}

function notesMention(text: string | null | undefined, keywords: string[]) {
  if (!text) return false;
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function inferredLocationScore(
  explicitScore: number | null | undefined,
  priority: number,
  notes: string | null | undefined,
  keywords: string[]
) {
  if (typeof explicitScore === "number") return explicitScore;
  if (notesMention(notes, keywords)) return 76;
  if (priority >= 3) return 58;
  if (priority > 0) return 66;
  return null;
}

export function estimateMonthlyCost(property: Property): number | null {
  if (!property.purchase_price) return null;

  const principalAndInterest = property.project_mode === "renting"
    ? property.purchase_price
    : property.purchase_price * 0.0063;
  const taxes = property.project_mode === "renting"
    ? 0
    : (property.property_taxes ?? property.purchase_price * 0.011) / 12;
  const hoa = property.hoa_fees ?? 0;
  const insurance = property.project_mode === "renting"
    ? property.insurance_estimate ?? 25
    : (property.insurance_estimate ?? property.purchase_price * 0.0035) / 12;

  return Math.round(principalAndInterest + taxes + hoa + insurance);
}

export function informationCompletenessScore(property: Property) {
  const checks: Array<[string, unknown]> = [
    [property.project_mode === "renting" ? "Monthly rent" : "Price or housing budget", property.purchase_price],
    ["Insurance information", property.insurance_estimate],
    ["Square footage", property.square_footage],
    ["Bedrooms", property.bedrooms],
    ["Bathrooms", property.bathrooms],
    ["Year built", property.year_built],
    ["Garage spaces", property.garage_spaces],
    ["Pool", property.has_pool !== null],
    ["Lanai", property.has_lanai !== null],
    ["Flooring type", property.flooring_type !== "unknown"],
    ["Property description", property.property_description],
    ["Personal notes", property.buyer_notes],
    ["Nearby amenities", property.nearby_amenities],
    ["FEMA flood-zone research", property.fema_flood_status === "mapped" || property.fema_flood_status === "not_mapped"],
    ["Roof age or condition", property.roof_condition !== "unknown"],
    ["HVAC condition", property.hvac_condition !== "unknown"],
    ["Foundation condition", property.foundation_condition !== "unknown"],
    ["Windows condition", property.windows_condition !== "unknown"],
  ];

  if (property.project_mode === "renting") {
    checks.push(["Lease terms", property.lease_terms]);
  } else {
    checks.push(["Taxes", property.property_taxes]);
    checks.push(["HOA or community fees", property.hoa_fees]);
  }

  const complete = checks.filter(([, value]) => Boolean(value)).length;
  const missing = checks
    .filter(([, value]) => !value)
    .map(([label]) => label);

  return {
    score: Math.round((complete / checks.length) * 100),
    missing,
  };
}

export function futureExpenseForecast(property: Property) {
  const items = [
    ["Roof replacement window", property.roof_condition],
    ["HVAC replacement window", property.hvac_condition],
    ["Water heater and plumbing review", property.hvac_condition === "unknown" ? "unknown" : "average"],
    ["Exterior maintenance", property.exterior_condition],
    ["Windows and weatherproofing", property.windows_condition],
  ] as const;

  return items.map(([label, condition]) => ({
    label,
    priority:
      condition === "poor"
        ? "High"
        : condition === "unknown" || condition === "average"
          ? "Verify"
          : "Monitor",
  }));
}

export function propertyScoreBreakdown(
  property: Property,
  buyerProfile?: BuyerProfile | null,
  userPriorities?: UserPriorities | null,
  futureReadiness?: FutureReadinessProfile | null
): ScoreBreakdown {
  const monthlyCost = estimateMonthlyCost(property);
  const budget = buyerProfile?.budget;
  const desiredMonthly = buyerProfile?.desired_monthly_payment;

  const priceFit = budget && property.purchase_price && property.project_mode !== "renting"
    ? clampScore(100 - Math.max(0, (property.purchase_price - budget) / budget) * 140)
    : 72;
  const paymentFit = desiredMonthly && monthlyCost
    ? clampScore(100 - Math.max(0, (monthlyCost - desiredMonthly) / desiredMonthly) * 160)
    : 72;
  const carryingCostPressure = property.hoa_fees && property.hoa_fees > 500 ? 58 : 78;
  const costScore = average([priceFit, paymentFit, carryingCostPressure]);
  const healthcarePriority = priorityAverage([
    userPriorities?.hospitals,
    userPriorities?.primary_care,
    userPriorities?.specialists,
    userPriorities?.urgent_care,
    userPriorities?.pharmacies,
    userPriorities?.medical_centers,
  ]);
  const dailyLivingPriority = priorityAverage([
    userPriorities?.grocery_stores,
    userPriorities?.shopping,
    userPriorities?.banking,
    userPriorities?.restaurants,
    userPriorities?.coffee_shops,
    userPriorities?.veterinarians,
  ]);
  const recreationPriority = priorityAverage([
    userPriorities?.golf,
    userPriorities?.pickleball,
    userPriorities?.beaches,
    userPriorities?.parks,
    userPriorities?.walking_trails,
    userPriorities?.boating,
    userPriorities?.fishing,
    userPriorities?.fitness_centers,
  ]);
  const transportationPriority = priorityAverage([
    userPriorities?.public_transportation,
    userPriorities?.walkability,
    userPriorities?.bike_access,
    userPriorities?.airport_access,
    userPriorities?.ride_share,
    userPriorities?.assisted_transportation,
  ]);
  const shoppingScore = inferredLocationScore(
    property.shopping_score,
    dailyLivingPriority,
    property.nearby_amenities,
    ["grocery", "shopping", "store", "market", "bank", "coffee", "restaurant", "veterinarian", "vet"]
  );
  const healthcareScore = inferredLocationScore(
    property.healthcare_score,
    healthcarePriority,
    property.nearby_amenities,
    ["hospital", "doctor", "physician", "clinic", "urgent care", "pharmacy", "medical", "healthcare"]
  );
  const restaurantsScore = inferredLocationScore(
    property.restaurants_score,
    dailyLivingPriority,
    property.nearby_amenities,
    ["restaurant", "dining", "coffee", "cafe", "bar"]
  );
  const parksScore = inferredLocationScore(
    property.parks_score,
    recreationPriority,
    property.nearby_amenities,
    ["park", "trail", "beach", "golf", "pickleball", "fitness", "gym", "recreation"]
  );
  const entertainmentScore = inferredLocationScore(
    property.entertainment_score,
    recreationPriority,
    property.nearby_amenities,
    ["entertainment", "theater", "cinema", "music", "events", "club", "community center"]
  );
  const walkabilityScore = inferredLocationScore(
    property.walkability_score,
    transportationPriority,
    property.nearby_amenities,
    ["walk", "walkable", "sidewalk", "transit", "bus", "train", "bike", "airport", "rideshare"]
  );

  const bedroomNeed = buyerProfile?.household_size
    ? clampScore(((property.bedrooms ?? 0) / Math.max(1, buyerProfile.household_size / 2)) * 65)
    : 72;
  const officeFit = buyerProfile?.work_from_home ? property.remote_work_score : 75;
  const petFit = buyerProfile?.pets ? average([parksScore, property.lot_size ? 82 : 60]) : 75;
  const accessibilityFit = buyerProfile?.accessibility_needs || (futureReadiness?.accessibility_importance ?? 0) >= 3
    ? property.aging_in_place_score
    : 75;
  const healthcareFit = healthcarePriority > 0 ? healthcareScore : null;
  const dailyLivingFit = dailyLivingPriority > 0
    ? average([shoppingScore, restaurantsScore])
    : null;
  const recreationFit = recreationPriority > 0
    ? average([parksScore, entertainmentScore])
    : null;
  const transportationFit = transportationPriority > 0 || futureReadiness?.reduce_driving === "yes"
    ? walkabilityScore
    : null;
  const featureFits = [
    buyerProfile?.requires_pool && property.has_pool !== null
      ? property.has_pool ? 100 : 25
      : null,
    buyerProfile?.requires_lanai && property.has_lanai !== null
      ? property.has_lanai ? 100 : 25
      : null,
    buyerProfile?.requires_no_carpet && property.flooring_type !== "unknown"
      ? property.flooring_type === "hard_surface"
        ? 100
        : property.flooring_type === "mixed"
          ? 45
          : 10
      : null,
    buyerProfile?.minimum_garage_spaces && property.garage_spaces !== null
      ? property.garage_spaces >= buyerProfile.minimum_garage_spaces
        ? 100
        : clampScore((property.garage_spaces / buyerProfile.minimum_garage_spaces) * 70)
      : null,
  ];
  const propertyFeatureFit = average(featureFits, 0);
  const lifestyleScore = average([
    bedroomNeed,
    officeFit,
    petFit,
    accessibilityFit,
    healthcareFit,
    dailyLivingFit,
    recreationFit,
    transportationFit,
    propertyFeatureFit,
  ]);

  const femaFloodSafety = property.fema_flood_status === "mapped"
    ? property.fema_flood_risk_level === "high"
      ? 30
      : property.fema_flood_risk_level === "moderate"
        ? 65
        : property.fema_flood_risk_level === "minimal"
          ? 92
          : 55
    : null;
  const propertyRisk = average([
    CONDITION_SCORES[property.roof_condition],
    CONDITION_SCORES[property.hvac_condition],
    CONDITION_SCORES[property.foundation_condition],
    CONDITION_SCORES[property.kitchen_condition],
    CONDITION_SCORES[property.bathrooms_condition],
    CONDITION_SCORES[property.flooring_condition],
    CONDITION_SCORES[property.windows_condition],
    CONDITION_SCORES[property.exterior_condition],
    femaFloodSafety,
  ]);

  const locationRisk = average([
    shoppingScore,
    healthcareScore,
    restaurantsScore,
    parksScore,
    entertainmentScore,
    walkabilityScore,
  ]);

  const baseFutureExpenseRisk = average([
    property.growing_family_score,
    property.retirement_score,
    property.aging_in_place_score,
    property.resale_potential_score,
    property.remote_work_score,
  ]);
  const maintenanceAdjustment =
    futureReadiness?.maintenance_tolerance === "very_little" && property.property_category === "single_family"
      ? -8
      : futureReadiness?.maintenance_tolerance === "significant"
        ? 4
        : 0;
  const stairAdjustment =
    futureReadiness?.stair_tolerance === "prefer_single_level" && property.property_category === "townhome"
      ? -6
      : 0;
  const futureExpenseRisk = clampScore(baseFutureExpenseRisk + maintenanceAdjustment + stairAdjustment);

  const overall = clampScore(
    costScore * CATEGORY_WEIGHTS.costScore +
      lifestyleScore * CATEGORY_WEIGHTS.lifestyleScore +
      propertyRisk * CATEGORY_WEIGHTS.propertyRisk +
      locationRisk * CATEGORY_WEIGHTS.locationRisk +
      futureExpenseRisk * CATEGORY_WEIGHTS.futureExpenseRisk
  );

  const confidenceScore = informationCompletenessScore(property).score;
  const propertyFitScore = average([costScore, lifestyleScore, locationRisk, futureExpenseRisk]);
  const riskScore = clampScore(100 - average([costScore, propertyRisk, futureExpenseRisk]));

  return {
    propertyFitScore,
    riskScore,
    lifestyleScore,
    costScore,
    confidenceScore,
    propertyRisk,
    locationRisk,
    futureExpenseRisk,
    overall,
    fitScore: propertyFitScore,
  };
}

export function recommendationForScore(score: number): RecommendationLevel {
  if (score >= 90) return "Excellent Match";
  if (score >= 80) return "Strong Candidate";
  if (score >= 70) return "Proceed With Caution";
  if (score >= 60) return "High Risk";
  return "Not Recommended";
}

export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function generatePropertyInsights(
  property: Property,
  buyerProfile?: BuyerProfile | null,
  userPriorities?: UserPriorities | null,
  futureReadiness?: FutureReadinessProfile | null
) {
  const scores = propertyScoreBreakdown(property, buyerProfile, userPriorities, futureReadiness);
  const completeness = informationCompletenessScore(property);
  const regionalRisks = REGIONAL_INTELLIGENCE[property.region_key];
  const strengths: string[] = [];
  const risks: string[] = [];
  const actions: string[] = [];

  if (scores.costScore >= 80) strengths.push("Core costs appear aligned with your target budget.");
  if (scores.locationRisk >= 80) strengths.push("Location amenities and walkability rate strongly.");
  if (scores.propertyRisk >= 80) strengths.push("Major visible condition categories look solid.");
  if (scores.futureExpenseRisk >= 80) strengths.push("The property shows fewer visible future expense concerns.");
  if ((property.bedrooms ?? 0) >= 3) strengths.push("Bedroom count gives the household room to adapt.");
  if ((userPriorities?.pharmacies ?? 0) >= 3 && (property.healthcare_score ?? 0) >= 75) {
    strengths.push("This property scores better for you because pharmacy and healthcare access are important priorities.");
  }
  if ((userPriorities?.grocery_stores ?? 0) >= 3 && (property.shopping_score ?? 0) >= 75) {
    strengths.push("Daily convenience improves because grocery and shopping access align with your priorities.");
  }
  if (futureReadiness?.reduce_driving === "yes" && (property.walkability_score ?? 0) >= 75) {
    strengths.push("Walkability supports your goal to reduce driving in the future.");
  }

  if (scores.costScore < 70) risks.push("Monthly costs may pressure the target payment.");
  if (scores.propertyRisk < 70) risks.push("Condition ratings point to inspection and repair risk.");
  if (property.roof_condition === "poor" || property.roof_condition === "unknown") risks.push("Roof age or condition needs verification.");
  if (property.foundation_condition === "poor" || property.foundation_condition === "unknown") risks.push("Foundation uncertainty could become a major cost.");
  if (property.fema_flood_risk_level === "high") risks.push(`FEMA maps this coordinate in high-risk flood zone ${property.fema_flood_zone ?? "unknown"}.`);
  if (property.fema_flood_risk_level === "moderate") risks.push(`FEMA maps this coordinate in a moderate flood-hazard area (Zone ${property.fema_flood_zone ?? "unknown"}).`);
  if (completeness.score < 80) risks.push(`Information is ${completeness.score}% complete; missing items reduce confidence.`);

  actions.push("Send open questions to the responsible party and track responses.");
  actions.push("Verify regional risks before offer, lease signing, or relocation commitment.");
  if (scores.costScore < 75) actions.push("Request a full cost scenario with taxes, insurance, HOA, fees, and reserves.");
  if (scores.propertyRisk < 75) actions.push("Use inspection findings to quantify repair credits or price negotiation.");
  if (property.fema_flood_risk_level === "high" || property.fema_flood_risk_level === "moderate") actions.push("Confirm flood-insurance cost, requirements, and property-specific exposure with qualified sources.");

  return {
    strengths: strengths.slice(0, 5),
    risks: risks.slice(0, 5),
    regionalRisks,
    personalizedAnalysis: [
      `Lifestyle Score is personalized using your healthcare, daily living, recreation, community, family, and transportation priorities.`,
      `Confidence Score is lower when important information is missing, so BuyerIQ does not create false certainty.`,
      `Future Readiness considers driving plans, accessibility, maintenance tolerance, and stair tolerance.`,
    ],
    questionsToAsk: regionalRisks.slice(0, 5).map((risk) => `What should I verify about ${risk.toLowerCase()}?`),
    questionsForInspector: [
      "What are the highest-cost defects or near-term replacement items?",
      "Is there evidence of water intrusion, drainage problems, or structural movement?",
      "How much useful life remains for roof, HVAC, water heater, and major systems?",
      "Are there safety, electrical, plumbing, or code concerns?",
      "Which issues should be addressed before closing or lease signing?",
    ],
    negotiationOpportunities: [
      "Repair credits tied to verified defects",
      "Price, rent, or concession adjustment for deferred maintenance",
      "Seller or landlord-paid fixes before occupancy",
      "Warranty, service, or documentation requirements",
    ],
    hiddenCosts: [
      "Insurance premium changes",
      "HOA dues and special assessments",
      "Immediate repairs and safety fixes",
      "Utility and maintenance reserves",
      "Lease fees, renewal fees, or parking costs",
    ],
    actions,
  };
}
