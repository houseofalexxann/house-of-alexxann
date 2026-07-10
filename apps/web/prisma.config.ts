import { fileURLToPath } from "node:url";
import { defineConfig, env } from "prisma/config";

// Prisma 7: connection URLs live here (CLI/migrations), not in the schema.
// Node 22 loads .env natively; Prisma CLI no longer does it implicitly.
// (fileURLToPath, not URL.pathname — the repo path contains a space.)
try {
  process.loadEnvFile(fileURLToPath(new URL("./.env", import.meta.url)));
} catch {
  // .env is optional — production supplies real env vars.
}

// Migrations must use Neon's DIRECT host — the pooled ("-pooler") string
// breaks `migrate deploy`. Runtime keeps the pooled URL (good for
// serverless); here we derive the direct URL automatically.
const migrateUrl = (process.env.DATABASE_URL ?? "").replace("-pooler", "");

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: migrateUrl || env("DATABASE_URL"),
  },
});
