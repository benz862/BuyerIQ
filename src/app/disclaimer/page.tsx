import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "BuyerIQ disclaimer for informational property analysis, regional intelligence, AI insights, and independent verification.",
};

export default function DisclaimerPage() {
  return (
    <LegalPage
      eyebrow="Disclaimer"
      title="Important BuyerIQ Disclaimer"
      description="BuyerIQ is an informational tool for organizing due diligence and supporting real estate decisions."
      sections={[
        {
          title: "Important Disclaimer",
          body: [
            "BuyerIQ provides organizational assistance, property analysis, risk identification, and decision-support resources.",
            "All recommendations should be independently verified.",
          ],
        },
        {
          title: "BuyerIQ Does Not Guarantee",
          bullets: [
            "Property condition",
            "Property value",
            "Investment performance",
            "Insurance availability",
            "Future expenses",
            "Community suitability",
          ],
        },
        {
          title: "Regional Intelligence Disclaimer",
          body: [
            "Regional information is provided for educational and informational purposes only.",
          ],
          bullets: [
            "Users should independently verify flood zones",
            "Users should independently verify HOA requirements",
            "Users should independently verify insurance requirements",
            "Users should independently verify local regulations",
            "Users should independently verify community services",
          ],
        },
        {
          title: "AI Analysis Disclaimer",
          body: [
            "Any AI-generated insights are informational only.",
            "Users should not rely solely on AI-generated recommendations when making major financial decisions.",
          ],
        },
      ]}
    />
  );
}
