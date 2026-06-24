import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "BuyerIQ terms of use covering accepted use, informational purpose, user responsibility, and liability limitations.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms of Use"
      title="BuyerIQ Terms of Use"
      description="By using BuyerIQ, users agree to these terms."
      sections={[
        {
          title: "Acceptance",
          body: ["By accessing or using BuyerIQ, you agree to these Terms of Use."],
        },
        {
          title: "Intended Purpose",
          body: ["BuyerIQ is an informational decision-support platform."],
          bullets: [
            "BuyerIQ is not legal advice",
            "BuyerIQ is not financial advice",
            "BuyerIQ is not insurance advice",
            "BuyerIQ is not tax advice",
            "BuyerIQ is not engineering advice",
            "BuyerIQ is not inspection services",
            "BuyerIQ is not appraisal services",
          ],
        },
        {
          title: "User Responsibility",
          body: ["Users remain responsible for their own real estate due diligence."],
          bullets: [
            "Due diligence",
            "Property inspections",
            "Professional consultations",
            "Verification of information",
          ],
        },
        {
          title: "Limitation of Liability",
          body: [
            "BuyerIQ shall not be liable for real estate decisions, property purchases, rental decisions, relocation decisions, financial losses, or missed opportunities.",
            "Use of BuyerIQ is at the user's own discretion.",
          ],
        },
        {
          title: "Ownership",
          body: [
            "BuyerIQ is owned and operated by Epoxy Dogs LLC, DBA SkillBinder. BuyerIQ is a SkillBinder product.",
          ],
        },
      ]}
    />
  );
}
