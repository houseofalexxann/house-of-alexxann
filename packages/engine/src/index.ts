/**
 * House of Alexxann calculation engine.
 *
 * One isolated, deterministic API over the Swiss Ephemeris: every surface
 * (Chart Studio, admin, later phases) calls computeChart() and nothing else
 * computes chart math anywhere else.
 */
import type {
  Angles,
  ChartInput,
  ChartResult,
  HouseSystem,
  PlanetPosition,
} from "./types";
import {
  ayanamsaValue,
  bodyPosition,
  housesFor,
  norm360,
  swephVersion,
  utcToJulianDayUT,
} from "./ephemeris";
import { findAspects } from "./aspects";
import { navamsaPositions, nakshatraOf } from "./vedic";
import { vimshottariDasha } from "./dasha";
import {
  aspectsToAngles,
  dignities,
  dignityOf,
  moonPhase,
  sectOf,
} from "./traditional";
import {
  decanOf,
  egyptianTermOf,
  lots,
  zodiacalReleasingL1,
} from "./hellenistic";
import { formatDegreeInSign, signOf } from "./format";
import { VEDIC_BODIES, WESTERN_BODIES } from "./constants";

export * from "./types";
export {
  SIGN_NAMES,
  NAKSHATRA_NAMES,
  BODY_LABELS,
  DASHA_YEARS,
  DEFAULT_ORBS,
} from "./constants";
export { formatDegreeInSign, formatLongitude, signOf } from "./format";
export { nakshatraOf, navamsaSign } from "./vedic";
export { vimshottariDasha } from "./dasha";
export { separation } from "./aspects";
export { utcToJulianDayUT } from "./ephemeris";

const ENGINE_VERSION = "0.1.0";

function houseOf(longitude: number, cusps: number[]): number {
  for (let h = 0; h < 12; h++) {
    const span = norm360(cusps[(h + 1) % 12] - cusps[h]);
    const offset = norm360(longitude - cusps[h]);
    if (offset < span) return h + 1;
  }
  return 12; // numerically safe fallback (longitude exactly on a cusp)
}

export function computeChart(input: ChartInput): ChartResult {
  const system = input.system;
  const sidereal = system === "vedic";
  const houseSystem: HouseSystem =
    input.houseSystem ?? (sidereal ? "whole-sign" : "placidus");
  const ayanamsa = input.ayanamsa ?? "lahiri";
  const nodeType = input.nodeType ?? "true";
  const timeKnown = input.timeKnown ?? true;

  if (input.latitude < -90 || input.latitude > 90) {
    throw new Error(`Latitude out of range: ${input.latitude}`);
  }
  if (input.longitude < -180 || input.longitude > 180) {
    throw new Error(`Longitude out of range: ${input.longitude}`);
  }

  const jdUT = utcToJulianDayUT(input.utc);
  const opts = { sidereal, ayanamsa, nodeType };

  // Houses & angles (suppressed when birth time is unknown — PRD §11).
  let angles: Angles | null = null;
  let houseCusps: number[] | null = null;
  if (timeKnown) {
    const h = housesFor(jdUT, input.latitude, input.longitude, houseSystem, opts);
    houseCusps = h.cusps;
    const asc = signOf(h.ascendant);
    const mc = signOf(h.midheaven);
    angles = {
      ascendant: h.ascendant,
      midheaven: h.midheaven,
      ascendantSign: asc.sign,
      midheavenSign: mc.sign,
      formattedAscendant: formatDegreeInSign(asc.degreeInSign),
      formattedMidheaven: formatDegreeInSign(mc.degreeInSign),
      // Sidereal angles carry their lunar mansions too.
      ...(sidereal
        ? {
            ascendantNakshatra: nakshatraOf(h.ascendant),
            midheavenNakshatra: nakshatraOf(h.midheaven),
          }
        : {}),
    };
  }

  const bodies = sidereal ? VEDIC_BODIES : WESTERN_BODIES;
  const planets: PlanetPosition[] = bodies.map((body) => {
    const raw = bodyPosition(jdUT, body, opts);
    const { sign, degreeInSign } = signOf(raw.longitude);
    return {
      body,
      longitude: raw.longitude,
      latitude: raw.latitude,
      speed: raw.speed,
      retrograde: raw.speed < 0,
      sign,
      degreeInSign,
      formatted: formatDegreeInSign(degreeInSign),
      house: houseCusps ? houseOf(raw.longitude, houseCusps) : null,
      decan: decanOf(raw.longitude),
      term: egyptianTermOf(raw.longitude),
      ...(sidereal ? { nakshatra: nakshatraOf(raw.longitude) } : {}),
    };
  });

  const moon = planets.find((p) => p.body === "moon")!;
  const sun = planets.find((p) => p.body === "sun")!;

  return {
    input: {
      utc: input.utc,
      latitude: input.latitude,
      longitude: input.longitude,
      system,
      houseSystem,
      ayanamsa: sidereal ? ayanamsa : null,
      nodeType,
      timeKnown,
    },
    julianDayUT: jdUT,
    ayanamsaValue: sidereal ? ayanamsaValue(jdUT, ayanamsa) : null,
    planets,
    angles,
    houseCusps,
    aspects: findAspects(planets, input.orbs),
    vimshottari: sidereal ? vimshottariDasha(moon.longitude, input.utc) : null,
    navamsa: sidereal
      ? navamsaPositions(planets, angles ? angles.ascendant : null)
      : null,
    traditional: (() => {
      const sect = sectOf(planets);
      const theLots =
        angles && sect
          ? lots(angles.ascendant, sun.longitude, moon.longitude, sect.sect === "day")
          : null;
      return {
        sect,
        dignities: dignities(planets),
        moonPhase: moonPhase(sun.longitude, moon.longitude),
        angleAspects: aspectsToAngles(planets, angles, input.orbs),
        lots: theLots,
        zodiacalReleasing: theLots
          ? zodiacalReleasingL1(theLots.spirit, input.utc)
          : null,
      };
    })(),
    engineVersion: `${ENGINE_VERSION} (swisseph ${swephVersion()})`,
  };
}

