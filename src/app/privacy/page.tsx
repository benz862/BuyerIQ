import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "BuyerIQ privacy policy covering personal information, property information, data storage, sharing, and user rights.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy Policy"
      title="BuyerIQ Privacy Policy"
      description="BuyerIQ respects your privacy and is designed to help users make informed real estate decisions."
      sections={[
        {
          title: "Privacy Commitment",
          body: [
            "We collect only the information necessary to provide personalized recommendations, reports, communications, and property analysis.",
            "BuyerIQ is owned and operated by Epoxy Dogs LLC, DBA SkillBinder. BuyerIQ is a SkillBinder product.",
          ],
        },
        {
          title: "Information We Collect",
          bullets: [
            "Name",
            "Email address",
            "Property information",
            "Questions submitted",
            "Uploaded documents",
            "Lifestyle preferences",
            "Relocation preferences",
            "Account activity",
          ],
        },
        {
          title: "How We Use Information",
          body: ["BuyerIQ uses information solely to support the BuyerIQ product experience."],
          bullets: [
            "Personalize recommendations",
            "Generate reports",
            "Improve platform functionality",
            "Provide support",
          ],
        },
        {
          title: "Information Sharing",
          body: [
            "BuyerIQ does not sell personal information to advertisers, realtors, brokers, property managers, landlords, or third parties.",
            "Information may only be shared when legally required.",
          ],
        },
        {
          title: "Data Storage",
          body: ["BuyerIQ uses secure third-party providers to operate the platform."],
          bullets: ["Supabase", "Stripe", "Resend", "Vercel"],
        },
        {
          title: "User Rights",
          bullets: [
            "Request data export",
            "Delete their account",
            "Remove uploaded content",
          ],
        },
      ]}
    />
  );
}
