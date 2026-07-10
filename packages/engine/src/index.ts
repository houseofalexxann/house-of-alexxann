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
      ...(sidereal ? { nakshatra: nakshatraOf(raw.longitude) } : {}),
    };
  });

  const moon = planets.find((p) => p.body === "moon")!;

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
    engineVersion: `${ENGINE_VERSION} (swisseph ${swephVersion()})`,
  };
}
