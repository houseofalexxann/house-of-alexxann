import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";
import { normalizeCode } from "@/lib/promos";

const Create = z
  .object({
    action: z.literal("create"),
    code: z.string().min(2).max(40),
    kind: z.enum(["readings", "membership", "trial"]),
    percentOff: z.number().int().min(1).max(100).optional(),
    amountOffCents: z.number().int().min(1).max(1_000_00).optional(),
    trialDays: z.number().int().min(1).max(365).optional(),
    maxRedemptions: z.number().int().min(1).max(100_000).optional(),
    expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    note: z.string().max(300).optional(),
  })
  .refine(
    (d) =>
      d.kind === "trial"
        ? !!d.trialDays
        : !!d.percentOff || !!d.amountOffCents,
    { message: "Trial codes need days; discount codes need a percent or amount." }
  );

const Toggle = z.object({
  action: z.literal("toggle"),
  id: z.string(),
  active: z.boolean(),
});

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const parsed = z.union([Create, Toggle]).safeParse(
    await request.json().catch(() => null)
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Bad input." },
      { status: 400 }
    );
  }
  const data = parsed.data;

  if (data.action === "toggle") {
    await prisma.promoCode.update({
      where: { id: data.id },
      data: { active: data.active },
    });
    return NextResponse.json({ ok: true });
  }

  const code = normalizeCode(data.code);
  const existing = await prisma.promoCode.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json(
      { error: `${code} already exists — retire it or pick another name.` },
      { status: 409 }
    );
  }
  const promo = await prisma.promoCode.create({
    data: {
      code,
      kind: data.kind,
      percentOff: data.kind === "trial" ? null : data.percentOff ?? null,
      amountOffCents: data.kind === "trial" ? null : data.amountOffCents ?? null,
      trialDays: data.kind === "trial" ? data.trialDays : null,
      maxRedemptions: data.maxRedemptions ?? null,
      expiresAt: data.expiresAt ? new Date(`${data.expiresAt}T23:59:59Z`) : null,
      note: data.note ?? null,
    },
  });
  return NextResponse.json({ ok: true, id: promo.id, code: promo.code });
}
