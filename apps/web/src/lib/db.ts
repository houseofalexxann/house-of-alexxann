import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { normalizeDbUrl } from "./db-url.mjs";

// Prisma 7 uses a driver adapter; one client per process (dev hot-reload safe).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * The runtime connection string for the pg driver. pg already treats
 * sslmode=require as verify-full, and warns on every connection that the
 * alias will change meaning in its next major version. Saying verify-full
 * outright keeps today's behaviour and keeps the warning out of the error
 * logs. Migrations use their own path (prisma.config.ts) and are untouched.
 */
function runtimeConnectionString(): string {
  const url = normalizeDbUrl(process.env.DATABASE_URL);
  return url.replace(/([?&])sslmode=(?:require|prefer|verify-ca)(?=&|$)/i, "$1sslmode=verify-full");
}

function makeClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: runtimeConnectionString(),
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
