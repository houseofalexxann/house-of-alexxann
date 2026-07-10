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
 * Tier names (Alexandria, 2026-07-10): deity-named circles.
 * Selene — the Moon who shines on everyone (free).
 * Asteria — titaness of falling stars and night divination (member).
 * Urania — muse of the heavens, patron of astrologers (sustaining member,
 * future higher tier). Rename here and the whole site follows.
 */
export const TIER_NAMES = {
  free: "Selene Circle",
  member: "Asteria Circle",
  sustainer: "Urania Circle",
} as const;

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
