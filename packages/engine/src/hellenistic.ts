/**
 * Hellenistic tables & timing: decans (Chaldean faces), Egyptian terms
 * (bounds), Lots of Fortune & Spirit, and zodiacal releasing L1 periods.
 * Sources: Vettius Valens (Anthology), Ptolemy's report of the Egyptian
 * terms, and the modern recovery of these techniques (Chris Brennan,
 * "Hellenistic Astrology: The Study of Fate and Fortune").
 */
import type { Body, Decan, EgyptianTerm, Lots, ZRPeriod } from "./types";
import { norm360 } from "./ephemeris";

/**
 * Chaldean decans ("faces"): the 36 ten-degree segments, ruled in the
 * descending Chaldean order Mars→Sun→Venus→Mercury→Moon→Saturn→Jupiter,
 * repeating from Aries 0°.
 */
const CHALDEAN: Body[] = [
  "mars", "sun", "venus", "mercury", "moon", "saturn", "jupiter",
];

export function decanOf(longitude: number): Decan {
  const lon = norm360(longitude);
  const index = Math.floor(lon / 10); // 0..35
  return {
    index,
    sign: Math.floor(index / 3),
    decanOfSign: (index % 3) + 1,
    ruler: CHALDEAN[index % 7],
  };
}

/**
 * Egyptian terms (bounds) — the canonical table reported by Ptolemy and
 * used by Valens/Firmicus. Within each sign, five unequal segments each
 * belong to one of the five non-luminary planets. [planet, endDegree].
 */
const EGYPTIAN_TERMS: [Body, number][][] = [
  /* Aries       */ [["jupiter", 6], ["venus", 12], ["mercury", 20], ["mars", 25], ["saturn", 30]],
  /* Taurus      */ [["venus", 8], ["mercury", 14], ["jupiter", 22], ["saturn", 27], ["mars", 30]],
  /* Gemini      */ [["mercury", 6], ["jupiter", 12], ["venus", 17], ["mars", 24], ["saturn", 30]],
  /* Cancer      */ [["mars", 7], ["venus", 13], ["mercury", 19], ["jupiter", 26], ["saturn", 30]],
  /* Leo         */ [["jupiter", 6], ["venus", 11], ["saturn", 18], ["mercury", 24], ["mars", 30]],
  /* Virgo       */ [["mercury", 7], ["venus", 17], ["jupiter", 21], ["mars", 28], ["saturn", 30]],
  /* Libra       */ [["saturn", 6], ["mercury", 14], ["jupiter", 21], ["venus", 28], ["mars", 30]],
  /* Scorpio     */ [["mars", 7], ["venus", 11], ["mercury", 19], ["jupiter", 24], ["saturn", 30]],
  /* Sagittarius */ [["jupiter", 12], ["venus", 17], ["mercury", 21], ["saturn", 26], ["mars", 30]],
  /* Capricorn   */ [["mercury", 7], ["jupiter", 14], ["venus", 22], ["saturn", 26], ["mars", 30]],
  /* Aquarius    */ [["mercury", 7], ["venus", 13], ["jupiter", 20], ["mars", 25], ["saturn", 30]],
  /* Pisces      */ [["venus", 12], ["jupiter", 16], ["mercury", 19], ["mars", 28], ["saturn", 30]],
];

export function egyptianTermOf(longitude: number): EgyptianTerm {
  const lon = norm360(longitude);
  const sign = Math.floor(lon / 30) % 12;
  const deg = lon - sign * 30;
  let start = 0;
  for (const [ruler, end] of EGYPTIAN_TERMS[sign]) {
    if (deg < end) {
      return { sign, ruler, startDegree: start, endDegree: end };
    }
    start = end;
  }
  // Numerically unreachable (tables end at 30), kept for safety.
  const [ruler, end] = EGYPTIAN_TERMS[sign][4];
  return { sign, ruler, startDegree: start, endDegree: end };
}

/** Full bounds table, exposed for the Codex page. */
export function egyptianTermsTable(): { sign: number; terms: { ruler: Body; from: number; to: number }[] }[] {
  return EGYPTIAN_TERMS.map((rows, sign) => {
    let start = 0;
    const terms = rows.map(([ruler, end]) => {
      const t = { ruler, from: start, to: end };
      start = end;
      return t;
    });
    return { sign, terms };
  });
}

/**
 * Lots (Arabic parts), day/night reversed per Hellenistic practice:
 * Fortune (day) = Asc + Moon − Sun; Spirit is its mirror.
 */
export function lots(
  ascendant: number,
  sunLon: number,
  moonLon: number,
  isDay: boolean
): Lots {
  const fortune = isDay
    ? norm360(ascendant + moonLon - sunLon)
    : norm360(ascendant + sunLon - moonLon);
  const spirit = isDay
    ? norm360(ascendant + sunLon - moonLon)
    : norm360(ascendant + moonLon - sunLon);
  return { fortune, spirit };
}

/**
 * Zodiacal releasing: minor planetary years per sign (Valens). Both signs
 * of Saturn and Jupiter differ: Capricorn 27 vs Aquarius 30; Sagittarius
 * and Pisces both 12.
 */
export const ZR_YEARS: number[] = [
  15, // Aries (Mars)
  8, // Taurus (Venus)
  20, // Gemini (Mercury)
  25, // Cancer (Moon)
  19, // Leo (Sun)
  20, // Virgo (Mercury)
  8, // Libra (Venus)
  15, // Scorpio (Mars)
  12, // Sagittarius (Jupiter)
  27, // Capricorn (Saturn)
  30, // Aquarius (Saturn)
  12, // Pisces (Jupiter)
];

const SOLAR_YEAR_MS = 365.25 * 86400 * 1000;

/**
 * L1 (general) zodiacal-releasing periods from a lot's sign: successive
 * signs, each lasting its minor years, marching through life in order.
 */
export function zodiacalReleasingL1(
  lotLongitude: number,
  birthUtc: string,
  totalYears = 100
): ZRPeriod[] {
  const birthMs = new Date(birthUtc).getTime();
  if (Number.isNaN(birthMs)) throw new Error(`Invalid birth UTC: ${birthUtc}`);
  const startSign = Math.floor(norm360(lotLongitude) / 30) % 12;
  const out: ZRPeriod[] = [];
  let cursor = birthMs;
  let elapsed = 0;
  for (let k = 0; elapsed < totalYears; k++) {
    const sign = (startSign + k) % 12;
    const years = ZR_YEARS[sign];
    const end = cursor + years * SOLAR_YEAR_MS;
    out.push({
      level: 1,
      sign,
      ruler: SIGN_RULER[sign],
      start: new Date(cursor).toISOString(),
      end: new Date(end).toISOString(),
      years,
    });
    cursor = end;
    elapsed += years;
  }
  return out;
}

const SIGN_RULER: Body[] = [
  "mars", "venus", "mercury", "moon", "sun", "mercury",
  "venus", "mars", "jupiter", "saturn", "saturn", "jupiter",
];
