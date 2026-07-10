import Link from "next/link";
import { ArrowRight, BedDouble, Gauge, Ruler, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScoreBar } from "@/components/ui/score-bar";
import {
  formatCurrency,
  propertyScoreBreakdown,
  recommendationForScore,
  type BuyerProfile,
  type FutureReadinessProfile,
  type Property,
  type UserPriorities,
} from "@/lib/types/database";

export function PropertyCard({
  property,
  buyerProfile,
  userPriorities,
  futureReadiness,
}: {
  property: Property;
  buyerProfile?: BuyerProfile | null;
  userPriorities?: UserPriorities | null;
  futureReadiness?: FutureReadinessProfile | null;
}) {
  const scores = propertyScoreBreakdown(property, buyerProfile, userPriorities, futureReadiness);

  return (
    <Link href={`/dashboard/properties/${property.id}`}>
      <Card className="group transition-all hover:border-primary/30 hover:shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-lg leading-snug">{property.property_name}</CardTitle>
            <Badge variant="secondary" className="shrink-0">
              {scores.overall}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {formatCurrency(property.purchase_price)} · {property.address}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            {property.bedrooms !== null && (
              <span className="inline-flex items-center gap-1.5">
                <BedDouble className="size-4" />
                {property.bedrooms} bed
              </span>
            )}
            {property.bathrooms !== null && (
              <span>{property.bathrooms} bath</span>
            )}
            {property.square_footage !== null && (
              <span className="inline-flex items-center gap-1.5">
                <Ruler className="size-4" />
                {property.square_footage.toLocaleString()} sqft
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Gauge className="size-4 text-primary" />
              Fit {scores.fitScore}
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <ShieldAlert className="size-4 text-primary" />
              Risk {scores.riskScore}
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{recommendationForScore(scores.overall)}</span>
              <span>{scores.overall}/100</span>
            </div>
            <ScoreBar value={scores.overall} label={`${property.property_name} BuyerIQ score`} />
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
            View report
            <ArrowRight className="size-4" />
          </span>
        </CardContent>
      </Card>
    </Link>
  );
}
