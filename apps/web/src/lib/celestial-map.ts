/**
 * The celestial map: the single source of truth for navigation.
 *
 * This file holds NAVIGATION data — real routes, real names, real
 * descriptions — which is rendered as ordinary links. The atlas coordinates
 * are a layout hint for the star map, never load-bearing: if every canvas
 * failed to paint, navigation built from this file would still work.
 *
 * Decorative star positions live in the canvas components and stay there.
 */

export interface CelestialRegion {
  /** Route this region actually goes to. */
  href: string;
  /** The region's celestial name. */
  name: string;
  /** The plain name of the destination, for the list and for screen readers. */
  plain: string;
  /** A typographic astrological glyph, decorative. */
  glyph: string;
  /** One honest sentence about what is there. */
  blurb: string;
  /** Atlas position, 0–1 of the viewport box. Layout hint only. */
  x: number;
  y: number;
  /** Relative brightness, 0–1: the North Star burns brightest. */
  magnitude: number;
  /** Regions this one is drawn to, by href — the constellation lines. */
  neighbors: string[];
}

export const HOUSE_CENTER: CelestialRegion = {
  href: "/",
  name: "The House at the Center",
  plain: "Home",
  glyph: "✦",
  blurb: "Where every path begins and returns.",
  x: 0.5,
  y: 0.5,
  magnitude: 0.9,
  neighbors: ["/studio", "/western", "/vedic", "/services", "/codex"],
};

export const CELESTIAL_MAP: CelestialRegion[] = [
  {
    href: "/studio",
    name: "The North Star",
    plain: "Chart Studio",
    glyph: "★",
    blurb: "Cast a natal chart from your exact date, time and place. Free, always.",
    x: 0.5,
    y: 0.14,
    magnitude: 1,
    neighbors: ["/", "/western", "/vedic"],
  },
  {
    href: "/western",
    name: "The Solar Constellation",
    plain: "Western astrology",
    glyph: "☉",
    blurb: "The tropical chart: wheel, houses, aspects, and the deeper dignities.",
    x: 0.24,
    y: 0.27,
    magnitude: 0.85,
    neighbors: ["/studio", "/", "/human-design"],
  },
  {
    href: "/vedic",
    name: "The Lunar Mansions",
    plain: "Vedic astrology",
    glyph: "☾",
    blurb: "The sidereal sky: nakshatras, Rasi and Navamsa, your dasha timeline.",
    x: 0.76,
    y: 0.27,
    magnitude: 0.85,
    neighbors: ["/studio", "/", "/tarot"],
  },
  {
    href: "/human-design",
    name: "The Geometric Body",
    plain: "Human Design",
    glyph: "◇",
    blurb: "Type, strategy, authority and profile, and the full bodygraph.",
    x: 0.13,
    y: 0.52,
    magnitude: 0.7,
    neighbors: ["/western", "/codex"],
  },
  {
    href: "/tarot",
    name: "The Arcana Nebula",
    plain: "Tarot",
    glyph: "✶",
    blurb: "A daily draw, spreads, and the House's own message cards.",
    x: 0.87,
    y: 0.52,
    magnitude: 0.7,
    neighbors: ["/vedic", "/transits"],
  },
  {
    href: "/transits",
    name: "The Living Orbit",
    plain: "The sky now",
    glyph: "◐",
    blurb: "Today's sky, computed live, and the week ahead.",
    x: 0.86,
    y: 0.8,
    magnitude: 0.75,
    neighbors: ["/tarot", "/services", "/blog"],
  },
  {
    href: "/blog",
    name: "The Observatory",
    plain: "The daily sky",
    glyph: "✎",
    blurb: "Dispatches, history and lore, posted from the House.",
    x: 0.5,
    y: 0.88,
    magnitude: 0.6,
    neighbors: ["/transits", "/codex"],
  },
  {
    href: "/codex",
    name: "The Celestial Library",
    plain: "Learn",
    glyph: "❋",
    blurb: "Every glyph and term, decans, bounds, zodiacal releasing.",
    x: 0.28,
    y: 0.78,
    magnitude: 0.65,
    neighbors: ["/human-design", "/blog", "/"],
  },
  {
    href: "/services",
    name: "Alexandria's Chamber",
    plain: "Readings",
    glyph: "✧",
    blurb: "Sit with Alexandria. Sliding scale, every way to pay.",
    x: 0.5,
    y: 0.66,
    magnitude: 0.8,
    neighbors: ["/", "/transits"],
  },
  {
    href: "/calendar",
    name: "My Orbit",
    plain: "My calendar",
    glyph: "◉",
    blurb: "Your profected year and the transits ahead, keyed to your chart.",
    x: 0.72,
    y: 0.6,
    magnitude: 0.7,
    neighbors: ["/services"],
  },
];

/** Every region including the House, for lookups. */
export const ALL_REGIONS: CelestialRegion[] = [HOUSE_CENTER, ...CELESTIAL_MAP];

/** The region a pathname belongs to, for "you are here". */
export function regionFor(pathname: string): CelestialRegion | null {
  if (pathname === "/") return HOUSE_CENTER;
  // Longest matching prefix wins, so /services/natal-reading finds the Chamber.
  const matches = ALL_REGIONS.filter(
    (r) => r.href !== "/" && (pathname === r.href || pathname.startsWith(`${r.href}/`))
  ).sort((a, b) => b.href.length - a.href.length);
  if (matches[0]) return matches[0];
  // Account and booking live in My Orbit and the Chamber respectively.
  if (pathname.startsWith("/account")) return CELESTIAL_MAP.find((r) => r.href === "/calendar") ?? null;
  if (pathname.startsWith("/book")) return CELESTIAL_MAP.find((r) => r.href === "/services") ?? null;
  return null;
}

/**
 * Routes where the universe goes quiet: forms, payment, charts-in-progress,
 * account management and the whole admin. Motion never runs over these.
 */
const OBSERVATORY_PREFIXES = [
  "/book",
  "/login",
  "/signup",
  "/forgot",
  "/reset",
  "/admin",
  "/account",
  "/calendar",
];

export function isObservatory(pathname: string): boolean {
  return OBSERVATORY_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}
