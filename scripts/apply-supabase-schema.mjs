/* global console, process, URL */
import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

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

function projectRefFromUrl() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!rawUrl) return null;
  return new URL(rawUrl).hostname.split(".")[0];
}

function connectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const poolerPath = "supabase/.temp/pooler-url";
  if (existsSync(poolerPath) && process.env.SUPABASE_DB_PASSWORD) {
    const pooler = readFileSync(poolerPath, "utf8").trim();
    const url = new URL(pooler);
    url.password = process.env.SUPABASE_DB_PASSWORD;
    return url.toString();
  }

  const ref = process.env.SUPABASE_PROJECT_REF ?? projectRefFromUrl();
  if (ref && process.env.SUPABASE_DB_PASSWORD) {
    const url = new URL(`postgresql://postgres.${ref}@aws-1-us-west-2.pooler.supabase.com:5432/postgres`);
    url.password = process.env.SUPABASE_DB_PASSWORD;
    return url.toString();
  }

  return null;
}

loadEnvFile(".env.local");

const dbUrl = connectionString();
if (!dbUrl) {
  console.error("Missing DATABASE_URL or SUPABASE_DB_PASSWORD in .env.local.");
  process.exit(1);
}

const migrations = [
  "supabase/migrations/20260624000000_buyeriq_v2_schema.sql",
  "supabase/migrations/20260624010000_complete_existing_schema.sql",
];

let result;
for (const migration of migrations) {
  console.log(`Applying ${migration}`);
  result = spawnSync("psql", [dbUrl, "-v", "ON_ERROR_STOP=1", "-f", migration], {
    stdio: "inherit",
  });

  if (result.status === 0) continue;

  if (migration.endsWith("20260624000000_buyeriq_v2_schema.sql")) {
    console.log("Base migration did not complete; applying compatibility migration.");
    continue;
  }

  break;
}

process.exit(result.status ?? 1);
