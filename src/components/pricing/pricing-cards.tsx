"use client";

import { useState, useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { createCheckoutSession } from "@/lib/actions/checkout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  hasMinPlan,
  PLAN_PRICES,
  PRO_FEATURES,
  STANDARD_FEATURES,
  type Plan,
  type PaidPlan,
} from "@/lib/types/plans";

type PricingCardsProps = {
  currentPlan: Plan;
};

function FeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-sm leading-relaxed">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function CheckoutButton({
  plan,
  label,
  currentPlan,
  highlighted = false,
}: {
  plan: PaidPlan;
  label: string;
  currentPlan: Plan;
  highlighted?: boolean;
}) {
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();
  const owned = hasMinPlan(currentPlan, plan);

  return (
    <div className="w-full space-y-2">
      <Button
        className={cn("h-11 w-full rounded-full text-base", highlighted && "shadow-md")}
        variant={highlighted ? "default" : "outline"}
        disabled={owned || isPending}
        onClick={() =>
          startTransition(async () => {
            setError(undefined);
            const result = await createCheckoutSession(plan);
            if (result?.error) {
              setError(result.error);
            }
          })
        }
      >
        {isPending && <Loader2 className="animate-spin" />}
        {owned ? "Current plan" : label}
      </Button>
      {error && <p className="text-center text-sm text-destructive">{error}</p>}
    </div>
  );
}

export function PricingCards({ currentPlan }: PricingCardsProps) {
  return (
    <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-2">
      <Card className="border-border/70 bg-card/90 shadow-sm">
        <CardHeader className="space-y-4 pb-4">
          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight">
              BuyerIQ Standard
            </CardTitle>
            <CardDescription className="mt-2 text-base leading-relaxed">
              Real estate due diligence for buyers, renters, and relocators.
            </CardDescription>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-5xl font-semibold tracking-tight">
              ${PLAN_PRICES.standard}
            </span>
            <span className="pb-2 text-muted-foreground">own forever</span>
          </div>
        </CardHeader>
        <CardContent>
          <FeatureList items={STANDARD_FEATURES} />
        </CardContent>
        <CardFooter className="pt-2">
          <CheckoutButton
            plan="standard"
            label="Buy BuyerIQ Standard"
            currentPlan={currentPlan}
          />
        </CardFooter>
      </Card>

      <Card className="border-primary/30 bg-card shadow-lg ring-1 ring-primary/10">
        <CardHeader className="space-y-4 pb-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-2xl font-semibold tracking-tight">
                BuyerIQ Pro
              </CardTitle>
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                Most complete
              </span>
            </div>
            <CardDescription className="mt-2 text-base leading-relaxed">
              Advanced reports, regional intelligence, enhanced comparisons, and future updates.
            </CardDescription>
          </div>
          <div className="flex items-end gap-1">
            <span className="text-5xl font-semibold tracking-tight">
              ${PLAN_PRICES.pro}
            </span>
            <span className="pb-2 text-muted-foreground">own forever</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Everything in Standard, plus:
            </p>
            <FeatureList items={PRO_FEATURES} />
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          <CheckoutButton
            plan="pro"
            label="Buy BuyerIQ Pro"
            currentPlan={currentPlan}
            highlighted
          />
        </CardFooter>
      </Card>
    </div>
  );
}
