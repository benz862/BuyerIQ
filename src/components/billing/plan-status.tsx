import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { PLAN_LABELS, type Plan } from "@/lib/types/plans";
import { cn } from "@/lib/utils";

export function PlanBadge({
  plan,
  className,
}: {
  plan: Plan;
  className?: string;
}) {
  return (
    <Badge
      variant={plan === "free" ? "secondary" : "default"}
      className={cn("rounded-full px-3 py-1", className)}
    >
      {PLAN_LABELS[plan]}
    </Badge>
  );
}

export function UpgradeBanner({ plan }: { plan: Plan }) {
  if (plan !== "free") {
    return null;
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 px-5 py-4 sm:flex sm:items-center sm:justify-between sm:gap-4">
      <div>
        <p className="font-medium">Unlock BuyerIQ Standard</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Own BuyerIQ forever with property projects, questions, risk scoring,
          comparisons, and reports.
        </p>
      </div>
      <Link
        href="/pricing"
        className="mt-4 inline-flex h-9 shrink-0 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground sm:mt-0"
      >
        View pricing
      </Link>
    </div>
  );
}
