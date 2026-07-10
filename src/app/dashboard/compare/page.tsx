import { Scale, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreBar } from "@/components/ui/score-bar";
import { getUserProfile } from "@/lib/data/user-profile";
import { createClient } from "@/lib/supabase/server";
import {
  estimateMonthlyCost,
  formatCurrency,
  propertyScoreBreakdown,
  recommendationForScore,
  type BuyerProfile,
  type FutureReadinessProfile,
  type Property,
  type UserPriorities,
} from "@/lib/types/database";

const conditionFields = [
  "roof_condition",
  "hvac_condition",
  "foundation_condition",
  "kitchen_condition",
  "bathrooms_condition",
  "flooring_condition",
  "windows_condition",
  "exterior_condition",
] as const;

const locationScoreFields = [
  "shopping_score",
  "healthcare_score",
  "restaurants_score",
  "parks_score",
  "entertainment_score",
  "walkability_score",
] as const;

const futureScoreFields = [
  "growing_family_score",
  "retirement_score",
  "aging_in_place_score",
  "resale_potential_score",
  "remote_work_score",
] as const;

function hasConditionEvidence(property: Property) {
  return conditionFields.some((field) => property[field] !== "unknown");
}

function hasLocationEvidence(property: Property) {
  return locationScoreFields.some((field) => typeof property[field] === "number");
}

function hasFutureEvidence(property: Property) {
  return futureScoreFields.some((field) => typeof property[field] === "number");
}

function hasCostEvidence(property: Property, buyerProfile: BuyerProfile | null) {
  if (!property.purchase_price) return false;
  return property.project_mode === "renting"
    ? Boolean(buyerProfile?.desired_monthly_payment)
    : Boolean(buyerProfile?.budget || buyerProfile?.desired_monthly_payment);
}

function hasLifestyleEvidence(property: Property, buyerProfile: BuyerProfile | null) {
  const hasFeatureEvidence = Boolean(
    (buyerProfile?.requires_pool && property.has_pool !== null) ||
    (buyerProfile?.requires_lanai && property.has_lanai !== null) ||
    (buyerProfile?.requires_no_carpet && property.flooring_type !== "unknown") ||
    (buyerProfile?.minimum_garage_spaces && property.garage_spaces !== null)
  );
  return hasLocationEvidence(property) || hasFeatureEvidence || Boolean(
    buyerProfile?.household_size && property.bedrooms !== null
  );
}

function supportedScore(score: number, supported: boolean, missing: string) {
  return supported ? `${score}/100` : `Needs ${missing}`;
}

