/**
 * Membership (premium) gating — Phase: pre-accounts.
 *
 * Model decided 2026-07-10: FREE = chart + minimal reading. PREMIUM (paid
 * membership, arrives with accounts) = the deeper chart (essential
 * dignities, lots, zodiacal releasing), transits, Human Design, tarot,
 * solar returns, fixed stars & asteroids, remedies.
 *
 * Until public accounts ship, isMember() is false for everyone and gated
 * surfaces render as previews with an invitation. The gate component is the
 * single seam where real session-based membership will plug in.
 */
export function isMember(): boolean {
  return false;
}

/**
 * Tier vernacular (Alexandria, 2026-07-10; renamed 2026-07-12): doll/ballroom
 * lineage — this is a House, and houses have family. Everyone arrives a Doll;
 * membership makes you a Venusian Doll and lifts the veil on every room. The
 * House Mother is Alexandria herself (admin). Rename here and the whole site
 * follows.
 */
export const TIER_NAMES = {
  free: "The Dolls",
  member: "Venusian Doll",
  admin: "House Mother",
} as const;

/** Venusian Doll membership: $5 a month to see behind the veil. */
export const MEMBERSHIP_PRICE_CENTS = 500;
export const MEMBERSHIP_PRICE_LABEL = "$5";

/** Venusian Dolls get all access + this discount on every reading. */
export const MEMBER_DISCOUNT = 0.1;

/**
 * The one place membership is decided: paid flag, admin, or an unexpired
 * time-boxed grant (free trial / comp). Structural type so client bundles
 * don't drag Prisma in.
 */
export function isActiveMember(
  user:
    | { isMember: boolean; role: string; memberUntil?: Date | null }
    | null
    | undefined
): boolean {
  if (!user) return false;
  if (user.isMember || user.role === "admin") return true;
  return !!user.memberUntil && user.memberUntil > new Date();
}

export const PREMIUM_FEATURES = [
  "The deeper chart — essential dignities, sect analysis, decans & bounds",
  "Lots of Fortune & Spirit + zodiacal releasing timelines",
  "Live transits — the sky now, against your chart",
  "Human Design bodygraph",
  "Tarot room",
  "Solar return charts for any year and place",
  "Fixed stars & asteroids",
  "Nakshatra remedies & practices",
] as const;
