import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "BuyerIQ refund policy for BuyerIQ Standard and BuyerIQ Pro purchases, including the 30-day refund guarantee.",
};

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="Refund Policy"
      title="BuyerIQ Refund Policy"
      description="BuyerIQ Standard and BuyerIQ Pro include a 30-day refund guarantee."
      sections={[
        {
          title: "BuyerIQ Standard",
          body: [
            "BuyerIQ Standard includes a 30-day refund guarantee.",
            "If BuyerIQ does not meet your expectations, contact support within 30 days of purchase.",
          ],
        },
        {
          title: "BuyerIQ Pro",
          body: [
            "BuyerIQ Pro includes a 30-day refund guarantee.",
            "If BuyerIQ does not meet your expectations, contact support within 30 days of purchase.",
          ],
        },
        {
          title: "How To Request Support",
          body: [
            "Email support@buyeriq.app with the email address used for purchase and a brief note about the request.",
            "Our response goal is within 2 business days.",
          ],
        },
        {
          title: "Abuse Prevention",
          body: ["Refund requests may be denied in cases of abuse."],
          bullets: ["Fraud", "Chargeback abuse", "Repeated refund requests"],
        },
      ]}
    />
  );
}
