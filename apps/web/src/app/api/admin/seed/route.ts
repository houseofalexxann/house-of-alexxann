import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";
import { SERVICES } from "@/lib/services";

/**
 * One-shot production seeding (admin-only, idempotent): the offerings,
 * default weekly availability (Tue–Sat 10:00–17:00 practitioner time),
 * scheduler settings, and the admin user row.
 */
export async function POST() {
  const denied = await requireAdminApi();
  if (denied) return denied;

  for (const s of SERVICES) {
    const row = {
      slug: s.slug,
      type: s.type,
      title: s.title,
      durationMinutes: s.durationMinutes,
      priceCents: s.priceCents,
    };
    await prisma.service.upsert({ where: { slug: s.slug }, create: row, update: row });
  }

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

  const defaults: Record<string, string> = {
    practitionerTz: "America/Chicago",
    bufferMinutes: "15",
    leadTimeHours: "12",
    horizonDays: "30",
    slotStepMinutes: "30",
    venmoHandle: "@HouseOfAlexxann",
    cashAppTag: "$HouseOfAlexxann",
    zelleContact: process.env.ADMIN_EMAIL ?? "",
    paypalMeLink: "paypal.me/houseofalexxann",
  };
  for (const [key, value] of Object.entries(defaults)) {
    await prisma.setting.upsert({ where: { key }, create: { key, value }, update: {} });
  }

  if (process.env.ADMIN_EMAIL) {
    await prisma.user.upsert({
      where: { email: process.env.ADMIN_EMAIL },
      create: { email: process.env.ADMIN_EMAIL, name: "Alexandria Ramirez", role: "admin" },
      update: { role: "admin" },
    });
  }

  const [services, rules] = await Promise.all([
    prisma.service.count(),
    prisma.availabilityRule.count(),
  ]);
  return NextResponse.json({ ok: true, services, availabilityRules: rules });
}
