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
