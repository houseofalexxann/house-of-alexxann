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

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
});
