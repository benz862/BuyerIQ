import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, ImageIcon, Mail, Phone, Trash2, UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScoreBar } from "@/components/ui/score-bar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PropertyContactForm, PropertyPhotoUploader } from "@/components/properties/property-media-manager";
import { createQuestion, deleteProperty, sendQuestionEmail } from "@/lib/actions/properties";
import { getUserProfile } from "@/lib/data/user-profile";
import { createClient } from "@/lib/supabase/server";
import {
  estimateMonthlyCost,
  formatCurrency,
  futureExpenseForecast,
  generatePropertyInsights,
  informationCompletenessScore,
  propertyScoreBreakdown,
  recommendationForScore,
  REGION_LABELS,
  type BuyerProfile,
  type FutureReadinessProfile,
  type Property,
  type PropertyContact,
  type PropertyPhoto,
  type PropertyQuestion,
  type TimelineEvent,
  type UserPriorities,
} from "@/lib/types/database";

const scoreRows = [
  ["propertyFitScore", "Property Fit Score"],
  ["riskScore", "Risk Score"],
  ["lifestyleScore", "Lifestyle Score"],
  ["costScore", "Cost Score"],
  ["confidenceScore", "Confidence Score"],
  ["propertyRisk", "Property Risk"],
  ["locationRisk", "Location Risk"],
  ["futureExpenseRisk", "Future Expense Risk"],
] as const;

const conditionRows: Array<[keyof Property, string]> = [
  ["roof_condition", "Roof"],
  ["hvac_condition", "HVAC"],
  ["foundation_condition", "Foundation"],
  ["kitchen_condition", "Kitchen"],
  ["bathrooms_condition", "Bathrooms"],
  ["flooring_condition", "Flooring"],
  ["windows_condition", "Windows"],
  ["exterior_condition", "Exterior"],
];

function InsightList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border/70 p-4">
      <h3 className="text-base font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

async function signedUrl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  bucket: string,
  path: string | null
) {
  if (!path) return null;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 10);
  return data?.signedUrl ?? null;
}

