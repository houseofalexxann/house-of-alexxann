import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sessionUser } from "@/lib/user-auth";
import { localBirthToUtc } from "@/lib/geocode";

const Input = z.object({
  name: z.string().min(1).max(120),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  placeLabel: z.string().max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().max(64),
});

/**
 * The carry-through rule: casting a chart while signed in saves (upserts)
 * your birth details, and every tab — Western, Vedic, Human Design,
 * booking — prefills from them.
 */
export async function POST(request: NextRequest) {
  const user = await sessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const parsed = Input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad profile." }, { status: 400 });
  const p = parsed.data;

  const resolved = localBirthToUtc({
    date: p.birthDate,
    time: p.birthTime ?? "12:00",
    timeKnown: Boolean(p.birthTime),
    timezone: p.timezone,
  });

  const existing = await prisma.birthProfile.findFirst({ where: { userId: user.id } });
  const data = {
    name: p.name,
    birthDate: p.birthDate,
    birthTime: p.birthTime,
    timeKnown: Boolean(p.birthTime),
    placeLabel: p.placeLabel,
    latitude: p.latitude,
    longitude: p.longitude,
    timezone: p.timezone,
    utc: new Date(resolved.utc),
    userId: user.id,
  };
  if (existing) {
    await prisma.birthProfile.update({ where: { id: existing.id }, data });
  } else {
    await prisma.birthProfile.create({ data });
  }
  return NextResponse.json({ ok: true });
}
