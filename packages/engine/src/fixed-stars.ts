/**
 * Fixed stars, computed from catalogued J2000.0 coordinates rather than from
 * the Swiss Ephemeris star file (which the House does not bundle).
 *
 * Method: the J2000 equatorial position is rotated into the J2000 ecliptic
 * with the fixed obliquity of that epoch, then the general precession in
 * longitude (IAU 1976 polynomial) carries it to the date of the chart.
 * Proper motion, nutation and aberration are ignored; over a few centuries
 * the error stays inside a few arcminutes, far tighter than the one-degree
 * orb the tradition uses for stars.
 */
import type {
  Body,
  ExtraBody,
  FixedStar,
  FixedStarPosition,
  StarConjunction,
} from "./types";
import { formatDegreeInSign, signOf } from "./format";
import { separation } from "./aspects";
import { FIXED_STAR_CATALOGUE } from "./fixed-star-catalogue";

const J2000 = 2451545.0;
/** Mean obliquity of the ecliptic at J2000.0, degrees (IAU). */
const OBLIQUITY_J2000 = 23.4392911;

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
const norm = (d: number) => ((d % 360) + 360) % 360;

export const FIXED_STARS: FixedStar[] = FIXED_STAR_CATALOGUE;

/** J2000 equatorial (degrees) → J2000 ecliptic longitude and latitude (degrees). */
export function equatorialToEcliptic(raDeg: number, decDeg: number): { lon: number; lat: number } {
  const e = rad(OBLIQUITY_J2000);
  const a = rad(raDeg);
  const d = rad(decDeg);
  const lon = Math.atan2(Math.sin(a) * Math.cos(e) + Math.tan(d) * Math.sin(e), Math.cos(a));
  const lat = Math.asin(Math.sin(d) * Math.cos(e) - Math.cos(d) * Math.sin(e) * Math.sin(a));
  return { lon: norm(deg(lon)), lat: deg(lat) };
}

/** Accumulated general precession in longitude from J2000 to jdUT, degrees. */
export function precessionInLongitude(jdUT: number): number {
  const T = (jdUT - J2000) / 36525;
  return (5029.0966 * T + 1.11113 * T * T - 0.000006 * T * T * T) / 3600;
}

/** Tropical positions of the catalogue's stars at the given instant. */
export function fixedStarPositions(
  jdUT: number,
  catalogue: FixedStar[] = FIXED_STARS
): FixedStarPosition[] {
  const p = precessionInLongitude(jdUT);
  return catalogue.map((s) => {
    const e = equatorialToEcliptic(s.raDeg, s.decDeg);
    const longitude = norm(e.lon + p);
    const { sign, degreeInSign } = signOf(longitude);
    return {
      ...s,
      longitude,
      eclipticLatitude: e.lat,
      sign,
      degreeInSign,
      formatted: formatDegreeInSign(degreeInSign),
    };
  });
}

export interface StarPointRef {
  point: Body | ExtraBody | "ascendant" | "midheaven";
  longitude: number;
}

/**
 * Stars conjunct chart points by longitude, within the orb (default 1°,
 * the customary tight orb for fixed stars). Tightest first.
 */
export function starConjunctions(
  stars: FixedStarPosition[],
  points: StarPointRef[],
  orb = 1
): StarConjunction[] {
  const out: StarConjunction[] = [];
  for (const s of stars) {
    for (const p of points) {
      const sep = separation(s.longitude, p.longitude);
      if (sep <= orb) {
        out.push({ star: s.name, point: p.point, orb: sep, starLongitude: s.longitude });
      }
    }
  }
  return out.sort((a, b) => a.orb - b.orb);
}
