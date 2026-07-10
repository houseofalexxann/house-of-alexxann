#!/usr/bin/env node
/**
 * Dev database: real PostgreSQL via embedded-postgres (no Docker/sudo).
 * Data persists in .pgdata/. Safe to run repeatedly — reuses the cluster
 * and keeps running until killed.
 */
import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(root, ".pgdata");
const port = Number(process.env.PGPORT ?? 5502);

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: "postgres",
  password: "postgres",
  port,
  persistent: true,
});

const fresh = !existsSync(path.join(dataDir, "PG_VERSION"));
if (fresh) {
  console.log("[dev-db] initializing new cluster in .pgdata …");
  await pg.initialise();
}
await pg.start();
console.log(`[dev-db] PostgreSQL ready on port ${port} (data: .pgdata/)`);
console.log(`[dev-db] DATABASE_URL=postgresql://postgres:postgres@localhost:${port}/postgres`);

const stop = async () => {
  console.log("\n[dev-db] stopping …");
  await pg.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
