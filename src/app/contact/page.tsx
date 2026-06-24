import type { Metadata } from "next";
import { Mail, MessageSquareWarning, CircleHelp, LifeBuoy } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact Support",
  description:
    "Contact BuyerIQ support, report a problem, review help center topics, and find administrative contact information.",
};

const supportCards = [
  {
    id: "support",
    icon: LifeBuoy,
    title: "Contact Support",
    body: "Need assistance with your account, checkout, property projects, reports, or data export?",
    contact: "support@buyeriq.app",
  },
  {
    id: "help-center",
    icon: CircleHelp,
    title: "Help Center",
    body: "For help using BuyerIQ, email support with your question and the page or workflow you are using.",
    contact: "support@buyeriq.app",
  },
  {
    id: "faq",
    icon: Mail,
    title: "Frequently Asked Questions",
    body: "Common questions about purchases, refunds, property scoring, privacy, and account access are handled by support.",
    contact: "support@buyeriq.app",
  },
  {
    id: "report-problem",
    icon: MessageSquareWarning,
    title: "Report a Problem",
    body: "Send a short description of the issue, the browser or device you used, and any relevant screenshots.",
    contact: "support@buyeriq.app",
  },
] as const;

export default function ContactPage() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60">
          <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-16">
            <p className="text-sm font-medium tracking-wide text-primary uppercase">Support</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight">Contact BuyerIQ</h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Need assistance? BuyerIQ support responds to support requests with a goal of
              within 2 business days.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2">
          {supportCards.map((item) => (
            <Card key={item.id} id={item.id} className="scroll-mt-24">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </div>
                <CardTitle className="text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>{item.body}</p>
                <p>
                  Email:{" "}
                  <a href={`mailto:${item.contact}`} className="font-medium text-primary hover:underline">
                    {item.contact}
                  </a>
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              <p>
                Owner: <span className="font-medium text-foreground">Epoxy Dogs LLC, DBA SkillBinder</span>
              </p>
              <p>BuyerIQ is a SkillBinder product.</p>
              <p>
                General business inquiries:{" "}
                <a href="mailto:info@skillbinder.com" className="font-medium text-primary hover:underline">
                  info@skillbinder.com
                </a>
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
