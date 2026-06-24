/* global console, process, URL */
import { existsSync, readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnvFile(path) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) continue;
    const index = line.indexOf("=");
    if (index === -1) continue;
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadEnvFile(".env.local");

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!rawUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

const supabase = createClient(new URL(rawUrl).origin, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const accounts = [
  {
    email: "info@skillbinder.com",
    password: "Standard123!",
    fullName: "Glenn Donnelly",
    plan: "standard",
  },
  {
    email: "info@epoxydogs.com",
    password: "Pro123!",
    fullName: "Glenn Donnelly",
    plan: "pro",
  },
];

async function findUserByEmail(email) {
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const user = data.users.find(
      (item) => item.email?.toLowerCase() === email.toLowerCase()
    );
    if (user) return user;
    if (data.users.length < perPage) return null;
    page += 1;
  }
}

for (const account of accounts) {
  let user = await findUserByEmail(account.email);
  let action = "updated";

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: { full_name: account.fullName },
      app_metadata: { buyer_iq_plan: account.plan },
    });
    if (error) throw error;
    user = data.user;
    action = "created";
  } else {
    const { data, error } = await supabase.auth.admin.updateUserById(user.id, {
      password: account.password,
      email_confirm: true,
      user_metadata: { ...(user.user_metadata ?? {}), full_name: account.fullName },
      app_metadata: { ...(user.app_metadata ?? {}), buyer_iq_plan: account.plan },
    });
    if (error) throw error;
    user = data.user;
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: account.email,
      full_name: account.fullName,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      plan: account.plan,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (profileError) throw profileError;

  console.log(`${action}: ${account.email} -> ${account.plan}`);
}
