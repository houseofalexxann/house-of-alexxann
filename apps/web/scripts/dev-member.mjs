/**
 * Dev-only: make sure the local database has a member account with a saved
 * birth chart, so member rooms (calendar, weather, deeper studio) can be
 * exercised in the browser without touching production.
 *
 * Usage, from apps/web with the dev database running (scripts/dev-db.mjs):
 *   set -a; source .env; set +a; node scripts/dev-member.mjs
 *
 * Refuses to run against anything that is not localhost. The password below
 * is a throwaway for the local database only; it is not a secret.
 */
import { randomBytes, scryptSync } from "node:crypto";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const EMAIL = "venus-test@house.local";
const PASSWORD = "venus-in-libra-dev";

const url = process.env.DATABASE_URL ?? "";
if (!/localhost|127\.0\.0\.1/.test(url)) {
  console.error("dev-member: DATABASE_URL is not local; refusing.");
  process.exit(1);
}

// Same scheme as src/lib/user-auth.ts hashPassword: scrypt, "salt:hash".
const salt = randomBytes(16).toString("hex");
const passwordHash = `${salt}:${scryptSync(PASSWORD, salt, 64).toString("hex")}`;

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
try {
  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: { passwordHash, isMember: true },
    create: { email: EMAIL, name: "Venus Test", passwordHash, isMember: true },
    select: { id: true },
  });

  // The suite's reference chart: Dallas, 1992-09-30 17:59 local.
  const existing = await prisma.birthProfile.findFirst({ where: { userId: user.id } });
  if (!existing) {
    await prisma.birthProfile.create({
      data: {
        name: "Venus Test",
        birthDate: "1992-09-30",
        birthTime: "17:59",
        timeKnown: true,
        placeLabel: "Dallas, Texas",
        latitude: 32.7767,
        longitude: -96.797,
        timezone: "America/Chicago",
        utc: new Date("1992-09-30T22:59:00Z"),
        userId: user.id,
      },
    });
  }
  console.log(`dev-member: ${EMAIL} is a member with a saved chart.`);
} finally {
  await prisma.$disconnect();
}
