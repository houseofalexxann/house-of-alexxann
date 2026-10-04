/**
 * Astro weather: the sky at a moment, or across a run of days, reduced to
 * the shape a forecast needs.
 *
 * "Weather" here means the configuration of the sky and nothing more: which
 * planets are in exact or near-exact aspect, how much of that is tension and
 * how much is ease, what the Moon is doing. The classification into
 * conditions (still, clear, tender, shifting, charged, turbulent) is a
 * deterministic reading of Ptolemy's doctrine of configurations (squares and
 * oppositions as tension, trines and sextiles as ease, conjunctions taking
 * the nature of the planets joined). It describes the sky. It never predicts
 * an outcome, and the web layer that puts words on it is written the same way.
 *
 * Nothing interpretive lives in this file: it returns structure. Prose, with
 * its provenance, belongs to apps/web/src/lib/weather-meanings.ts.
 */
import type { Aspect, AspectType, Body, MoonPhase, PlanetPosition } from "./types";
import { bodyPosition, utcToJulianDayUT } from "./ephemeris";
import { findAspects } from "./aspects";
import { moonPhase } from "./traditional";
import { SIGN_NAMES } from "./constants";

export type WeatherConditions =
  | "still"
  | "clear"
  | "tender"
  | "shifting"
  | "charged"
  | "turbulent";

export const WEATHER_CONDITIONS: readonly WeatherConditions[] = [
  "still", "clear", "tender", "shifting", "charged", "turbulent",
] as const;

/** The planets a forecast watches. Nodes are left out: they move backwards
 *  on rails and would read as permanent weather. */
export const WEATHER_BODIES: readonly Body[] = [
  "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto",
] as const;

/** Tight orbs: a forecast is about what is happening, not what is nearby.
 *  The Moon gets a wider orb because it covers these degrees in hours. */
export const WEATHER_ORBS: Record<AspectType, number> = {
  conjunction: 3,
  opposition: 3,
  square: 2.5,
  trine: 2.5,
  sextile: 2,
};
export const MOON_ORB_BONUS = 2;

export interface WeatherAspect extends Aspect {
  /** How much this contact contributes to the day: planet weight × tightness. */
  weight: number;
  /** Which way it pulls the day. */
  nature: "tension" | "ease";
}

export interface WeatherPlanet {
  body: Body;
  longitude: number;
  sign: number;
  signName: string;
  degreeInSign: number;
  speed: number;
  retrograde: boolean;
}

export interface WeatherMoon extends MoonPhase {
  sign: number;
  signName: string;
  degreeInSign: number;
}

export interface WeatherHighlight {
  kind: "lunation" | "ingress" | "station" | "exact";
  body: Body;
  /** Set for lunations. */
  phase?: "new moon" | "full moon";
  /** Set for ingresses: the sign entered. */
  sign?: number;
  signName?: string;
  /** Set for stations: the state turned into. */
  station?: "retrograde" | "direct";
  /** Set for exact aspects (orb under one degree). */
  with?: Body;
  aspect?: AspectType;
}

export interface SkyWeather {
  /** The moment this reading describes, UTC ISO to the minute. */
  utc: string;
  moon: WeatherMoon;
  planets: WeatherPlanet[];
  /** Contacts in orb, heaviest first. */
  aspects: WeatherAspect[];
  retrogrades: Body[];
  /** 0..1: how much of the day's weight is tension. */
  charge: number;
  /** 0..1: how much is ease. */
  ease: number;
  /** 0..1: how busy the sky is at all. */
  activity: number;
  conditions: WeatherConditions;
}

export interface SkyWeatherDay extends SkyWeather {
  /** Calendar date (UTC) the reading stands for. */
  date: string;
  /** What changed since the day before, and what is exact today. */
  highlights: WeatherHighlight[];
}

const DAY_MS = 86_400_000;

/** Planet weight: how much a contact with this body colours a day. The Moon
 *  is the day's texture rather than its headline; the slow planets, when
 *  they are exact at all, are the headline. */
