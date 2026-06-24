import Link from "next/link";
import { Plus, Building2, FileText, Gauge, MessageSquareText, ShieldAlert } from "lucide-react";
import { PlanBadge, UpgradeBanner } from "@/components/billing/plan-status";
import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserProfile } from "@/lib/data/user-profile";
import { createClient } from "@/lib/supabase/server";
import { hasMinPlan } from "@/lib/types/plans";
import {
  propertyScoreBreakdown,
  type BuyerProfile,
  type FutureReadinessProfile,
  type Property,
  type PropertyQuestion,
  type UserPriorities,
} from "@/lib/types/database";

export default async function DashboardPage() {
  const profile = await getUserProfile();
  const plan = profile?.plan ?? "free";
  const canAddProperties = hasMinPlan(plan, "standard");

  let typedProperties: Property[] = [];
  let typedQuestions: PropertyQuestion[] = [];
  let typedBuyerProfile: BuyerProfile | null = null;
  let typedPriorities: UserPriorities | null = null;
  let typedReadiness: FutureReadinessProfile | null = null;

  try {
    const supabase = await createClient();
    const [
      { data: properties },
      { data: buyerProfile },
      { data: userPriorities },
      { data: futureReadiness },
      { data: questions },
    ] = await Promise.all([
      supabase
        .from("properties")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(6),
      supabase
        .from("buyer_profiles")
        .select("*")
        .eq("user_id", profile?.id ?? "")
        .maybeSingle(),
      supabase
        .from("user_priorities")
        .select("*")
        .eq("user_id", profile?.id ?? "")
        .maybeSingle(),
      supabase
        .from("future_readiness_profiles")
        .select("*")
        .eq("user_id", profile?.id ?? "")
        .maybeSingle(),
      supabase
        .from("questions")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(6),
    ]);

    typedProperties = (properties ?? []) as Property[];
    typedQuestions = (questions ?? []) as PropertyQuestion[];
    typedBuyerProfile = buyerProfile as BuyerProfile | null;
    typedPriorities = userPriorities as UserPriorities | null;
    typedReadiness = futureReadiness as FutureReadinessProfile | null;
  } catch {
    // Local preview mode: render the dashboard shell before Supabase is configured.
  }

  const scored = typedProperties
    .map((property) => ({
      property,
      score: propertyScoreBreakdown(property, typedBuyerProfile, typedPriorities, typedReadiness).overall,
    }))
    .filter((item): item is { property: Property; score: number } => item.score !== null);

  const topProperty = scored.sort((a, b) => b.score - a.score)[0];

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <PlanBadge plan={plan} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Welcome back{profile?.email ? `, ${profile.email.split("@")[0]}` : ""}
          </h1>
          <p className="mt-1 text-muted-foreground">
            Your real estate due diligence command center at buyeriq.app
          </p>
        </div>
        {canAddProperties ? (
          <Button asChild>
            <Link href="/dashboard/properties/new">
              <Plus className="size-4" />
              Add property
            </Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/pricing">Buy BuyerIQ Standard</Link>
          </Button>
        )}
      </div>

      <UpgradeBanner plan={plan} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Properties tracked
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Building2 className="size-5 text-primary" />
            <span className="text-3xl font-semibold">{typedProperties.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Evaluated
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Gauge className="size-5 text-primary" />
            <span className="text-3xl font-semibold">{scored.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Top score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-semibold">
              {topProperty ? `${topProperty.score}/100` : "—"}
            </span>
            {topProperty && (
              <p className="mt-1 truncate text-sm text-muted-foreground">
                {topProperty.property.property_name}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg risk
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <ShieldAlert className="size-5 text-primary" />
            <span className="text-3xl font-semibold">
              {scored.length
                ? Math.round(
                    typedProperties.reduce(
                      (sum, property) =>
                        sum + propertyScoreBreakdown(property, typedBuyerProfile, typedPriorities, typedReadiness).riskScore,
                      0
                    ) / typedProperties.length
                  )
                : "-"}
            </span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending questions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <MessageSquareText className="size-5 text-primary" />
            <span className="text-3xl font-semibold">
              {typedQuestions.filter((question) => question.status !== "closed").length}
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Outstanding risks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {typedProperties.length === 0 ? (
              <p>No risk signals yet.</p>
            ) : (
              typedProperties
                .map((property) => ({
                  property,
                  risk: propertyScoreBreakdown(property, typedBuyerProfile, typedPriorities, typedReadiness).riskScore,
                }))
                .sort((a, b) => b.risk - a.risk)
                .slice(0, 3)
                .map(({ property, risk }) => (
                  <p key={property.id}>{property.property_name}: risk {risk}/100</p>
                ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Document records are ready in the schema for HOA files, leases, disclosures, and inspection reports.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            {typedQuestions.filter((question) => question.status === "follow_up_required").length ? (
              typedQuestions
                .filter((question) => question.status === "follow_up_required")
                .slice(0, 3)
                .map((question) => <p key={question.id}>Follow up: {question.question_text}</p>)
            ) : (
              <p>Review open questions and missing completeness items before making a decision.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent properties</h2>
          {typedProperties.length > 0 && (
            <Button variant="ghost" asChild>
              <Link href="/dashboard/properties">View all</Link>
            </Button>
          )}
        </div>

        {typedProperties.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <Building2 className="size-10 text-muted-foreground" />
              <div>
                <p className="font-medium">No properties yet</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add your first home to start building your intelligence report.
                </p>
              </div>
              <Button asChild>
                <Link href={canAddProperties ? "/dashboard/properties/new" : "/pricing"}>
              {canAddProperties ? "Add your first property" : "Unlock BuyerIQ"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {typedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                buyerProfile={typedBuyerProfile}
                userPriorities={typedPriorities}
                futureReadiness={typedReadiness}
              />
            ))}
          </div>
        )}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-xl">Pending questions</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/questions">Open center</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {typedQuestions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No questions logged yet.</p>
            ) : (
              typedQuestions.slice(0, 4).map((question) => (
                <div key={question.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{question.category}</p>
                  <p className="mt-1 text-muted-foreground">{question.question_text}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileText className="size-5 text-primary" />
              Property timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {typedProperties.slice(0, 4).map((property) => (
              <p key={property.id}>
                {property.property_name} updated {new Date(property.updated_at).toLocaleDateString()}
              </p>
            ))}
            {typedProperties.length === 0 && <p>No timeline activity yet.</p>}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