export default async function PropertyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const activeTab = resolvedSearchParams.tab ?? "overview";
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = await getUserProfile();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("user_id", user?.id ?? "")
    .single();
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
  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("property_id", id)
    .order("updated_at", { ascending: false });
  const { data: timeline } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("property_id", id)
    .order("occurred_at", { ascending: false });
  const { data: photos } = await supabase
    .from("property_photos")
    .select("*")
    .eq("property_id", id)
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false });
  const { data: contacts } = await supabase
    .from("property_contacts")
    .select("*")
    .eq("property_id", id)
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false });

  if (!property) {
    notFound();
  }

  const typedProperty = property as Property;
  const typedBuyerProfile = buyerProfile as BuyerProfile | null;
  const typedPriorities = userPriorities as UserPriorities | null;
  const typedReadiness = futureReadiness as FutureReadinessProfile | null;
  const typedQuestions = (questions ?? []) as PropertyQuestion[];
  const typedTimeline = (timeline ?? []) as TimelineEvent[];
  const typedPhotos = (photos ?? []) as PropertyPhoto[];
  const typedContacts = (contacts ?? []) as PropertyContact[];
  const photoViews = await Promise.all(
    typedPhotos.map(async (photo) => ({
      ...photo,
      signedUrl: await signedUrl(supabase, "property-photos", photo.storage_path),
    }))
  );
  const contactViews = await Promise.all(
    typedContacts.map(async (contact) => ({
      ...contact,
      signedUrl: await signedUrl(supabase, "contact-photos", contact.photo_storage_path),
    }))
  );
  const scores = propertyScoreBreakdown(typedProperty, typedBuyerProfile, typedPriorities, typedReadiness);
  const completeness = informationCompletenessScore(typedProperty);
  const monthlyCost = estimateMonthlyCost(typedProperty);
  const insights = generatePropertyInsights(typedProperty, typedBuyerProfile, typedPriorities, typedReadiness);
  const forecast = futureExpenseForecast(typedProperty);
  const recommendation = recommendationForScore(scores.overall);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/properties">
          <ArrowLeft className="size-4" />
          Back to properties
        </Link>
      </Button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {typedProperty.property_name}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {typedProperty.address} · {typedProperty.project_mode} · {REGION_LABELS[typedProperty.region_key]}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="#report">
              <Download className="size-4" />
              Report
            </Link>
          </Button>
          <form action={deleteProperty.bind(null, typedProperty.id)}>
            <Button variant="destructive" size="sm" type="submit">
              <Trash2 className="size-4" />
              Delete
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Property Fit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-semibold text-primary">{scores.propertyFitScore}</div>
            <ScoreBar value={scores.propertyFitScore} className="mt-3" label="Property fit score" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Risk</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-semibold">{scores.riskScore}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Confidence</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-semibold">{scores.confidenceScore}%</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Monthly Cost</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{formatCurrency(monthlyCost)}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Open Questions</CardTitle>
          </CardHeader>
          <CardContent className="text-4xl font-semibold">
            {typedQuestions.filter((question) => question.status !== "closed").length}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={activeTab} className="space-y-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="regional">Regional</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="condition">Condition</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="report">Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Score breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scoreRows.map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span className="text-muted-foreground">{scores[key]}/100</span>
                  </div>
                  <Progress value={scores[key]} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recommendation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Badge>{recommendation}</Badge>
              <p className="text-sm text-muted-foreground">
                Use this result to decide what to verify before an offer, lease, or relocation commitment.
              </p>
            </CardContent>
          </Card>
          <InsightList title="Strengths" items={insights.strengths} />
          <InsightList title="Concerns" items={insights.risks} />
          <InsightList title="Next actions" items={insights.actions} />
          <InsightList title="Personalized analysis" items={insights.personalizedAnalysis} />
        </TabsContent>

        <TabsContent value="questions" className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Question tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {typedQuestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No questions yet.</p>
              ) : (
                typedQuestions.map((question) => (
                  <div key={question.id} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-medium">{question.category}</p>
                      <Badge variant="secondary">{question.status.replaceAll("_", " ")}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{question.question_text}</p>
                    {question.recipient_email && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        To {question.recipient_name || "recipient"} · {question.recipient_email}
                      </p>
                    )}
                    {question.recipient_email && (
                      <form action={sendQuestionEmail.bind(null, question.id)} className="mt-3">
                        <Button size="sm" type="submit">Send email</Button>
                      </form>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Add question</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={createQuestion} className="space-y-3">
                <input type="hidden" name="property_id" value={typedProperty.id} />
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" name="category" placeholder="Insurance, HOA, lease terms..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question">Question</Label>
                  <Textarea id="question" name="question" rows={4} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient_name">Recipient</Label>
                  <Input id="recipient_name" name="recipient_name" placeholder="Realtor, landlord, builder..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipient_email">Recipient email</Label>
                  <Input id="recipient_email" name="recipient_email" type="email" />
                </div>
                <Button type="submit">Save question</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="regional" className="grid gap-4 lg:grid-cols-2">
          <InsightList title={`${REGION_LABELS[typedProperty.region_key]} intelligence`} items={insights.regionalRisks} />
          <InsightList title="Questions to ask" items={insights.questionsToAsk} />
        </TabsContent>

        <TabsContent value="photos" className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="size-5 text-primary" />
                Property photos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {photoViews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No photos saved yet. Take or upload photos for this address to keep visual due diligence with the property.
                </p>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {photoViews.map((photo) => (
                    <div key={photo.id} className="overflow-hidden rounded-xl border border-border/70 bg-card">
                      {photo.signedUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photo.signedUrl} alt={photo.caption ?? photo.category ?? "Property photo"} className="aspect-[4/3] w-full object-cover" />
                      ) : (
                        <div className="flex aspect-[4/3] items-center justify-center bg-muted text-muted-foreground">
                          <ImageIcon className="size-8" />
                        </div>
                      )}
                      <div className="space-y-2 p-3 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          {photo.category && <Badge variant="secondary">{photo.category}</Badge>}
                          {photo.concern_level && photo.concern_level !== "none" && (
                            <Badge variant="outline">{photo.concern_level.replace("_", " ")}</Badge>
                          )}
                        </div>
                        {photo.caption && <p className="text-muted-foreground">{photo.caption}</p>}
                        {photo.concern_tags?.length ? (
                          <p className="text-xs text-muted-foreground">{photo.concern_tags.join(", ")}</p>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <PropertyPhotoUploader propertyId={typedProperty.id} />
        </TabsContent>

        <TabsContent value="contacts" className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-5 text-primary" />
                Realtors and contacts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {contactViews.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No contacts saved yet. Add realtors, inspectors, landlords, or property managers connected to this property.
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {contactViews.map((contact) => (
                    <div key={contact.id} className="rounded-xl border border-border/70 p-4">
                      <div className="flex items-start gap-3">
                        <Avatar size="lg">
                          {contact.signedUrl && <AvatarImage src={contact.signedUrl} alt={contact.name} />}
                          <AvatarFallback>{contact.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm capitalize text-muted-foreground">
                            {contact.role || contact.contact_type.replaceAll("_", " ")}
                          </p>
                          {contact.company && <p className="text-sm text-muted-foreground">{contact.company}</p>}
                        </div>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        {contact.email && (
                          <p className="flex items-center gap-2">
                            <Mail className="size-4" />
                            <a href={`mailto:${contact.email}`} className="hover:text-foreground">{contact.email}</a>
                          </p>
                        )}
                        {contact.phone && (
                          <p className="flex items-center gap-2">
                            <Phone className="size-4" />
                            <a href={`tel:${contact.phone}`} className="hover:text-foreground">{contact.phone}</a>
                          </p>
                        )}
                        {contact.notes && <p>{contact.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          <PropertyContactForm propertyId={typedProperty.id} />
        </TabsContent>

        <TabsContent value="condition" className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Condition ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                {conditionRows.map(([key, label]) => (
                  <div key={key}>
                    <dt className="text-sm text-muted-foreground">{label}</dt>
                    <dd className="font-medium capitalize">{String(typedProperty[key]).replace("_", " ")}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
          <InsightList title="Future expense forecast" items={forecast.map((item) => `${item.label}: ${item.priority}`)} />
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Property timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border p-3">
                <p className="font-medium">Property added</p>
                <p className="text-sm text-muted-foreground">{new Date(typedProperty.created_at).toLocaleString()}</p>
              </div>
              {typedTimeline.map((event) => (
                <div key={event.id} className="rounded-lg border p-3">
                  <p className="font-medium">{event.title}</p>
                  {event.notes && <p className="mt-1 text-sm text-muted-foreground">{event.notes}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(event.occurred_at).toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Project notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p className="whitespace-pre-wrap">{typedProperty.buyer_notes || "No notes saved yet."}</p>
              {typedProperty.lease_terms && <p className="whitespace-pre-wrap">Lease terms: {typedProperty.lease_terms}</p>}
              {typedProperty.move_timeline && <p className="whitespace-pre-wrap">Timeline: {typedProperty.move_timeline}</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison">
          <Card>
            <CardContent className="flex flex-col items-start gap-4 py-8">
              <p className="text-muted-foreground">
                Compare this project against other saved properties by cost, risk, confidence, future expenses, and regional concerns.
              </p>
              <Button asChild>
                <Link href="/dashboard/compare">Open comparison tool</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="report" id="report">
          <Card>
            <CardHeader>
              <CardTitle>BuyerIQ Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold">Property summary</h3>
                <p className="mt-2 text-sm text-muted-foreground">{typedProperty.property_description || typedProperty.address}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Information Completeness Score: {completeness.score}%
                  {completeness.missing.length ? ` · Missing: ${completeness.missing.slice(0, 5).join(", ")}` : ""}
                </p>
              </div>
              <Separator />
              <div className="grid gap-4 md:grid-cols-2">
                <InsightList title="Strengths" items={insights.strengths} />
                <InsightList title="Concerns" items={insights.risks} />
                <InsightList title="Personalized analysis" items={insights.personalizedAnalysis} />
                <InsightList title="Open questions" items={typedQuestions.slice(0, 5).map((question) => question.question_text)} />
                <InsightList title="Future expenses" items={forecast.map((item) => `${item.label}: ${item.priority}`)} />
                <InsightList title="Regional risks" items={insights.regionalRisks} />
                <InsightList title="Recommendations" items={insights.actions} />
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold">Recommendation</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {recommendation} with a Property Fit Score of {scores.propertyFitScore}/100 and Confidence Score of {scores.confidenceScore}%.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
