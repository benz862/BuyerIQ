export type Plan = "free" | "standard" | "pro";

export type UserProfile = {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  plan: Plan;
  stripe_customer_id: string | null;
  stripe_payment_id: string | null;
  purchased_at: string | null;
  created_at: string;
  updated_at: string;
};

export const PLAN_RANK: Record<Plan, number> = {
  free: 0,
  standard: 1,
  pro: 2,
};

export const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  standard: "BuyerIQ Standard",
  pro: "BuyerIQ Pro",
};

export const PLAN_PRICES: Record<Exclude<Plan, "free">, number> = {
  standard: 99,
  pro: 149,
};

export const PLAN_PROPERTY_LIMITS: Record<Plan, number | null> = {
  free: 1,
  standard: null,
  pro: null,
};

export function hasMinPlan(current: Plan, required: Plan): boolean {
  return PLAN_RANK[current] >= PLAN_RANK[required];
}

export type PaidPlan = Exclude<Plan, "free">;

export const STANDARD_FEATURES = [
  "Own forever",
  "Buying, renting, and relocating modes",
  "Property profiles and due diligence notes",
  "Question tracking and communication log",
  "Risk scoring and completeness score",
  "PDF reports and data export",
] as const;

export const PRO_FEATURES = [
  "Advanced reports",
  "Regional Intelligence Packs",
  "Enhanced comparisons",
  "Future feature updates",
  "Priority support",
] as const;

export const PRO_ONLY_ROUTES = ["/dashboard/admin"] as const;

export function isProFeatureRoute(pathname: string): boolean {
  return PRO_ONLY_ROUTES.some((route) => pathname.startsWith(route));
}
