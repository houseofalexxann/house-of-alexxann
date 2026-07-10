/**
 * Plain-language taglines, significations and cheat-sheet copy for the
 * Chart Studio — the "make it make sense" layer that keeps professional
 * math approachable (presentation direction set by Alexandria, 2026-07-10).
 */

/** One-line tagline per body: what this planet *does* in a chart. */
export const PLANET_TAGLINES: Record<string, string> = {
  sun: "Your identity and where you shine",
  moon: "Your body, feelings and what home means",
  mercury: "How and where you communicate",
  venus: "How and where you connect",
  mars: "How and where you take action",
  jupiter: "How and where you create abundance",
  saturn: "How and where you build boundaries",
  uranus: "How and where you innovate and disrupt",
  neptune: "How and where you use your imagination",
  pluto: "How and where you hold quiet power",
  rahu: "What you're here to grow toward",
  ketu: "What you already know by heart",
};

/** Keyword significations per body (classical + modern, kept warm). */
export const PLANET_SIGNIFICATIONS: Record<string, string[]> = {
  sun: ["soul", "vitality", "individuality", "father", "self-esteem", "purpose"],
  moon: ["emotions", "mind", "mother", "home", "instinct", "belonging"],
  mercury: ["intellect", "language", "siblings", "learning", "humor", "trade"],
  venus: ["love", "beauty", "relationships", "money", "art", "pleasure"],
  mars: ["courage", "desire", "action", "drive", "anger", "competition"],
  jupiter: ["wisdom", "growth", "luck", "teachers", "faith", "generosity"],
  saturn: ["time", "discipline", "longevity", "limits", "mastery", "elders"],
  uranus: ["change", "originality", "technology", "freedom", "awakening"],
  neptune: ["imagination", "dreams", "music", "mysticism", "dissolving"],
  pluto: ["power", "depth", "transformation", "psychology", "rebirth"],
  rahu: ["hunger", "future", "obsession", "growth edge", "the unfamiliar"],
  ketu: ["release", "past karma", "intuition", "renunciation", "the familiar"],
};

/** House cheat-sheet: domain keywords per house (index 0 = 1st). */
export const HOUSE_MEANINGS: { title: string; keywords: string }[] = [
  { title: "1st House", keywords: "self, appearance, vitality, life force" },
  { title: "2nd House", keywords: "assets, resources, talents, self-worth" },
  { title: "3rd House", keywords: "communication, daily rituals, siblings, neighborhood" },
  { title: "4th House", keywords: "home, parents, roots, foundations" },
  { title: "5th House", keywords: "pleasure, romance, creativity, children" },
  { title: "6th House", keywords: "work, health, routines, service" },
  { title: "7th House", keywords: "committed partnerships, contracts, the other" },
  { title: "8th House", keywords: "shared resources, intimacy, endings, depth work" },
  { title: "9th House", keywords: "travel, education, belief, philosophy, astrology" },
  { title: "10th House", keywords: "career, public roles, reputation" },
  { title: "11th House", keywords: "community, friends, future, good fortune" },
  { title: "12th House", keywords: "retreat, dreams, the hidden, release" },
];

/** Angle taglines. */
export const ANGLE_TAGLINES = {
  ascendant: "Your motivation for living this life",
  midheaven: "Your public image and vocation",
};
