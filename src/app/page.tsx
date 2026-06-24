import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardCheck,
  FileText,
  House,
  Scale,
  ShieldAlert,
} from "lucide-react";
import { Logo } from "@/components/branding/logo";
import { SiteHeader } from "@/components/layout/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: BarChart3,
    title: "Due diligence scores",
    description: "Every property project tracks fit, risk, lifestyle, cost, confidence, and future expense signals.",
  },
  {
    icon: ShieldAlert,
    title: "Regional risk awareness",
    description: "Load region-specific concerns like flood risk, foundation movement, wildfire zones, moisture intrusion, and insurance availability.",
  },
  {
    icon: Scale,
    title: "Property Comparison",
    description: "Compare alternatives by price, taxes, risk scores, monthly cost, future expenses, lifestyle fit, and regional concerns.",
  },
  {
    icon: FileText,
    title: "Professional reports",
    description: "Generate reports with strengths, concerns, open questions, future expenses, regional risks, and recommendations.",
  },
  {
    icon: House,
    title: "Project workspace",
    description: "Each property holds notes, questions, communications, documents, scores, reports, comparisons, and timeline events.",
  },
  {
    icon: ClipboardCheck,
    title: "Question tracking",
    description: "Create, group, send, and track questions for realtors, landlords, builders, and property managers.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border/60">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_360px] lg:items-center lg:py-20">
            <div className="space-y-7">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
                Real estate due diligence platform
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                  BuyerIQ
                </h1>
                <p className="max-w-2xl text-xl font-medium">
                  What am I missing before I make this decision?
                </p>
                <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  BuyerIQ helps buyers, renters, and relocators organize property due diligence, identify risks, send questions, compare alternatives, and make smarter real estate decisions.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild>
                  <Link href="/pricing">
                    View plans
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <Logo size="lg" showTagline />
            </div>
          </div>
        </section>

        <section id="features" className="bg-muted/30 py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold tracking-tight">
                Built for buying decisions
              </h2>
              <p className="mt-3 text-muted-foreground">
                BuyerIQ is not a CRM, MLS system, Zillow competitor, or lead-generation tool. It is a central command center for real estate decisions.
              </p>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="border-border/60 bg-card/90 shadow-sm">
                  <CardHeader>
                    <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="size-5" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-3">
            {[
              ["buyer-mode", "Buyer Mode"],
              ["rental-mode", "Rental Mode"],
              ["relocation-mode", "Relocation Mode"],
            ].map(([id, title], index) => (
              <Card key={title}>
                <CardContent id={id} className="space-y-3 pt-6">
                  <span className="text-sm font-semibold text-primary">Step {index + 1}</span>
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {index === 0 && "Evaluate purchase price, ownership costs, property condition, location quality, and long-term fit before making an offer."}
                    {index === 1 && "Compare lease terms, monthly costs, landlord questions, amenities, commute needs, and move-in risks before signing."}
                    {index === 2 && "Organize neighborhood research, household priorities, future flexibility, and relocation questions in one decision workspace."}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
