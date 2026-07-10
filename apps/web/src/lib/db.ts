import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { normalizeDbUrl } from "./db-url.mjs";

// Prisma 7 uses a driver adapter; one client per process (dev hot-reload safe).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function makeClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: normalizeDbUrl(process.env.DATABASE_URL),
  });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