const PLANET_WEIGHT: Record<Body, number> = {
  sun: 1,
  moon: 0.6,
  mercury: 0.9,
  venus: 0.9,
  mars: 1,
  jupiter: 1.1,
  saturn: 1.2,
  uranus: 1.3,
  neptune: 1.2,
  pluto: 1.3,
  rahu: 0,
  ketu: 0,
};

const BENEFIC: readonly Body[] = ["venus", "jupiter"];
const MALEFIC: readonly Body[] = ["mars", "saturn", "uranus", "pluto"];

function isoMinute(ms: number): string {
  return new Date(Math.round(ms / 60_000) * 60_000).toISOString().replace(/\.\d{3}Z$/, "Z");
}

function positionsAt(utc: string): PlanetPosition[] {
  const jd = utcToJulianDayUT(utc);
  return WEATHER_BODIES.map((body) => {
    const raw = bodyPosition(jd, body, { sidereal: false, ayanamsa: "lahiri", nodeType: "true" });
    const sign = Math.floor(raw.longitude / 30) % 12;
    const degreeInSign = raw.longitude - sign * 30;
    const d = Math.floor(degreeInSign);
    const m = Math.floor((degreeInSign - d) * 60);
    return {
      body,
      longitude: raw.longitude,
      latitude: raw.latitude,
      speed: raw.speed,
      retrograde: raw.speed < 0,
      sign,
      degreeInSign,
      formatted: `${d}°${String(m).padStart(2, "0")}'`,
      house: null,
    };
  });
}

/** Conjunctions take the nature of the planets joined: two benefics or a
 *  benefic with a light are ease; a malefic in the pair is tension; anything
 *  else is a neutral union that counts toward activity but pulls neither way. */
function natureOf(a: Body, b: Body, type: AspectType): "tension" | "ease" | "neutral" {
  if (type === "square" || type === "opposition") return "tension";
  if (type === "trine" || type === "sextile") return "ease";
  const malefic = MALEFIC.includes(a) || MALEFIC.includes(b);
  const benefic = BENEFIC.includes(a) || BENEFIC.includes(b);
  if (malefic && !benefic) return "tension";
  if (benefic && !malefic) return "ease";
  return "neutral";
}

/** Tightness: 1 at exact, falling linearly to 0 at the edge of orb. */
function tightness(orb: number, maxOrb: number): number {
  return Math.max(0, 1 - orb / maxOrb);
}

export interface WeatherScore {
  tension: number;
  ease: number;
  /** True when the Moon is in soft contact with Venus or Neptune. */
  moonSoft: boolean;
}

/**
 * The deterministic classification. Exported so it can be tested without an
 * ephemeris: feed it totals, get a condition.
 */
export function classifyWeather(score: WeatherScore): {
  conditions: WeatherConditions;
  charge: number;
  ease: number;
  activity: number;
} {
  const total = score.tension + score.ease;
  // Saturating: three units of exact contact reads as a full day.
  const activity = 1 - Math.exp(-total / 2.2);
  const charge = total > 0 ? score.tension / total : 0;
  const ease = total > 0 ? score.ease / total : 0;

  let conditions: WeatherConditions;
  if (activity < 0.3) conditions = "still";
  else if (charge >= 0.62 && activity >= 0.7) conditions = "turbulent";
  else if (charge >= 0.55) conditions = "charged";
  else if (ease >= 0.6) conditions = score.moonSoft && activity < 0.7 ? "tender" : "clear";
  else conditions = "shifting";

  return { conditions, charge, ease, activity };
}

