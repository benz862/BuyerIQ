import { createClient } from "@/lib/supabase/server";
import type { Plan, UserProfile } from "@/lib/types/plans";

export async function getUserProfile(): Promise<UserProfile | null> {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return null;
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (data as UserProfile | null) ?? null;
}

export async function requireUserProfile(): Promise<UserProfile> {
  const profile = await getUserProfile();
  if (!profile) {
    throw new Error("User profile not found.");
  }
  return profile;
}

export async function syncUserEmail(userId: string, email: string | undefined) {
  if (!email) return;

  const supabase = await createClient();
  await supabase
    .from("profiles")
    .update({ email })
    .eq("id", userId);
}

export function planFromStripeMetadata(
  value: string | null | undefined
): Plan | null {
  if (value === "standard" || value === "pro") {
    return value;
  }
  return null;
}
