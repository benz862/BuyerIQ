import { Save } from "lucide-react";
import { PrivacyCommitment, WhyWeAsk } from "@/components/profile/why-we-ask";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { saveBuyerProfile } from "@/lib/actions/properties";
import { getUserProfile } from "@/lib/data/user-profile";
import { createClient } from "@/lib/supabase/server";
import type {
  BuyerProfile,
  FutureReadinessProfile,
  LifestyleProfile,
  UserPriorities,
} from "@/lib/types/database";

const priorityGroups = [
  {
    title: "Healthcare Priorities",
    why: "Healthcare access can significantly affect relocation and property suitability.",
    how: "BuyerIQ weights hospitals, physicians, pharmacies, urgent care, and medical centers more heavily in lifestyle and relocation recommendations.",
    fields: [
      ["hospitals", "Hospitals"],
      ["primary_care", "Primary Care Physicians"],
      ["specialists", "Specialists"],
      ["urgent_care", "Urgent Care"],
      ["pharmacies", "Pharmacies"],
      ["medical_centers", "Medical Centers"],
    ],
  },
  {
    title: "Daily Living Priorities",
    why: "Frequent errands can significantly impact daily quality of life.",
    how: "BuyerIQ adjusts amenity rankings and lifestyle scoring around everyday convenience.",
    fields: [
      ["grocery_stores", "Grocery Stores"],
      ["shopping", "Shopping"],
      ["banking", "Banking"],
      ["restaurants", "Restaurants"],
      ["coffee_shops", "Coffee Shops"],
      ["veterinarians", "Veterinarians"],
    ],
  },
  {
    title: "Recreation Priorities",
    why: "Lifestyle fit depends on how you actually spend your time.",
    how: "BuyerIQ increases the influence of nearby recreation that matters to you.",
    fields: [
      ["golf", "Golf"],
      ["pickleball", "Pickleball"],
      ["beaches", "Beaches"],
      ["parks", "Parks"],
      ["walking_trails", "Walking Trails"],
      ["boating", "Boating"],
      ["fishing", "Fishing"],
      ["fitness_centers", "Fitness Centers"],
    ],
  },
  {
    title: "Community Priorities",
    why: "Community connection can be as important as the property itself.",
    how: "BuyerIQ uses these answers to prioritize community amenities and generate better local questions.",
    fields: [
      ["churches", "Churches"],
      ["community_centers", "Community Centers"],
      ["volunteer_opportunities", "Volunteer Opportunities"],
      ["clubs", "Clubs"],
      ["senior_activities", "Senior Activities"],
      ["social_events", "Social Events"],
    ],
  },
  {
    title: "Family Priorities",
    why: "Family-centered needs can change what makes a property suitable.",
    how: "BuyerIQ uses these priorities for lifestyle scoring, local questions, and relocation recommendations.",
    fields: [
      ["schools", "Schools"],
      ["daycare", "Daycare"],
      ["family_activities", "Family Activities"],
      ["nearby_relatives", "Nearby Relatives"],
    ],
  },
  {
    title: "Transportation Priorities",
    why: "Transportation needs vary widely and may change over time.",
    how: "BuyerIQ weights walkability, public transit, airport access, ride share, and assisted transportation in recommendations.",
    fields: [
      ["public_transportation", "Public Transportation"],
      ["walkability", "Walkability"],
      ["bike_access", "Bike Access"],
      ["airport_access", "Airport Access"],
      ["ride_share", "Ride Share Availability"],
      ["assisted_transportation", "Assisted Transportation Services"],
    ],
  },
] as const;

function scaledValue(values: unknown, key: string) {
  const value =
    typeof values === "object" && values !== null
      ? (values as Record<string, unknown>)[key]
      : undefined;
  return typeof value === "number" ? value : 0;
}

