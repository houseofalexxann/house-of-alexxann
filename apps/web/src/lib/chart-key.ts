/**
 * The key to the charts: every glyph, abbreviation and mark the House draws,
 * with a plain one-line meaning, and the short guides to reading a Western
 * wheel and a Jyotish rasi chart.
 *
 * Meanings are the mainstream beginner framing (the kind taught by Astro.com,
 * CHANI and The Astrology Podcast) written in the House's own words. They
 * describe tendencies and themes, never verdicts.
 */
import type { Body, ExtraBody } from "@hoa/engine";

const TEXT = "︎";

/** Standard two-letter graha abbreviations used in Jyotish charts. */
export const GRAHA_ABBR: Record<Body, string> = {
  sun: "Su",
  moon: "Mo",
  mercury: "Me",
  venus: "Ve",
  mars: "Ma",
  jupiter: "Ju",
  saturn: "Sa",
  uranus: "Ur",
  neptune: "Ne",
  pluto: "Pl",
  rahu: "Ra",
  ketu: "Ke",
};

export interface PlanetKeyRow {
  body: Body;
  glyph: string;
  abbr: string;
  name: string;
  /** Sanskrit name, for the Vedic key. */
  sanskrit?: string;
  keynote: string;
  /** Shown only in the Vedic key. */
  vedicOnly?: boolean;
  /** Shown only in the Western key. */
  westernOnly?: boolean;
}

export const PLANET_KEY: PlanetKeyRow[] = [
  { body: "sun", glyph: `☉${TEXT}`, abbr: "Su", name: "Sun", sanskrit: "Surya", keynote: "Identity, vitality, what you are here to shine as." },
  { body: "moon", glyph: `☽${TEXT}`, abbr: "Mo", name: "Moon", sanskrit: "Chandra", keynote: "Feelings, needs, habits, the private self." },
  { body: "mercury", glyph: `☿${TEXT}`, abbr: "Me", name: "Mercury", sanskrit: "Budha", keynote: "Mind, language, learning, how you think and speak." },
  { body: "venus", glyph: `♀${TEXT}`, abbr: "Ve", name: "Venus", sanskrit: "Shukra", keynote: "Love, beauty, pleasure, what you value and attract." },
  { body: "mars", glyph: `♂${TEXT}`, abbr: "Ma", name: "Mars", sanskrit: "Mangala", keynote: "Drive, desire, courage, how you act and fight." },
  { body: "jupiter", glyph: `♃${TEXT}`, abbr: "Ju", name: "Jupiter", sanskrit: "Guru", keynote: "Growth, faith, luck, meaning, where things expand." },
  { body: "saturn", glyph: `♄${TEXT}`, abbr: "Sa", name: "Saturn", sanskrit: "Shani", keynote: "Structure, limits, time, discipline, what matures slowly." },
  { body: "uranus", glyph: `♅${TEXT}`, abbr: "Ur", name: "Uranus", keynote: "Change, freedom, sudden insight, the unconventional.", westernOnly: true },
  { body: "neptune", glyph: `♆${TEXT}`, abbr: "Ne", name: "Neptune", keynote: "Dreams, imagination, dissolving edges, spirituality.", westernOnly: true },
  { body: "pluto", glyph: `♇${TEXT}`, abbr: "Pl", name: "Pluto", keynote: "Power, depth, transformation, what must be faced.", westernOnly: true },
  { body: "rahu", glyph: `☊${TEXT}`, abbr: "Ra", name: "North Node", sanskrit: "Rahu", keynote: "Appetite and direction: what pulls you forward, sometimes too hard." },
  { body: "ketu", glyph: `☋${TEXT}`, abbr: "Ke", name: "South Node", sanskrit: "Ketu", keynote: "Release and detachment: what you already know, what you let go." },
];

export interface ExtraKeyRow {
  body: ExtraBody;
  glyph: string;
  name: string;
  keynote: string;
}

