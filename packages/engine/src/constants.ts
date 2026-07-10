import type { Body, AspectType, HouseSystem, Ayanamsa } from "./types";

export const SIGN_NAMES = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

export const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra",
  "Punarvasu", "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni",
  "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha",
  "Purva Bhadrapada", "Uttara Bhadrapada", "Revati",
] as const;

/** Vimshottari lords in nakshatra order (repeats every 9), starting at Ashwini. */
export const DASHA_LORDS: Body[] = [
  "ketu", "venus", "sun", "moon", "mars", "rahu", "jupiter", "saturn", "mercury",
];

/** Vimshottari mahadasha lengths in years (total 120). */
export const DASHA_YEARS: Record<string, number> = {
  ketu: 7, venus: 20, sun: 6, moon: 10, mars: 7,
  rahu: 18, jupiter: 16, saturn: 19, mercury: 17,
};

/** Days per Vimshottari year — the common software convention (Julian year). */
export const DASHA_YEAR_DAYS = 365.25;

export const NAKSHATRA_SPAN = 360 / 27; // 13°20'
export const NAVAMSA_SPAN = 30 / 9; // 3°20'

export const WESTERN_BODIES: Body[] = [
  "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn",
  "uranus", "neptune", "pluto", "rahu", "ketu",
];

/** Classical vedic grahas: seven planets + the two nodes. */
export const VEDIC_BODIES: Body[] = [
  "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "rahu", "ketu",
];

export const ASPECT_ANGLES: Record<AspectType, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

export const DEFAULT_ORBS: Record<AspectType, number> = {
  conjunction: 8,
  opposition: 8,
  trine: 8,
  square: 7,
  sextile: 6,
};

/** Swiss Ephemeris house system codes. */
export const HOUSE_SYSTEM_CODES: Record<HouseSystem, string> = {
  placidus: "P",
  "whole-sign": "W",
  koch: "K",
  equal: "A",
  porphyry: "O",
  regiomontanus: "R",
  campanus: "C",
};

/** Swiss Ephemeris sidereal-mode ids. */
export const AYANAMSA_IDS: Record<Ayanamsa, number> = {
  "fagan-bradley": 0,
  lahiri: 1,
  raman: 3,
  krishnamurti: 5,
};

export const BODY_LABELS: Record<Body, string> = {
  sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars",
  jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus", neptune: "Neptune",
  pluto: "Pluto", rahu: "Rahu (North Node)", ketu: "Ketu (South Node)",
};
