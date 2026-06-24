import Stripe from "stripe";

let stripeClient: Stripe | null = null;

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not configured.");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

export function getStripePriceId(plan: "standard" | "pro"): string {
  const priceId =
    plan === "standard"
      ? process.env.STRIPE_STANDARD_PRICE_ID ?? process.env.STRIPE_PRICE_STANDARD
      : process.env.STRIPE_PRO_PRICE_ID ?? process.env.STRIPE_PRICE_PRO;

  if (!priceId) {
    throw new Error(`Stripe price ID for ${plan} is not configured.`);
  }

  return priceId;
}

export function isStripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
      (process.env.STRIPE_STANDARD_PRICE_ID ?? process.env.STRIPE_PRICE_STANDARD) &&
      (process.env.STRIPE_PRO_PRICE_ID ?? process.env.STRIPE_PRICE_PRO)
  );
}
