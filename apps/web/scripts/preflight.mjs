/**
 * Deploy preflight: verify required env vars BEFORE prisma/next run, and
 * explain any problem in plain language in the build log.
 */
// Local runs read .env; on Vercel the variables come from project settings.
import { fileURLToPath } from "node:url";
import { normalizeDbUrl } from "../src/lib/db-url.mjs";
try {
  process.loadEnvFile(fileURLToPath(new URL("../.env", import.meta.url)));
} catch {}

const required = [
  ["DATABASE_URL", "your Neon connection string (postgresql://…)"],
  ["ADMIN_EMAIL", "the admin sign-in email"],
  ["ADMIN_PASSWORD", "a strong admin password"],
  ["SESSION_SECRET", "30+ random characters"],
  ["NEXT_PUBLIC_BASE_URL", "https://houseofalexxann.com"],
];

let ok = true;
for (const [name, hint] of required) {
  const v = process.env[name];
  if (!v || v.trim() === "") {
    console.error(`\n✗ Missing environment variable: ${name}`);
    console.error(`  → Add it in Vercel → Project → Settings → Environment Variables (${hint}), then Redeploy.`);
    ok = false;
  }
}

const db = normalizeDbUrl(process.env.DATABASE_URL);
if (db && !db.startsWith("postgres")) {
  console.error(`\n✗ DATABASE_URL doesn't look like a Postgres connection string (should start with postgresql://).`);
  console.error(`  → In Vercel, open DATABASE_URL and make sure the value begins with postgresql:// — no quotes, no "psql", no leading spaces. Copy Neon's plain connection string.`);
  ok = false;
}
if (db.includes("-pooler")) {
  console.log(
    "ℹ DATABASE_URL is Neon's pooled string — fine for the app; migrations will automatically use the direct (unpooled) host."
  );
}
if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 16) {
  console.error("\n✗ SESSION_SECRET is too short — make it at least 16 (ideally 30+) characters.");
  ok = false;
}

if (!ok) {
  console.error("\nPreflight failed — fix the variables above and redeploy. Nothing was built.\n");
  process.exit(1);
}
console.log("✓ Preflight passed — all required environment variables present.");
