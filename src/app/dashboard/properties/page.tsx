import Link from "next/link";
import { Plus } from "lucide-react";
import { PropertyCard } from "@/components/properties/property-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getUserProfile } from "@/lib/data/user-profile";
import type { BuyerProfile, FutureReadinessProfile, Property, UserPriorities } from "@/lib/types/database";

export default async function PropertiesPage() {
  const supabase = await createClient();
  const profile = await getUserProfile();
  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .order("updated_at", { ascending: false });
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

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Properties</h1>
          <p className="mt-1 text-muted-foreground">
            Track and evaluate every home you&apos;re considering.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/properties/new">
            <Plus className="size-4" />
            Add property
          </Link>
        </Button>
      </div>

      {typedProperties.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-muted-foreground">
            No properties yet. Add one to get started.
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
    </div>
  );
}
