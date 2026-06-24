import { createClient } from "@supabase/supabase-js";
import type { Plan } from "@/lib/types/plans";

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Supabase admin credentials are not configured.");
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function activateUserPlan({
  userId,
  plan,
  stripeCustomerId,
  stripePaymentId,
  stripeCheckoutSessionId,
  purchasedAt,
}: {
  userId: string;
  plan: Exclude<Plan, "free">;
  stripeCustomerId: string | null;
  stripePaymentId: string | null;
  stripeCheckoutSessionId: string | null;
  purchasedAt: string;
}) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("profiles")
    .update({
      plan,
      stripe_customer_id: stripeCustomerId,
      stripe_payment_id: stripePaymentId,
      purchased_at: purchasedAt,
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }

  const { error: purchaseError } = await supabase
    .from("purchases")
    .upsert({
      user_id: userId,
      product_type: plan,
      stripe_customer_id: stripeCustomerId,
      stripe_payment_id: stripePaymentId,
      stripe_checkout_session_id: stripeCheckoutSessionId,
      purchased_at: purchasedAt,
    }, { onConflict: "stripe_checkout_session_id" });

  if (purchaseError) {
    throw purchaseError;
  }
}

export async function getUserPlanRank(userId: string): Promise<number> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", userId)
    .single();

  const ranks = { free: 0, standard: 1, pro: 2 } as const;
  const plan = (data?.plan ?? "free") as keyof typeof ranks;
  return ranks[plan] ?? 0;
}
