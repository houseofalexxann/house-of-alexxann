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
  {
    slug: "solar-return-reading",
    type: "transit",
    title: "Solar Return Reading",
    tagline: "Your year, cast to the minute.",
    description:
      "Every year the Sun comes home to the exact degree it held when you were born — your true new year, accurate to the minute. We cast that return chart (for where you'll be on your birthday), read it as the year's weather, and lay it over your natal chart to see where it lands. Best booked in the month around your birthday.",
    bullets: [
      "Your solar return chart, cast to the minute for your birthday location",
      "The year's themes: where it opens, where it asks patience",
      "Return chart laid over your natal promise",
      "Relocation advice — yes, where you spend your birthday matters",
    ],
    durationMinutes: 60,
    priceCents: 13500,
    formats: ["video", "phone"],
  },
];

export const FORMAT_LABELS: Record<SessionFormat, string> = {
  video: "Live video call",
  phone: "Phone call",
  "in-person": "In person",
};

/**
 * Sliding-scale pricing (Alexandria, 2026-07-10): every reading offers three
 * honor-system tiers so cost isn't a barrier. Standard is the listed price;
 * community is ~70% and sustainer ~125%, rounded to $5.
 */
export type PriceTierKey = "community" | "standard" | "sustainer";

export interface PriceTier {
  key: PriceTierKey;
  label: string;
  priceCents: number;
  blurb: string;
}

function roundTo5(cents: number): number {
  return Math.round(cents / 500) * 500;
}

export function priceTiers(service: ServiceDef): PriceTier[] {
  return [
    {
      key: "community",
      label: "Community rate",
      priceCents: roundTo5(service.priceCents * 0.7),
      blurb: "For tighter seasons — no questions, no proof, same reading.",
    },
    {
      key: "standard",
      label: "Standard rate",
      priceCents: service.priceCents,
      blurb: "The true cost of the work.",
    },
    {
      key: "sustainer",
      label: "Sustainer rate",
      priceCents: roundTo5(service.priceCents * 1.25),
      blurb: "Helps hold the community rate open for someone else.",
    },
  ];
}

/**
 * Payment options surfaced at checkout. Card is always available; the
 * pay-over-time options ride on Stripe (Klarna pay-in-4, Afterpay,
 * Affirm monthly installments) and appear automatically in Checkout once
 * enabled on the Stripe account.
 */
export const PAYMENT_OPTIONS = [
  { key: "card", label: "Card", note: "Pay in full today" },
  { key: "pay-in-4", label: "Pay in 4", note: "Four interest-free payments (Klarna/Afterpay)" },
  { key: "installments", label: "Monthly installments", note: "Spread it further with Affirm" },
] as const;

export function serviceBySlug(slug: string): ServiceDef | undefined {
  return SERVICES.find((s) => s.slug === slug);
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}
