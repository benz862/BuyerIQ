import Link from "next/link";
import { Logo } from "@/components/branding/logo";
import { PricingCards } from "@/components/pricing/pricing-cards";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import { getUserProfile } from "@/lib/data/user-profile";
import type { Plan } from "@/lib/types/plans";

export default async function PricingPage() {
  const profile = await getUserProfile();
  const currentPlan: Plan = profile?.plan ?? "free";

  return (
    <div className="flex min-h-full flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <p className="text-sm font-medium tracking-wide text-primary uppercase">
              Buy once. Own forever.
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              No subscriptions. No recurring fees.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
              BuyerIQ Standard gives buyers, renters, and relocators a permanent
              due diligence command center. BuyerIQ Pro adds advanced reports,
              regional intelligence packs, enhanced comparisons, and future updates.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <PricingCards currentPlan={currentPlan} />

          <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-border/70 bg-muted/30 px-6 py-5 text-center text-sm leading-relaxed text-muted-foreground">
            {currentPlan === "free" ? (
              <>
                New accounts start on the free plan. Sign in before checkout so your
                purchase is linked to your BuyerIQ account.
              </>
            ) : (
              <>
                Your current plan is{" "}
                <span className="font-medium text-foreground">{currentPlan}</span>.
                Upgrades apply instantly after payment.
              </>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Home</Link>
            </Button>
            <p>© {new Date().getFullYear()} BuyerIQ</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
