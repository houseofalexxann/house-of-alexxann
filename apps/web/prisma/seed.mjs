/**
 * Seed: the three Phase 1 services, default availability (Tue–Sat, 10:00–17:00
 * practitioner time), and scheduler settings. Idempotent.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { fileURLToPath } from "node:url";

try {
  process.loadEnvFile(fileURLToPath(new URL("../.env", import.meta.url)));
} catch {}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const SERVICES = [
  { slug: "natal-reading", type: "natal", title: "Natal Chart Reading", durationMinutes: 90, priceCents: 17500 },
  { slug: "transit-forecast-reading", type: "transit", title: "Transit & Forecast Reading", durationMinutes: 60, priceCents: 12500 },
  { slug: "vedic-reading", type: "vedic", title: "Vedic (Jyotish) Reading", durationMinutes: 90, priceCents: 17500 },
];

for (const s of SERVICES) {
  await prisma.service.upsert({ where: { slug: s.slug }, create: s, update: s });
}

// Default weekly windows: Tuesday(2)–Saturday(6), 10:00–17:00.
const ruleCount = await prisma.availabilityRule.count();
if (ruleCount === 0) {
  await prisma.availabilityRule.createMany({
    data: [2, 3, 4, 5, 6].map((weekday) => ({
      weekday,
      startMinute: 10 * 60,
      endMinute: 17 * 60,
    })),
  });
}

// Practitioner timezone defaults to this machine's zone (Alexandria's).
const tz = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "America/New_York";
const defaults = {
  practitionerTz: tz,
  bufferMinutes: "15",
  leadTimeHours: "12",
  horizonDays: "30",
  slotStepMinutes: "30",
  // Direct-pay handles — PLACEHOLDERS: Alexandria edits these in the admin.
  venmoHandle: "@HouseOfAlexxann",
  cashAppTag: "$HouseOfAlexxann",
  zelleContact: "aramirez946@gmail.com",
  paypalMeLink: "paypal.me/houseofalexxann",
};
for (const [key, value] of Object.entries(defaults)) {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value: String(value) },
    update: {},
  });
}

// Admin user record (auth is env-based in Phase 1; the row anchors Phase 2).
if (process.env.ADMIN_EMAIL) {
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL },
    create: { email: process.env.ADMIN_EMAIL, name: "Alexandria Ramirez", role: "admin" },
    update: { role: "admin" },
  });
}

console.log("Seeded: services, availability (Tue–Sat 10–17), settings, admin user.");
console.log("Practitioner timezone:", tz);
await prisma.$disconnect();