/**
 * Solar return: the chart for the moment the Sun returns to its natal
 * longitude in a given year, cast for a chosen location. Uses the same
 * zodiac/settings as the natal request. Finds the return instant by
 * bisection on the Sun's longitude difference (deterministic, ~arc-second).
 */
export function computeSolarReturn(
  natal: ChartInput,
  year: number,
  location?: { latitude: number; longitude: number }
): ChartResult {
  const sidereal = natal.system === "vedic";
  const ayanamsa = natal.ayanamsa ?? "lahiri";
  const nodeType = natal.nodeType ?? "true";
  const natalSunLon = bodyPosition(
    utcToJulianDayUT(natal.utc),
    "sun",
    { sidereal, ayanamsa, nodeType }
  ).longitude;

  // Signed angular difference of the Sun from its natal longitude at time t.
  const diffAt = (iso: string): number => {
    const lon = bodyPosition(utcToJulianDayUT(iso), "sun", {
      sidereal,
      ayanamsa,
      nodeType,
    }).longitude;
    let d = (lon - natalSunLon) % 360;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
  };

  // The Sun returns near the natal birthday each year; bracket a ~6-day window.
  const birthday = new Date(natal.utc);
  const guess = new Date(Date.UTC(year, birthday.getUTCMonth(), birthday.getUTCDate(), 0, 0, 0));
  let lo = new Date(guess.getTime() - 6 * 86400000);
  let hi = new Date(guess.getTime() + 6 * 86400000);

  const iso = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");
  let dLo = diffAt(iso(lo));
  let dHi = diffAt(iso(hi));
  // Expand the bracket if the sign didn't change (rare edge near 0/360 wrap).
  let expand = 0;
  while (Math.sign(dLo) === Math.sign(dHi) && expand < 4) {
    hi = new Date(hi.getTime() + 6 * 86400000);
    dHi = diffAt(iso(hi));
    expand++;
  }
  for (let i = 0; i < 60; i++) {
    const midMs = (lo.getTime() + hi.getTime()) / 2;
    const mid = new Date(midMs);
    const dMid = diffAt(iso(mid));
    if (Math.sign(dMid) === Math.sign(dLo)) {
      lo = mid;
      dLo = dMid;
    } else {
      hi = mid;
      dHi = dMid;
    }
    if (hi.getTime() - lo.getTime() < 1000) break; // sub-second precision
  }
  const returnUtc = iso(new Date((lo.getTime() + hi.getTime()) / 2));

  return computeChart({
    ...natal,
    utc: returnUtc,
    latitude: location?.latitude ?? natal.latitude,
    longitude: location?.longitude ?? natal.longitude,
  });
}

export { dignityOf, moonPhase } from "./traditional";
export {
  decanOf,
  egyptianTermOf,
  egyptianTermsTable,
  lots,
  zodiacalReleasingL1,
  ZR_YEARS,
} from "./hellenistic";
export * from "./humandesign";
