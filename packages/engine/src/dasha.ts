import type { Body, DashaPeriod, VimshottariDasha } from "./types";
import {
  DASHA_LORDS,
  DASHA_YEARS,
  DASHA_YEAR_DAYS,
  NAKSHATRA_SPAN,
} from "./constants";
import { nakshatraOf } from "./vedic";

const MS_PER_DASHA_YEAR = DASHA_YEAR_DAYS * 86400 * 1000;
const FULL_CYCLE_YEARS = 120;

/**
 * Vimshottari mahadasha/antardasha timeline.
 *
 * The Moon's sidereal position at birth determines the running mahadasha:
 * the nakshatra lord rules it, and the fraction of the nakshatra already
 * traversed is the fraction of that mahadasha already elapsed.
 *
 * @param moonSiderealLongitude Moon's sidereal longitude at birth.
 * @param birthUtc Birth instant (ISO UTC).
 * @param cycles How many 120-year cycles to emit (default 1).
 */
export function vimshottariDasha(
  moonSiderealLongitude: number,
  birthUtc: string,
  cycles = 1
): VimshottariDasha {
  const birthMs = new Date(birthUtc).getTime();
  if (Number.isNaN(birthMs)) throw new Error(`Invalid birth UTC: ${birthUtc}`);

  const nak = nakshatraOf(moonSiderealLongitude);
  const withinNakshatra =
    (moonSiderealLongitude % NAKSHATRA_SPAN + NAKSHATRA_SPAN) % NAKSHATRA_SPAN;
  const elapsedFraction = withinNakshatra / NAKSHATRA_SPAN;

  const firstLordIndex = nak.index % 9;
  const firstLord = DASHA_LORDS[firstLordIndex];
  const firstYears = DASHA_YEARS[firstLord];

  // Theoretical start of the first mahadasha (before birth).
  const firstStartMs =
    birthMs - elapsedFraction * firstYears * MS_PER_DASHA_YEAR;

  const mahadashas: DashaPeriod[] = [];
  let cursorMs = firstStartMs;
  const totalMahas = 9 * cycles;
  for (let k = 0; k < totalMahas; k++) {
    const lord = DASHA_LORDS[(firstLordIndex + k) % 9];
    const years = DASHA_YEARS[lord];
    const endMs = cursorMs + years * MS_PER_DASHA_YEAR;
    // Clip the first mahadasha's visible start to the birth instant.
    const visibleStartMs = k === 0 ? birthMs : cursorMs;
    mahadashas.push({
      lord,
      start: new Date(visibleStartMs).toISOString(),
      end: new Date(endMs).toISOString(),
      sub: antardashas(lord, cursorMs, birthMs),
    });
    cursorMs = endMs;
  }

  return {
    moonNakshatra: nak,
    balanceOfFirst: 1 - elapsedFraction,
    mahadashas,
  };
}

/**
 * Antardashas of one mahadasha. Sub-periods follow the lord order starting
 * from the mahadasha lord; each lasts mahaYears * subYears / 120.
 * Sub-periods that end before birth are dropped; one straddling birth is
 * clipped to start at birth.
 */
function antardashas(
  mahaLord: Body,
  mahaStartMs: number,
  birthMs: number
): DashaPeriod[] {
  const mahaYears = DASHA_YEARS[mahaLord];
  const startIndex = DASHA_LORDS.indexOf(mahaLord);
  const subs: DashaPeriod[] = [];
  let cursor = mahaStartMs;
  for (let i = 0; i < 9; i++) {
    const lord = DASHA_LORDS[(startIndex + i) % 9];
    const years = (mahaYears * DASHA_YEARS[lord]) / FULL_CYCLE_YEARS;
    const endMs = cursor + years * MS_PER_DASHA_YEAR;
    if (endMs > birthMs) {
      subs.push({
        lord,
        start: new Date(Math.max(cursor, birthMs)).toISOString(),
        end: new Date(endMs).toISOString(),
      });
    }
    cursor = endMs;
  }
  return subs;
}