function PrioritySelect({
  name,
  label,
  priorities,
}: {
  name: string;
  label: string;
  priorities: unknown;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <select
        id={name}
        name={name}
        defaultValue={scaledValue(priorities, name)}
        className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
      >
        <option value="0">0 - Not Important</option>
        <option value="1">1 - Somewhat Important</option>
        <option value="2">2 - Important</option>
        <option value="3">3 - Very Important</option>
        <option value="4">4 - Essential</option>
      </select>
    </div>
  );
}

export default async function BuyerProfilePage() {
  const profile = await getUserProfile();
  let buyerProfile: BuyerProfile | null = null;
  let lifestyleProfile: LifestyleProfile | null = null;
  let futureReadiness: FutureReadinessProfile | null = null;
  let userPriorities: UserPriorities | null = null;

  try {
    const supabase = await createClient();
    const userId = profile?.id ?? "";
    const [{ data }, { data: lifestyle }, { data: readiness }, { data: priorities }] = await Promise.all([
      supabase.from("buyer_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("lifestyle_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("future_readiness_profiles").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("user_priorities").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    buyerProfile = data as BuyerProfile | null;
    lifestyleProfile = lifestyle as LifestyleProfile | null;
    futureReadiness = readiness as FutureReadinessProfile | null;
    userPriorities = priorities as UserPriorities | null;
  } catch {
    // Local preview without Supabase environment values.
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">My Priorities</h1>
        <p className="mt-1 text-muted-foreground">
          BuyerIQ evaluates properties through the lens of what matters most to you.
        </p>
      </div>

      <PrivacyCommitment />

      <form action={saveBuyerProfile} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Lifestyle Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={buyerProfile?.name ?? ""} />
                <WhyWeAsk
                  why="Reports and saved recommendations are easier to understand when they are personalized."
                  how="BuyerIQ uses this only to label your profile and reports."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="life_stage">Life stage</Label>
                <select id="life_stage" name="life_stage" defaultValue={lifestyleProfile?.life_stage ?? ""} className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="">Select one</option>
                  <option value="young_professional">Young Professional</option>
                  <option value="couple">Couple</option>
                  <option value="family_with_children">Family with Children</option>
                  <option value="empty_nester">Empty Nester</option>
                  <option value="active_adult">Active Adult</option>
                  <option value="retiree">Retiree</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer Not To Say</option>
                </select>
                <WhyWeAsk
                  why="People in different stages of life often prioritize different things when choosing a home or community."
                  how="BuyerIQ adjusts lifestyle recommendations, relocation priorities, nearby amenity rankings, and suggested questions."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age_range">Age range</Label>
                <select id="age_range" name="age_range" defaultValue={lifestyleProfile?.age_range ?? ""} className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
                  <option value="">Prefer not to say</option>
                  <option value="under_35">Under 35</option>
                  <option value="35_49">35-49</option>
                  <option value="50_64">50-64</option>
                  <option value="65_plus">65+</option>
                </select>
                <WhyWeAsk
                  why="Age range is optional and is never the primary recommendation driver."
                  how="BuyerIQ combines age range with your priorities and lifestyle profile to personalize recommendations."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retirement_status">Retirement status</Label>
                <Input id="retirement_status" name="retirement_status" defaultValue={lifestyleProfile?.retirement_status ?? ""} placeholder="Working, planning, retired..." />
                <WhyWeAsk
                  why="Retirement planning can affect transportation, healthcare, maintenance, and community priorities."
                  how="BuyerIQ uses this to improve future readiness and relocation recommendations."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget</Label>
                <Input id="budget" name="budget" type="number" min="0" defaultValue={buyerProfile?.budget ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desired_monthly_payment">Desired monthly payment</Label>
                <Input id="desired_monthly_payment" name="desired_monthly_payment" type="number" min="0" defaultValue={buyerProfile?.desired_monthly_payment ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="household_size">Household size</Label>
                <Input id="household_size" name="household_size" type="number" min="1" defaultValue={buyerProfile?.household_size ?? lifestyleProfile?.household_size ?? ""} />
                <WhyWeAsk
                  why="Household size affects space needs, bedroom suitability, storage, and future flexibility."
                  how="BuyerIQ uses this for property fit and lifestyle scoring."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accessibility_needs">Accessibility needs</Label>
                <Textarea id="accessibility_needs" name="accessibility_needs" rows={3} defaultValue={buyerProfile?.accessibility_needs ?? ""} />
                <WhyWeAsk
                  why="A property that works today may not work as well in the future."
                  how="BuyerIQ evaluates single-level living, entry access, stairs, bathrooms, walkability, and maintenance requirements."
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex items-center gap-3 text-sm">
                <Checkbox name="pets" defaultChecked={buyerProfile?.pets ?? lifestyleProfile?.pet_ownership ?? false} />
                Pet ownership
              </label>
              <label className="flex items-center gap-3 text-sm">
                <Checkbox name="work_from_home" defaultChecked={buyerProfile?.work_from_home ?? lifestyleProfile?.work_from_home ?? false} />
                Work from home
              </label>
              <label className="flex items-center gap-3 text-sm">
                <Checkbox name="retirement_planning" defaultChecked={buyerProfile?.retirement_planning ?? false} />
                Retirement planning
              </label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Future Readiness</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="reduce_driving">Would you like to reduce your driving in the future?</Label>
              <select id="reduce_driving" name="reduce_driving" defaultValue={futureReadiness?.reduce_driving ?? ""} className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="">Unsure</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
                <option value="unsure">Unsure</option>
              </select>
              <WhyWeAsk why="Transportation needs often change over time." how="BuyerIQ increases the importance of walkability, nearby services, public transportation, and assisted transportation options." />
            </div>
            <PrioritySelect name="accessibility_importance" label="Accessibility importance" priorities={{ accessibility_importance: futureReadiness?.accessibility_importance ?? 0 }} />
            <div className="space-y-2">
              <Label htmlFor="maintenance_tolerance">Home maintenance tolerance</Label>
              <select id="maintenance_tolerance" name="maintenance_tolerance" defaultValue={futureReadiness?.maintenance_tolerance ?? ""} className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="">Select one</option>
                <option value="very_little">Very Little</option>
                <option value="some">Some</option>
                <option value="moderate">Moderate</option>
                <option value="significant">Significant</option>
              </select>
              <WhyWeAsk why="Some buyers enjoy maintaining a property while others prefer minimal upkeep." how="BuyerIQ adjusts recommendations based on property type, landscaping requirements, exterior maintenance, and community services." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stair_tolerance">Stair tolerance</Label>
              <select id="stair_tolerance" name="stair_tolerance" defaultValue={futureReadiness?.stair_tolerance ?? ""} className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm">
                <option value="">Select one</option>
                <option value="prefer_single_level">Prefer Single-Level</option>
                <option value="moderate_stairs">Moderate Stairs</option>
                <option value="no_preference">No Preference</option>
              </select>
              <WhyWeAsk why="Stair comfort can affect long-term property suitability." how="BuyerIQ uses this for aging-in-place and future readiness scoring." />
            </div>
          </CardContent>
        </Card>

        {priorityGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <WhyWeAsk why={group.why} how={group.how} />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.fields.map(([name, label]) => (
                  <PrioritySelect
                    key={name}
                    name={name}
                    label={label}
                    priorities={userPriorities}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Must-Haves, Nice-To-Haves, and Deal Breakers</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="must_have_features">Must-have features</Label>
              <Textarea id="must_have_features" name="must_have_features" rows={4} defaultValue={buyerProfile?.must_have_features ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nice_to_have_features">Nice-to-have features</Label>
              <Textarea id="nice_to_have_features" name="nice_to_have_features" rows={4} defaultValue={buyerProfile?.nice_to_have_features ?? ""} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="deal_breakers">Deal breakers</Label>
              <Textarea id="deal_breakers" name="deal_breakers" rows={4} defaultValue={buyerProfile?.deal_breakers ?? ""} />
            </div>
          </CardContent>
        </Card>

        <Button type="submit">
          <Save className="size-4" />
          Save priorities
        </Button>
      </form>
    </div>
  );
}
