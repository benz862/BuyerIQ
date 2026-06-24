import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/data/user-profile";
import { getStripe, getStripePriceId, isStripeConfigured } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { hasMinPlan, type PaidPlan } from "@/lib/types/plans";

function isPaidPlan(value: unknown): value is PaidPlan {
  return value === "standard" || value === "pro";
}

export async function POST(request: Request) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Payments are not configured." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const plan = body?.plan;

  if (!isPaidPlan(plan)) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const profile = await getUserProfile();
  if (profile && hasMinPlan(profile.plan, plan)) {
    return NextResponse.json({ error: "You already own this access level." }, { status: 409 });
  }

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: getStripePriceId(plan), quantity: 1 }],
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/checkout/cancel`,
    client_reference_id: user.id,
    customer_email: user.email ?? profile?.email ?? undefined,
    metadata: {
      userId: user.id,
      plan,
    },
  });

  return NextResponse.json({ url: session.url });
}
