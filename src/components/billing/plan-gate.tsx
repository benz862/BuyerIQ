import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { hasMinPlan, PLAN_LABELS, type Plan } from "@/lib/types/plans";

export function PlanGate({
  currentPlan,
  requiredPlan,
  title,
  description,
  children,
}: {
  currentPlan: Plan;
  requiredPlan: Plan;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  if (hasMinPlan(currentPlan, requiredPlan)) {
    return <>{children}</>;
  }

  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
          <Lock className="size-5 text-muted-foreground" />
        </div>
        <div className="max-w-md space-y-2">
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
          <p className="text-sm text-muted-foreground">
            Requires {PLAN_LABELS[requiredPlan]} or higher.
          </p>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/pricing">Upgrade at buyeriq.app/pricing</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