/** Asteroids and points that can be added to the Western wheel, with the mainstream keynotes. */
export const EXTRA_KEY: ExtraKeyRow[] = [
  { body: "chiron", glyph: `⚷${TEXT}`, name: "Chiron", keynote: "The wound that teaches: where you heal others through what hurt you." },
  { body: "ceres", glyph: `⚳${TEXT}`, name: "Ceres", keynote: "Nurture, food, and the cycles of loss and return." },
  { body: "pallas", glyph: `⚴${TEXT}`, name: "Pallas", keynote: "Pattern, strategy, creative intelligence." },
  { body: "juno", glyph: `⚵${TEXT}`, name: "Juno", keynote: "Commitment, partnership, the terms of being together." },
  { body: "vesta", glyph: `⚶${TEXT}`, name: "Vesta", keynote: "Devotion, focus, the flame you keep." },
  { body: "lilith", glyph: `⚸${TEXT}`, name: "Black Moon Lilith", keynote: "The mean lunar apogee: what refuses to be tamed or shamed." },
];

export const EXTRA_GLYPHS: Record<ExtraBody, string> = Object.fromEntries(
  EXTRA_KEY.map((e) => [e.body, e.glyph])
) as Record<ExtraBody, string>;

/** Every addition the studio can request, in display order (client-safe copy of the engine's list). */
export const ALL_EXTRAS: ExtraBody[] = EXTRA_KEY.map((e) => e.body);

export interface SignKeyRow {
  index: number;
  glyph: string;
  name: string;
  sanskrit: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  modality: "Cardinal" | "Fixed" | "Mutable";
  ruler: string;
  keynote: string;
}

export const SIGN_KEY: SignKeyRow[] = [
  { index: 0, glyph: `♈${TEXT}`, name: "Aries", sanskrit: "Mesha", element: "Fire", modality: "Cardinal", ruler: "Mars", keynote: "Initiative, courage, the first move." },
  { index: 1, glyph: `♉${TEXT}`, name: "Taurus", sanskrit: "Vrishabha", element: "Earth", modality: "Fixed", ruler: "Venus", keynote: "Steadiness, pleasure, what lasts." },
  { index: 2, glyph: `♊${TEXT}`, name: "Gemini", sanskrit: "Mithuna", element: "Air", modality: "Mutable", ruler: "Mercury", keynote: "Curiosity, exchange, two of everything." },
  { index: 3, glyph: `♋${TEXT}`, name: "Cancer", sanskrit: "Karka", element: "Water", modality: "Cardinal", ruler: "Moon", keynote: "Care, memory, home, protection." },
  { index: 4, glyph: `♌${TEXT}`, name: "Leo", sanskrit: "Simha", element: "Fire", modality: "Fixed", ruler: "Sun", keynote: "Heart, creativity, being seen." },
  { index: 5, glyph: `♍${TEXT}`, name: "Virgo", sanskrit: "Kanya", element: "Earth", modality: "Mutable", ruler: "Mercury", keynote: "Craft, discernment, service, refinement." },
  { index: 6, glyph: `♎${TEXT}`, name: "Libra", sanskrit: "Tula", element: "Air", modality: "Cardinal", ruler: "Venus", keynote: "Balance, partnership, fairness, beauty." },
  { index: 7, glyph: `♏${TEXT}`, name: "Scorpio", sanskrit: "Vrischika", element: "Water", modality: "Fixed", ruler: "Mars", keynote: "Intensity, intimacy, what lies beneath." },
  { index: 8, glyph: `♐${TEXT}`, name: "Sagittarius", sanskrit: "Dhanu", element: "Fire", modality: "Mutable", ruler: "Jupiter", keynote: "Faith, horizons, the search for meaning." },
  { index: 9, glyph: `♑${TEXT}`, name: "Capricorn", sanskrit: "Makara", element: "Earth", modality: "Cardinal", ruler: "Saturn", keynote: "Ambition, structure, the long climb." },
  { index: 10, glyph: `♒${TEXT}`, name: "Aquarius", sanskrit: "Kumbha", element: "Air", modality: "Fixed", ruler: "Saturn", keynote: "Ideas, community, the view from outside." },
  { index: 11, glyph: `♓${TEXT}`, name: "Pisces", sanskrit: "Meena", element: "Water", modality: "Mutable", ruler: "Jupiter", keynote: "Compassion, imagination, dissolving into the whole." },
];

