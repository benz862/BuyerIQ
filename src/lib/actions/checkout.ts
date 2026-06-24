"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe, getStripePriceId, isStripeConfigured } from "@/lib/stripe";
import { hasMinPlan, type PaidPlan } from "@/lib/types/plans";
import { getUserProfile } from "@/lib/data/user-profile";

export type CheckoutState = {
  error?: string;
};

export async function createCheckoutSession(
  plan: PaidPlan
): Promise<CheckoutState> {
  if (!isStripeConfigured()) {
    return { error: "Payments are not configured yet. Please try again later." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent("/pricing")}`);
  }

  const profile = await getUserProfile();
  if (profile && hasMinPlan(profile.plan, plan)) {
    return { error: `You already own ${plan === "standard" ? "BuyerIQ Standard" : "BuyerIQ Pro"}.` };
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price: getStripePriceId(plan),
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancel`,
    client_reference_id: user.id,
    customer_email: user.email ?? profile?.email ?? undefined,
    metadata: {
      userId: user.id,
      plan,
    },
  });

  if (!session.url) {
    return { error: "Unable to start checkout. Please try again." };
  }

  redirect(session.url);
}
