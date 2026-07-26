/**
 * The interpretive layer for the personal calendar.
 *
 * Everything here is composed from classical significations rather than
 * invented per-combination prose, so each line can be traced to its source:
 *
 * - HOUSE TOPICS follow the Hellenistic house significations preserved in
 *   Valens (Anthology), Paulus Alexandrinus (Introduction) and Firmicus
 *   Maternus (Mathesis). HISTORICAL DOCTRINE.
 * - PLANET SIGNIFICATIONS follow the traditional descriptions in Ptolemy
 *   (Tetrabiblos I) and the Hellenistic corpus. HISTORICAL DOCTRINE.
 * - ASPECT NATURES follow Ptolemy's doctrine of configurations: the square
 *   and opposition register as tension, the trine and sextile as ease, the
 *   conjunction as union. HISTORICAL DOCTRINE.
 * - The MODERN PLANETS (Uranus, Neptune, Pluto) have no classical
 *   significations; their meanings here are twentieth-century practice and
 *   are labeled as such. CONTEMPORARY PRACTICE.
 * - The framing sentences ("one way to sit with this…") are REFLECTIVE
 *   LANGUAGE, not prediction. Nothing in this file claims an outcome.
 *
 * Reference for the timing framework: Chris Brennan, Hellenistic Astrology:
 * The Study of Fate and Fortune (2017), and The Astrology Podcast's episodes
 * on annual profections and transits.
 */
import type { AspectType, Body } from "@hoa/engine";

export type Provenance = "doctrine" | "modern-practice";

/** Whole-sign house topics, 1–12. */
export const HOUSE_TOPICS: Record<number, { name: string; topics: string }> = {
  1: { name: "the house of self", topics: "your body, vitality, appearance, and how you move through the world" },
  2: { name: "the house of livelihood", topics: "money, resources, and what you accumulate" },
  3: { name: "the house of the near", topics: "siblings, neighbors, short journeys, and everyday communication" },
  4: { name: "the house of foundations", topics: "home, family, ancestry, and the private ground you stand on" },
  5: { name: "the house of pleasure", topics: "children, creativity, romance, and what you make for joy" },
  6: { name: "the house of labor", topics: "work, daily routine, health, and the people you look after" },
  7: { name: "the house of partnership", topics: "marriage, close partners, and open opponents" },
  8: { name: "the house of shared fate", topics: "other people's resources, debt, inheritance, and mortality" },
  9: { name: "the house of the far", topics: "travel, study, philosophy, and the search for meaning" },
  10: { name: "the house of standing", topics: "career, reputation, and public life" },
  11: { name: "the house of friends", topics: "alliances, community, and the hopes you hold" },
  12: { name: "the house of the hidden", topics: "solitude, rest, what runs underneath, and what you carry unseen" },
};

export const PLANET_SIGNIFICATION: Record<Body, { keynote: string; provenance: Provenance }> = {
  sun: { keynote: "vitality, purpose, and what you are becoming known for", provenance: "doctrine" },
  moon: { keynote: "body, mood, habit, and the rhythm of daily life", provenance: "doctrine" },
  mercury: { keynote: "thinking, speech, commerce, and the exchange of information", provenance: "doctrine" },
  venus: { keynote: "love, beauty, harmony, and what you value", provenance: "doctrine" },
  mars: { keynote: "drive, conflict, cutting away, and decisive action", provenance: "doctrine" },
  jupiter: { keynote: "expansion, opportunity, teachers, and generosity", provenance: "doctrine" },
  saturn: { keynote: "structure, limit, time, and the work that earns its keep", provenance: "doctrine" },
  uranus: { keynote: "disruption, sudden change, and the break from convention", provenance: "modern-practice" },
  neptune: { keynote: "dissolution, imagination, longing, and what blurs", provenance: "modern-practice" },
  pluto: { keynote: "power, depth, and slow irreversible change", provenance: "modern-practice" },
  rahu: { keynote: "appetite and the direction of increase", provenance: "doctrine" },
  ketu: { keynote: "release and the direction of letting go", provenance: "doctrine" },
};

export const ASPECT_NATURE: Record<AspectType, { verb: string; nature: string }> = {
  conjunction: { verb: "meets", nature: "union: the two significations run together and intensify" },
  sextile: { verb: "sextiles", nature: "ease, but only if you reach for it" },
  square: { verb: "squares", nature: "tension that asks for an adjustment" },
  trine: { verb: "trines", nature: "flow: things move with less friction here" },
  opposition: { verb: "opposes", nature: "a facing-off that makes something visible" },
};

export const POINT_LABEL: Record<string, string> = {
  sun: "Sun",
  moon: "Moon",
  mercury: "Mercury",
  venus: "Venus",
  mars: "Mars",
  jupiter: "Jupiter",
  saturn: "Saturn",
  uranus: "Uranus",
  neptune: "Neptune",
  pluto: "Pluto",
  rahu: "North Node",
  ketu: "South Node",
  ascendant: "Ascendant",
  midheaven: "Midheaven",
};

/** How firmly the House stands behind a given event's framing. */
export function provenanceOf(transiting: Body, natalPoint?: string): Provenance {
  const a = PLANET_SIGNIFICATION[transiting]?.provenance ?? "doctrine";
  const b =
    natalPoint && natalPoint in PLANET_SIGNIFICATION
      ? PLANET_SIGNIFICATION[natalPoint as Body].provenance
      : "doctrine";
  return a === "modern-practice" || b === "modern-practice" ? "modern-practice" : "doctrine";
}