export interface AspectKeyRow {
  type: string;
  symbol: string;
  name: string;
  angle: string;
  color: string;
  keynote: string;
}

export const ASPECT_KEY: AspectKeyRow[] = [
  { type: "conjunction", symbol: `☌${TEXT}`, name: "Conjunction", angle: "0°", color: "#cf9c3f", keynote: "Two planets blend into one voice. Strong, for better or worse." },
  { type: "sextile", symbol: `✶${TEXT}`, name: "Sextile", angle: "60°", color: "#8b83cc", keynote: "An easy opening that still asks you to act on it." },
  { type: "square", symbol: `□${TEXT}`, name: "Square", angle: "90°", color: "#d4638f", keynote: "Friction that pushes for a decision. Growth through effort." },
  { type: "trine", symbol: `△${TEXT}`, name: "Trine", angle: "120°", color: "#5fae85", keynote: "Natural flow between two parts of you. A gift, easy to take for granted." },
  { type: "opposition", symbol: `☍${TEXT}`, name: "Opposition", angle: "180°", color: "#d4638f", keynote: "Two pulls facing each other. Awareness through the other side." },
];

export const ANGLE_KEY: { label: string; name: string; keynote: string }[] = [
  { label: "AC", name: "Ascendant, rising sign", keynote: "The eastern horizon at birth. Your approach, your arrival, the face people meet first. Always drawn at the left." },
  { label: "DC", name: "Descendant", keynote: "Directly opposite the Ascendant. Partners, the other, what you meet in relationship." },
  { label: "MC", name: "Midheaven", keynote: "The highest point of the sky. Vocation, public life, what you are known for." },
  { label: "IC", name: "Imum Coeli", keynote: "The lowest point. Roots, home, family, the private foundation." },
];

export const MARK_KEY: { symbol: string; name: string; keynote: string }[] = [
  { symbol: "℞", name: "Retrograde", keynote: "The planet appeared to move backward when you were born. Traditionally read as turned inward: a slower, more reflective expression, not a flaw." },
  { symbol: "24°23′", name: "Degree and minute", keynote: "How far into its sign a planet sits, from 0° to 29°59′. Close degrees between planets make tighter aspects." },
  { symbol: "1 to 12", name: "House numbers", keynote: "The twelve areas of life, counted counter-clockwise from the Ascendant. Read them in the guide below." },
];

export interface GuideSection {
  heading: string;
  /** Short paragraphs or list items. */
  body: string[];
  list?: boolean;
}

export const HOUSE_LINES: string[] = [
  "1st: self, body, appearance, how you begin.",
  "2nd: money, possessions, resources, what you value.",
  "3rd: siblings, neighbours, short trips, everyday communication.",
  "4th: home, family, roots, private life.",
  "5th: creativity, children, romance, play.",
  "6th: work, health, daily routines, service.",
  "7th: partnership, marriage, open rivals, the other.",
  "8th: shared resources, intimacy, loss and renewal.",
  "9th: belief, higher learning, long journeys, philosophy.",
  "10th: career, reputation, public role.",
  "11th: friends, groups, allies, hopes.",
  "12th: solitude, retreat, the hidden, endings and release.",
];

