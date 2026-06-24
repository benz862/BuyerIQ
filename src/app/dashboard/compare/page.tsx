import { Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  const best = ranked[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Property Comparison</h1>
        <p className="mt-1 text-muted-foreground">
          Compare your three most recently updated properties side by side.
        </p>
      </div>

      {best && (
        <Card>
          <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center">
            <Trophy className="size-5 text-primary" />
            <div>
              <p className="font-medium">Best overall choice: {best.property.property_name}</p>
              <p className="text-sm text-muted-foreground">
                Property Fit Score {best.scores.propertyFitScore}/100 · {recommendationForScore(best.scores.overall)}
              </p>
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
              ["Property Fit Score", (item: typeof ranked[number]) => `${item.scores.propertyFitScore}/100`],
              ["Recommendation", (item: typeof ranked[number]) => recommendationForScore(item.scores.overall)],
              ["Monthly costs", (item: typeof ranked[number]) => formatCurrency(estimateMonthlyCost(item.property))],
              ["Risk factors", (item: typeof ranked[number]) => `${item.scores.riskScore}/100`],
              ["Cost Score", (item: typeof ranked[number]) => `${item.scores.costScore}/100`],
              ["Lifestyle Score", (item: typeof ranked[number]) => `${item.scores.lifestyleScore}/100`],
              ["Property Risk", (item: typeof ranked[number]) => `${item.scores.propertyRisk}/100`],
              ["Location Risk", (item: typeof ranked[number]) => `${item.scores.locationRisk}/100`],
              ["Future Expense Risk", (item: typeof ranked[number]) => `${item.scores.futureExpenseRisk}/100`],
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
        {ranked.map(({ property, scores }) => (
          <Card key={property.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3 text-lg">
                {property.property_name}
                <Badge variant="secondary">{scores.overall}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Pros: strongest categories are surfaced in the report tab.</p>
              <p>Cons: inspect any category scoring below 70 before making an offer.</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
