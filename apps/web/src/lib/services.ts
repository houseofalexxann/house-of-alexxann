/**
 * The three Phase 1 offerings (PRD §6.6). Placeholder pricing — Alexandria
 * sets real prices before launch. This module is the single source used by
 * the marketing pages, the scheduler and the database seed.
 */

export type SessionFormat = "video" | "phone" | "in-person";

export interface ServiceDef {
  slug: string;
  type: "natal" | "transit" | "vedic";
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
  durationMinutes: number;
  /** Price in USD cents. */
  priceCents: number;
  formats: SessionFormat[];
}

export const SERVICES: ServiceDef[] = [
  {
    slug: "natal-reading",
    type: "natal",
    title: "Natal Chart Reading",
    tagline: "The map you were born with.",
    description:
      "A full walk through your Western birth chart — Sun, Moon, rising, and the geometry between them. We trace how your placements speak to identity, work, love, and the patterns you keep meeting, so the chart becomes something you can actually use.",
    bullets: [
      "Complete natal chart, cast for your exact birth time and place",
      "Placements, houses and major aspects, translated into plain language",
      "Space for your questions — career, relationships, timing",
      "A keepsake chart image to take with you",
    ],
    durationMinutes: 90,
    priceCents: 17500,
    formats: ["video", "phone", "in-person"],
  },
  {
    slug: "transit-forecast-reading",
    type: "transit",
    title: "Transit & Forecast Reading",
    tagline: "Where the sky is asking you to look next.",
    description:
      "A forward-looking session for the season ahead. We set your natal chart against the current and upcoming sky to find the themes, windows and pressure points of the next six to twelve months — practical timing, not vague prediction.",
    bullets: [
      "The year ahead, read against your own chart — not your sun sign's",
      "Key dates and windows worth planning around",
      "Clear-eyed guidance for decisions already on your desk",
      "Best after a natal reading, but not required",
    ],
    durationMinutes: 60,
    priceCents: 12500,
    formats: ["video", "phone"],
  },
  {
    slug: "vedic-reading",
    type: "vedic",
    title: "Vedic (Jyotish) Reading",
    tagline: "The sidereal sky and its seasons of time.",
    description:
      "Your chart through the Vedic lens: the sidereal zodiac, your Moon's nakshatra, the Rasi and Navamsa charts, and the Vimshottari dasha timeline that maps the chapters of your life. A different instrument, tuned to time itself.",
    bullets: [
      "Rasi (D1) and Navamsa (D9) charts, cast sidereal with Lahiri ayanamsa",
      "Your nakshatra and what it colors",
      "Vimshottari dasha timeline — the chapter you're in and the one that's coming",
      "Honest discussion of how the Vedic and Western views converse",
    ],
    durationMinutes: 90,
    priceCents: 17500,
    formats: ["video", "phone", "in-person"],
  },
];

export const FORMAT_LABELS: Record<SessionFormat, string> = {
  video: "Live video call",
  phone: "Phone call",
  "in-person": "In person",
};

export function serviceBySlug(slug: string): ServiceDef | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}
