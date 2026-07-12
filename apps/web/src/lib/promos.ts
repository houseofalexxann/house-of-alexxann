/**
 * Promo codes: percent/amount off readings or membership, or a free-trial
 * grant. Validation and redemption live here; the admin manages codes at
 * /admin/promos.
 */
import type { PromoCode } from "@prisma/client";
import { prisma } from "./db";

export type PromoKind = "readings" | "membership" | "trial";

export const KIND_LABELS: Record<PromoKind, string> = {
  readings: "Readings",
  membership: "Membership",
  trial: "Free trial",
};

export function normalizeCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

/** Human description of what a code grants, for admin lists and receipts. */
export function promoSummary(p: PromoCode): string {
  if (p.kind === "trial") return `${p.trialDays ?? 0} days free`;
  const parts: string[] = [];
  if (p.percentOff) parts.push(`${p.percentOff}% off`);
  if (p.amountOffCents) parts.push(`$${(p.amountOffCents / 100).toFixed(2)} off`);
  return parts.join(" + ") || "—";
}

export async function findValidPromo(
  rawCode: string,
  kind: PromoKind
): Promise<{ promo: PromoCode } | { error: string }> {
  const code = normalizeCode(rawCode);
  if (!code) return { error: "Enter a code first." };
  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo || !promo.active) {
    return { error: "That code isn't one of ours — check the spelling?" };
  }
  if (promo.kind !== kind) {
    return {
      error:
        kind === "readings"
          ? "That code is for membership, not readings."
          : "That code is for readings, not membership.",
    };
  }
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return { error: "That code has expired." };
  }
  if (promo.maxRedemptions != null && promo.redemptions >= promo.maxRedemptions) {
    return { error: "That code has been fully redeemed." };
  }
  return { promo };
}

export function discountedCents(base: number, promo: PromoCode): number {
  let out = base;
  if (promo.percentOff) out = Math.round(out * (1 - promo.percentOff / 100));
  if (promo.amountOffCents) out -= promo.amountOffCents;
  return Math.max(0, out);
}

/**
 * Count one use. Conditional update so a limited code can't overshoot its
 * cap under concurrency; returns false when the cap was hit meanwhile.
 */
export async function redeemPromo(promo: PromoCode): Promise<boolean> {
  const res = await prisma.promoCode.updateMany({
    where: {
      id: promo.id,
      active: true,
      ...(promo.maxRedemptions != null
        ? { redemptions: { lt: promo.maxRedemptions } }
        : {}),
    },
    data: { redemptions: { increment: 1 } },
  });
  return res.count === 1;
}