/** The sky's weather at one moment. */
export function skyWeatherAt(utc: string): SkyWeather {
  const planets = positionsAt(utc);
  const sun = planets.find((p) => p.body === "sun")!;
  const moon = planets.find((p) => p.body === "moon")!;

  // Everyone but the Moon at the tight orbs; the Moon with its bonus.
  const base = findAspects(planets.filter((p) => p.body !== "moon"), WEATHER_ORBS);
  const moonOrbs = Object.fromEntries(
    Object.entries(WEATHER_ORBS).map(([k, v]) => [k, v + MOON_ORB_BONUS])
  ) as Record<AspectType, number>;
  const lunar = findAspects(planets, moonOrbs).filter((a) => a.a === "moon" || a.b === "moon");

  let tension = 0;
  let ease = 0;
  let moonSoft = false;
  const aspects: WeatherAspect[] = [];
  for (const a of [...base, ...lunar]) {
    const nature = natureOf(a.a, a.b, a.type);
    const isLunar = a.a === "moon" || a.b === "moon";
    const maxOrb = isLunar ? moonOrbs[a.type] : WEATHER_ORBS[a.type];
    const weight =
      Math.min(PLANET_WEIGHT[a.a], PLANET_WEIGHT[a.b]) *
      Math.max(PLANET_WEIGHT[a.a], PLANET_WEIGHT[a.b]) *
      tightness(a.orb, maxOrb);
    if (nature === "tension") tension += weight;
    else if (nature === "ease") ease += weight;
    else {
      // A neutral union still fills the sky; split it so it counts as activity
      // without tipping the reading either way.
      tension += weight / 2;
      ease += weight / 2;
    }
    if (isLunar && nature === "ease") {
      const other = a.a === "moon" ? a.b : a.a;
      if (other === "venus" || other === "neptune") moonSoft = true;
    }
    aspects.push({ ...a, weight, nature: nature === "neutral" ? "ease" : nature });
  }
  aspects.sort((x, y) => y.weight - x.weight);

  const phase = moonPhase(sun.longitude, moon.longitude);
  const score = classifyWeather({ tension, ease, moonSoft });

  return {
    utc: isoMinute(new Date(utc).getTime()),
    moon: {
      ...phase,
      sign: moon.sign,
      signName: SIGN_NAMES[moon.sign],
      degreeInSign: moon.degreeInSign,
    },
    planets: planets.map((p) => ({
      body: p.body,
      longitude: p.longitude,
      sign: p.sign,
      signName: SIGN_NAMES[p.sign],
      degreeInSign: p.degreeInSign,
      speed: p.speed,
      retrograde: p.retrograde,
    })),
    aspects,
    retrogrades: planets.filter((p) => p.retrograde && p.body !== "moon" && p.body !== "sun").map((p) => p.body),
    charge: score.charge,
    ease: score.ease,
    activity: score.activity,
    conditions: score.conditions,
  };
}

/**
 * A run of days, each read at noon UTC, with the changes since the previous
 * day: sign ingresses, stations, lunations, and aspects exact to the degree.
 */
export function weekWeather(startUtc: string, days = 7): SkyWeatherDay[] {
  const startMs = new Date(startUtc).getTime();
  const noonOf = (ms: number) => {
    const d = new Date(ms);
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0);
  };

  const out: SkyWeatherDay[] = [];
  let prev = skyWeatherAt(isoMinute(noonOf(startMs - DAY_MS)));

  for (let i = 0; i < days; i++) {
    const noon = noonOf(startMs + i * DAY_MS);
    const day = skyWeatherAt(isoMinute(noon));
    const highlights: WeatherHighlight[] = [];

    for (const p of day.planets) {
      if (p.body === "moon") continue;
      const was = prev.planets.find((q) => q.body === p.body)!;
      if (was.sign !== p.sign) {
        highlights.push({ kind: "ingress", body: p.body, sign: p.sign, signName: p.signName });
      }
      if (was.retrograde !== p.retrograde) {
        highlights.push({ kind: "station", body: p.body, station: p.retrograde ? "retrograde" : "direct" });
      }
    }

    if (day.moon.phase === "New Moon" || day.moon.phase === "Full Moon") {
      highlights.unshift({
        kind: "lunation",
        body: "moon",
        phase: day.moon.phase === "New Moon" ? "new moon" : "full moon",
        sign: day.moon.sign,
        signName: day.moon.signName,
      });
    }

    for (const a of day.aspects) {
      if (a.orb < 1 && a.a !== "moon" && a.b !== "moon") {
        highlights.push({ kind: "exact", body: a.a, with: a.b, aspect: a.type });
      }
    }

    out.push({
      ...day,
      date: new Date(noon).toISOString().slice(0, 10),
      highlights,
    });
    prev = day;
  }
  return out;
}
