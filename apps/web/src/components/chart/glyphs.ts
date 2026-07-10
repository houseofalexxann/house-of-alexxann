import type { Body } from "@hoa/engine";

export const PLANET_GLYPHS: Record<Body, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
  rahu: "☊", ketu: "☋",
};

export const SIGN_GLYPHS = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

export const SIGN_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
];

export const BODY_NAMES: Record<Body, string> = {
  sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars",
  jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus", neptune: "Neptune",
  pluto: "Pluto", rahu: "Rahu ☊", ketu: "Ketu ☋",
};

/** Element hue per sign index: fire, earth, air, water repeating (pastels). */
export const SIGN_COLORS = [
  "#e08a63", "#74b18a", "#6f9ed6", "#8b83cc",
  "#e08a63", "#74b18a", "#6f9ed6", "#8b83cc",
  "#e08a63", "#74b18a", "#6f9ed6", "#8b83cc",
];

export const ASPECT_COLORS: Record<string, string> = {
  conjunction: "#cf9c3f",
  opposition: "#d4638f",
  square: "#d4638f",
  trine: "#5fae85",
  sextile: "#8b83cc",
};

export const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: "☌", opposition: "☍", square: "□", trine: "△", sextile: "✶",
};

export const ORDINALS = [
  "1st", "2nd", "3rd", "4th", "5th", "6th",
  "7th", "8th", "9th", "10th", "11th", "12th",
];