export default async function ComparePage() {
  const supabase = await createClient();
  const profile = await getUserProfile();
  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(3);
  const { data: buyerProfile } = await supabase
    .from("buyer_profiles")
    .select("*")
    .eq("user_id", profile?.id ?? "")
    .maybeSingle();
  const { data: userPriorities } = await supabase
    .from("user_priorities")
    .select("*")
    .eq("user_id", profile?.id ?? "")
    .maybeSingle();
  const { data: futureReadiness } = await supabase
    .from("future_readiness_profiles")
    .select("*")
    .eq("user_id", profile?.id ?? "")
    .maybeSingle();

  const typedProperties = (properties ?? []) as Property[];
  const typedBuyerProfile = buyerProfile as BuyerProfile | null;
  const typedPriorities = userPriorities as UserPriorities | null;
  const typedReadiness = futureReadiness as FutureReadinessProfile | null;
  const ranked = typedProperties
    .map((property) => ({
      property,
      scores: propertyScoreBreakdown(property, typedBuyerProfile, typedPriorities, typedReadiness),
    }))
    .sort((a, b) => b.scores.overall - a.scores.overall);
  const reliableRanked = ranked.filter((item) => item.scores.confidenceScore >= 70);
  const best = reliableRanked[0];
  const topScore = best?.scores.overall;
  const leaders = topScore === undefined
    ? []
    : reliableRanked.filter((item) => item.scores.overall === topScore);
  const isTie = leaders.length > 1;
  const monthlyCosts = ranked
    .map((item) => estimateMonthlyCost(item.property))
    .filter((cost): cost is number => cost !== null);
  const lowestMonthlyCost = monthlyCosts.length > 0 ? Math.min(...monthlyCosts) : null;
  const squareFootages = ranked
    .map((item) => item.property.square_footage)
    .filter((size): size is number => size !== null);
  const largestSquareFootage = squareFootages.length > 0 ? Math.max(...squareFootages) : null;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Property Comparison</h1>
        <p className="mt-1 text-muted-foreground">
          Compare your three most recently updated properties side by side.
        </p>
      </div>

      {ranked.length > 0 && (
        <Card>
          <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center">
            {!best || isTie ? <Scale className="size-5 text-primary" /> : <Trophy className="size-5 text-primary" />}
            <div>
              <p className="font-medium">
                {!best
                  ? "No reliable winner yet"
                  : isTie
                  ? `Top score is tied: ${leaders.map((item) => item.property.property_name).join(" and ")}`
                  : `Best overall choice: ${best.property.property_name}`}
              </p>
              {best ? (
                <>
                  <p className="text-sm text-muted-foreground">
                    BuyerIQ Score {best.scores.overall}/100 · {recommendationForScore(best.scores.overall)}
                  </p>
                  <ScoreBar value={best.scores.overall} className="mt-3 w-full sm:w-96" label="Top comparison score" />
                </>
              ) : (
                <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
                  These listings contain basic facts, but not enough condition, location, budget-fit, or future-readiness evidence to support percentage rankings.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="p-3 font-medium">Metric</th>
              {ranked.map(({ property }) => (
                <th key={property.id} className="p-3 font-medium">{property.property_name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Overall BuyerIQ Score", (item: typeof ranked[number]) => item.scores.confidenceScore >= 70 ? `${item.scores.overall}/100` : "Needs more data"],
              ["Recommendation", (item: typeof ranked[number]) => item.scores.confidenceScore >= 70 ? recommendationForScore(item.scores.overall) : "Not yet available"],
              ["Property type", (item: typeof ranked[number]) => item.property.property_category.replaceAll("_", " ")],
              ["Bedrooms", (item: typeof ranked[number]) => item.property.bedrooms?.toString() ?? "Unknown"],
              ["Bathrooms", (item: typeof ranked[number]) => item.property.bathrooms?.toString() ?? "Unknown"],
              ["Square footage", (item: typeof ranked[number]) => item.property.square_footage?.toLocaleString() ?? "Unknown"],
              ["Year built", (item: typeof ranked[number]) => item.property.year_built?.toString() ?? "Unknown"],
              ["Pool", (item: typeof ranked[number]) => item.property.has_pool === null ? "Unknown" : item.property.has_pool ? "Yes" : "No"],
              ["Lanai", (item: typeof ranked[number]) => item.property.has_lanai === null ? "Unknown" : item.property.has_lanai ? "Yes" : "No"],
              ["Flooring", (item: typeof ranked[number]) => item.property.flooring_type === "hard_surface" ? "No carpet / hard surface" : item.property.flooring_type === "mixed" ? "Mixed flooring" : item.property.flooring_type === "carpet" ? "Carpet" : "Unknown"],
              ["Garage spaces", (item: typeof ranked[number]) => item.property.garage_spaces?.toString() ?? "Unknown"],
              ["FEMA flood zone", (item: typeof ranked[number]) => item.property.fema_flood_status === "mapped" ? `Zone ${item.property.fema_flood_zone ?? "unknown"} · ${item.property.fema_flood_risk_level ?? "undetermined"} mapped risk` : item.property.fema_flood_status === "not_mapped" ? "No mapped hazard polygon" : "Not researched"],
              ["FEMA Special Flood Hazard Area", (item: typeof ranked[number]) => item.property.fema_sfha === null ? "Unknown" : item.property.fema_sfha ? "Yes" : "No"],
              ["Monthly costs", (item: typeof ranked[number]) => formatCurrency(estimateMonthlyCost(item.property))],
              ["Risk factors", (item: typeof ranked[number]) => supportedScore(item.scores.riskScore, hasConditionEvidence(item.property), "condition ratings")],
              ["Cost Score", (item: typeof ranked[number]) => supportedScore(item.scores.costScore, hasCostEvidence(item.property, typedBuyerProfile), "a budget target")],
              ["Lifestyle Score", (item: typeof ranked[number]) => supportedScore(item.scores.lifestyleScore, hasLifestyleEvidence(item.property, typedBuyerProfile), "profile and location data")],
              ["Property Condition", (item: typeof ranked[number]) => supportedScore(item.scores.propertyRisk, hasConditionEvidence(item.property), "condition ratings")],
              ["Location Fit", (item: typeof ranked[number]) => supportedScore(item.scores.locationRisk, hasLocationEvidence(item.property), "location research")],
              ["Future Readiness", (item: typeof ranked[number]) => supportedScore(item.scores.futureExpenseRisk, hasFutureEvidence(item.property), "future-readiness ratings")],
              ["Confidence Score", (item: typeof ranked[number]) => `${item.scores.confidenceScore}/100`],
            ].map(([label, render]) => (
              <tr key={String(label)} className="border-t">
                <td className="p-3 font-medium">{String(label)}</td>
                {ranked.map((item) => (
                  <td key={item.property.id} className="p-3 text-muted-foreground">
                    {(render as (item: typeof ranked[number]) => string)(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {ranked.map(({ property, scores }) => {
          const monthlyCost = estimateMonthlyCost(property);
          const highlights = [
            monthlyCost !== null && monthlyCost === lowestMonthlyCost
              ? "Lowest estimated monthly cost"
              : null,
            property.square_footage !== null && property.square_footage === largestSquareFootage
              ? "Largest living area"
              : null,
          ].filter((value): value is string => value !== null);

          return (
          <Card key={property.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 text-lg">
                {property.property_name}
                <Badge variant="secondary">
                  {scores.confidenceScore >= 70 ? scores.overall : "Needs data"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {scores.confidenceScore >= 70 && (
                <ScoreBar value={scores.overall} label={`${property.property_name} BuyerIQ score`} />
              )}
              <p>
                <span className="font-medium text-foreground">Highlights:</span>{" "}
                {highlights.length > 0 ? highlights.join(" · ") : "No clear quantitative advantage yet."}
              </p>
              <p>
                <span className="font-medium text-foreground">Confidence:</span>{" "}
                {scores.confidenceScore}/100
                {scores.confidenceScore < 70 ? " — add condition and location research before relying on this score." : ""}
              </p>
            </CardContent>
          </Card>
          );
        })}
      </div>
    </div>
  );
}
