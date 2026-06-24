import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/branding/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getStripe } from "@/lib/stripe";
import { PLAN_LABELS, type Plan } from "@/lib/types/plans";
import { getUserProfile, planFromStripeMetadata } from "@/lib/data/user-profile";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;
  let activatedPlan: Plan | null = null;

  if (sessionId && process.env.STRIPE_SECRET_KEY) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      activatedPlan = planFromStripeMetadata(session.metadata?.plan);
    } catch {
      activatedPlan = null;
    }
  }

  const profile = await getUserProfile();
  const planLabel = activatedPlan
    ? PLAN_LABELS[activatedPlan]
    : profile?.plan
      ? PLAN_LABELS[profile.plan]
      : "BuyerIQ";

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-muted/20 px-4 py-16">
      <Card className="w-full max-w-lg border-border/70 shadow-lg">
        <CardContent className="flex flex-col items-center gap-6 py-10 text-center">
          <Logo size="md" />
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CheckCircle2 className="size-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">
              Payment successful
            </h1>
            <p className="text-muted-foreground">
              {activatedPlan || (profile && profile.plan !== "free")
                ? `${planLabel} is now active on your account.`
                : "Your payment was received. Your plan will activate shortly."}
            </p>
          </div>
          <Button asChild className="rounded-full px-6">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
