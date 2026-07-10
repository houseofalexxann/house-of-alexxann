import type { Body, NakshatraPosition, NavamsaPosition } from "./types";
import {
  DASHA_LORDS,
  NAKSHATRA_NAMES,
  NAKSHATRA_SPAN,
  NAVAMSA_SPAN,
} from "./constants";
import { norm360 } from "./ephemeris";

/** Nakshatra (and pada) for a sidereal longitude. */
export function nakshatraOf(siderealLongitude: number): NakshatraPosition {
  const lon = norm360(siderealLongitude);
  const index = Math.floor(lon / NAKSHATRA_SPAN) % 27;
  const within = lon - index * NAKSHATRA_SPAN;
  const pada = Math.floor(within / (NAKSHATRA_SPAN / 4)) + 1;
  return {
    index,
    name: NAKSHATRA_NAMES[index],
    pada,
    lord: DASHA_LORDS[index % 9],
  };
}

/**
 * D9 (navamsa) sign for a sidereal longitude.
 * Each sign splits into nine 3°20' parts; counting starts from the sign
 * itself (movable), the 9th (fixed) or the 5th (dual) — which reduces to
 * the classic `floor(longitude / 3°20') mod 12` formula.
 */
export function navamsaSign(siderealLongitude: number): number {
  return Math.floor(norm360(siderealLongitude) / NAVAMSA_SPAN) % 12;
}

export function navamsaPositions(
  planets: { body: Body; longitude: number }[],
  ascendant: number | null
): NavamsaPosition[] {
  const out: NavamsaPosition[] = planets.map((p) => ({
    body: p.body,
    sign: navamsaSign(p.longitude),
  }));
  if (ascendant !== null) {
    out.unshift({ body: "ascendant", sign: navamsaSign(ascendant) });
  }
  return out;
}
