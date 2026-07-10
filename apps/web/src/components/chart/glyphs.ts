import type { Body } from "@hoa/engine";

/**
 * Authentic astrological glyphs.
 *
 * Every glyph carries U+FE0E (text variation selector) so the OS renders the
 * real typographic astrological symbol instead of a color-emoji tile. Pair
 * with the `.astro-glyph` CSS class (font-variant-emoji: text + serif) so they
 * read as engraved line-art, consistent with the chart.
 */
const TEXT = "︎";
const t = (s: string) => s + TEXT;

export const PLANET_GLYPHS: Record<Body, string> = {
  sun: t("☉"), moon: t("☽"), mercury: t("☿"), venus: t("♀"), mars: t("♂"),
  jupiter: t("♃"), saturn: t("♄"), uranus: t("♅"), neptune: t("♆"), pluto: t("♇"),
  rahu: t("☊"), ketu: t("☋"),
};

export const SIGN_GLYPHS = [
  "♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓",
].map(t);

export const SIGN_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

export const BODY_NAMES: Record<Body, string> = {
  sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars",
  jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus", neptune: "Neptune",
  pluto: "Pluto", rahu: `Rahu ${t("☊")}`, ketu: `Ketu ${t("☋")}`,
};

/**
 * A distinct color per sign, drawn from each sign's traditional planetary
 * ruler and element — muted for the light "zen" palette but individual, so a
 * chart reads as twelve voices, not four elements.
 */
export const SIGN_COLORS = [
  "#c85a44", // Aries — Mars terracotta
  "#6f8f5f", // Taurus — Venusian earth green
  "#c99a3a", // Gemini — Mercurial gold
  "#6d8bb0", // Cancer — moonlit blue
  "#d1962f", // Leo — solar amber
  "#7d8a54", // Virgo — olive
  "#cf7a9c", // Libra — Venusian rose
  "#9c4a63", // Scorpio — deep crimson
  "#7c6bc0", // Sagittarius — Jupiterian indigo
  "#5e6b78", // Capricorn — Saturnian slate
  "#4f93ad", // Aquarius — electric teal
  "#6aa397", // Pisces — sea green
];

export const ASPECT_COLORS: Record<string, string> = {
  conjunction: "#cf9c3f",
  opposition: "#d4638f",
  square: "#d4638f",
  trine: "#5fae85",
  sextile: "#8b83cc",
};

export const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: t("☌"), opposition: t("☍"), square: t("□"),
  trine: t("△"), sextile: t("✶"),
};

export const ORDINALS = [
  "1st", "2nd", "3rd", "4th", "5th", "6th",
  "7th", "8th", "9th", "10th", "11th", "12th",
];