export const WESTERN_GUIDE: GuideSection[] = [
  {
    heading: "What you are looking at",
    body: [
      "The outer ring is the zodiac: twelve signs, 30° each, with small ticks every 5°. The wheel is turned so the sign rising in the east at your birth sits at the left, marked AC.",
      "Inside the band are the planets. Each glyph carries its degree and minute, and a small tick on the band marks the exact spot. When planets crowd together the glyphs are spread apart so you can read them, and a thin line leads back to the true degree.",
      "The lines from the middle to the band are the house cusps, with the house numbers in the small circles. The four heavier rose lines are the angles: AC and DC, MC and IC.",
      "The inner disc holds the aspects: coloured lines between planets that sit at meaningful angles to each other. Heavier lines are tighter, within two degrees of exact.",
    ],
  },
  {
    heading: "Read it in this order",
    list: true,
    body: [
      "Start with the big three: the Sun's sign, the Moon's sign, and the rising sign at AC. Together they sketch identity, inner life, and approach.",
      "Find the ruler of your rising sign (the key lists each sign's traditional ruler; CHANI calls this planet the steersperson). Where it sits by sign and house says a lot about where the chart's energy goes.",
      "Check whether you were born by day or by night. The Cosmic insights tab says which, and which planets the old tradition reads as the kindest and the most demanding in your chart.",
      "Go planet by planet: its sign says how it acts, its house says where in life it shows up.",
      "Then read the aspects. The tight ones (heavy lines) describe the conversations between planets you feel most.",
      "Notice patterns: many planets in one sign or house, an empty half of the wheel, a planet sitting right on an angle, a planet that was stationary.",
      "Let the question lead. Chris Brennan's advice for a first reading is that the order depends on what you are looking for.",
    ],
  },
  {
    heading: "The twelve houses",
    list: true,
    body: HOUSE_LINES,
  },
  {
    heading: "The five aspects",
    list: true,
    body: ASPECT_KEY.map((a) => `${a.name} (${a.angle}): ${a.keynote}`),
  },
  {
    heading: "How to hold it",
    body: [
      "A chart describes weather, not verdicts. Every placement has a range of expression, and the person living it is the one who decides which part shows up.",
      "Two things in a chart can seem to contradict each other. That is normal, and it is usually where the most interesting story lives.",
      "If your birth time is unknown, the houses and angles are left off on purpose. The planets by sign are still true, the Moon's degree may be off by up to half a sign, and anything about houses should be held loosely.",
    ],
  },
];

export const VEDIC_GUIDE: GuideSection[] = [
  {
    heading: "What you are looking at",
    body: [
      "The North Indian chart is a square divided into twelve houses that never move. The 1st house is the top-centre diamond, and the count runs counter-clockwise: the two triangles at top left are the 2nd and 3rd, the left diamond is the 4th, the bottom diamond the 7th, the right diamond the 10th.",
      "The number in each house is the rasi, the sign that fell there at your birth: 1 is Mesha (Aries) through 12 is Meena (Pisces). Because the houses are fixed, the numbers rotate from chart to chart.",
      "As marks the lagna, the ascendant, with its degree. The grahas are written in the usual short form: Su Mo Ma Me Ju Ve Sa Ra Ke, each with its degree in the sign. ℞ means retrograde.",
      "The South Indian chart works the other way round: the signs are fixed (Mesha is the second cell of the top row and the signs run clockwise) and the houses move. The lagna's cell is marked with a diagonal stroke.",
      "Positions are sidereal, measured against the stars rather than the seasons, which is why they sit roughly 24° behind the tropical positions of a Western chart. That difference is the ayanamsa.",
    ],
  },
  {
    heading: "Read it in this order",
    list: true,
    body: [
      "Begin with the lagna: its sign, and the graha that rules that sign, the lagna lord. Where the lagna lord sits, by house, is where the chart tends to point.",
      "Then the Moon: its rasi and, above all, its nakshatra, the lunar mansion. In Jyotish the Moon carries the mind, and the birth nakshatra sets the whole dasha clock.",
      "Go house by house from the lagna, reading each graha by the house it occupies and the house it rules. Jyotishis read houses in groups: the kendras (1, 4, 7, 10) for the pillars of life, the trikonas (1, 5, 9) for fortune, the dusthanas (6, 8, 12) for what tests you.",
      "Check the Vimshottari dasha timeline to see which graha's chapter you are living in now. Its placement in the chart colours the whole period: promise first, timing second.",
      "Look at the D9, the navamsa, for the deeper strength of each graha and for the themes of partnership and dharma. A graha well placed in both D1 and D9 is read as steady.",
    ],
  },
  {
    heading: "The twelve bhavas",
    list: true,
    body: HOUSE_LINES,
  },
  {
    heading: "How to hold it",
    body: [
      "Jyotish is a tradition with its own long history and its own way of weighing things. The House keeps it distinct from Western astrology rather than blending the two.",
      "A chart is read as tendency and timing, never as a fixed sentence. Remedies, choices and awareness all belong to the reading.",
      "If the birth time is unknown, the lagna is uncertain and the houses with it. The Moon's rasi and the dasha are the parts to lean on, and even those can shift if the Moon changed sign that day.",
    ],
  },
];
