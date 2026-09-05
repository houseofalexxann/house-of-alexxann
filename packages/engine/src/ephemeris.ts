/**
 * Thin wrapper around the Swiss Ephemeris (sweph) native binding.
 * Everything else in the engine goes through this module, so the
 * underlying library can be swapped or mocked in one place.
 */
import * as fs from "fs";
import * as path from "path";
import sweph from "sweph";
import type { Ayanamsa, Body, ExtraBody, HouseSystem, NodeType } from "./types";
import { AYANAMSA_IDS, HOUSE_SYSTEM_CODES } from "./constants";

const C = sweph.constants;

let epheInitialized = false;
let epheDir: string | null = null;

/**
 * Where the bundled Swiss Ephemeris data files (1800–2400 AD: sepl, semo,
 * seas) actually live. When the engine is bundled by Next.js, `__dirname`
 * becomes a virtual path and the files are not there, so the planets quietly
 * fall back to the Moshier ephemeris and the asteroids fail outright. This
 * looks in every place the files can be, in order, and keeps the first one
 * that holds the asteroid file.
 */
export function resolveEpheDir(): string | null {
  if (epheDir) return epheDir;
  const cwd = process.cwd();
  const candidates = [
    process.env.HOA_EPHE_PATH,
    path.join(__dirname, "..", "ephe"),
    path.join(cwd, "node_modules", "@hoa", "engine", "ephe"),
    path.join(cwd, "..", "..", "packages", "engine", "ephe"),
    path.join(cwd, "packages", "engine", "ephe"),
    path.join(cwd, "..", "..", "node_modules", "@hoa", "engine", "ephe"),
  ].filter((p): p is string => Boolean(p));
  for (const dir of candidates) {
    try {
      if (fs.existsSync(path.join(dir, "seas_18.se1"))) {
        epheDir = dir;
        return dir;
      }
    } catch {
      // keep looking
    }
  }
  return null;
}

function ensureEphe(): void {
  if (!epheInitialized) {
    const dir = resolveEpheDir();
    if (dir) {
      sweph.set_ephe_path(dir);
    } else {
      // Planets still compute (Moshier fallback); asteroids will report clearly.
      console.warn("[hoa-engine] Swiss Ephemeris data files not found; using the built-in Moshier ephemeris.");
    }
    epheInitialized = true;
  }
}

const BODY_IDS: Record<Exclude<Body, "rahu" | "ketu">, number> = {
  sun: C.SE_SUN,
  moon: C.SE_MOON,
  mercury: C.SE_MERCURY,
  venus: C.SE_VENUS,
  mars: C.SE_MARS,
  jupiter: C.SE_JUPITER,
  saturn: C.SE_SATURN,
  uranus: C.SE_URANUS,
  neptune: C.SE_NEPTUNE,
  pluto: C.SE_PLUTO,
};

export function swephVersion(): string {
  return sweph.version();
}

/** Convert a UTC ISO-8601 instant to Julian Day (UT). */
export function utcToJulianDayUT(utcIso: string): number {
  const d = new Date(utcIso);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid UTC datetime: ${utcIso}`);
  }
  const res = sweph.utc_to_jd(
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
    d.getUTCSeconds() + d.getUTCMilliseconds() / 1000,
    C.SE_GREG_CAL
  );
  if (res.flag < 0) throw new Error(`utc_to_jd failed: ${res.error}`);
  return res.data[1]; // [jd_et, jd_ut]
}

export interface RawPosition {
  longitude: number;
  latitude: number;
  speed: number;
}

function calcFlags(sidereal: boolean): number {
  let flags = C.SEFLG_SWIEPH | C.SEFLG_SPEED;
  if (sidereal) flags |= C.SEFLG_SIDEREAL;
  return flags;
}

function setSiderealMode(ayanamsa: Ayanamsa): void {
  sweph.set_sid_mode(AYANAMSA_IDS[ayanamsa], 0, 0);
}

/**
 * Compute ecliptic position of one body.
 * Rahu is the lunar node (true or mean); Ketu is Rahu + 180°.
 */
export function bodyPosition(
  jdUT: number,
  body: Body,
  opts: { sidereal: boolean; ayanamsa: Ayanamsa; nodeType: NodeType }
): RawPosition {
  ensureEphe();
  if (opts.sidereal) setSiderealMode(opts.ayanamsa);

  if (body === "ketu") {
    const rahu = bodyPosition(jdUT, "rahu", opts);
    return { ...rahu, longitude: norm360(rahu.longitude + 180) };
  }

  const id =
    body === "rahu"
      ? opts.nodeType === "mean"
        ? C.SE_MEAN_NODE
        : C.SE_TRUE_NODE
      : BODY_IDS[body];

  const res = sweph.calc_ut(jdUT, id, calcFlags(opts.sidereal));
  if (res.flag < 0) throw new Error(`calc_ut(${body}) failed: ${res.error}`);
  return {
    longitude: norm360(res.data[0]),
    latitude: res.data[1],
    speed: res.data[3],
  };
}

/**
 * Asteroids and points. Chiron, Ceres, Pallas, Juno and Vesta come from the
 * bundled asteroid ephemeris (seas_18.se1); Lilith is the mean lunar apogee,
 * which needs no file.
 */
const EXTRA_IDS: Record<ExtraBody, number> = {
  chiron: C.SE_CHIRON,
  ceres: C.SE_CERES,
  pallas: C.SE_PALLAS,
  juno: C.SE_JUNO,
  vesta: C.SE_VESTA,
  lilith: C.SE_MEAN_APOG,
};

export function extraPosition(
  jdUT: number,
  body: ExtraBody,
  opts: { sidereal: boolean; ayanamsa: Ayanamsa }
): RawPosition {
  ensureEphe();
  if (opts.sidereal) setSiderealMode(opts.ayanamsa);
  const res = sweph.calc_ut(jdUT, EXTRA_IDS[body], calcFlags(opts.sidereal));
  if (res.flag < 0) {
    throw new Error(
      resolveEpheDir()
        ? `calc_ut(${body}) failed: ${res.error}`
        : `The asteroid ephemeris files are not available on this server, so ${body} cannot be computed.`
    );
  }
  return {
    longitude: norm360(res.data[0]),
    latitude: res.data[1],
    speed: res.data[3],
  };
}

export interface RawHouses {
  cusps: number[]; // 12 entries, index 0 = house 1
  ascendant: number;
  midheaven: number;
}

export function housesFor(
  jdUT: number,
  latitude: number,
  longitude: number,
  houseSystem: HouseSystem,
  opts: { sidereal: boolean; ayanamsa: Ayanamsa }
): RawHouses {
  ensureEphe();
  if (opts.sidereal) setSiderealMode(opts.ayanamsa);
  const flags = opts.sidereal ? C.SEFLG_SIDEREAL : 0;
  const res = sweph.houses_ex(
    jdUT,
    flags,
    latitude,
    longitude,
    HOUSE_SYSTEM_CODES[houseSystem]
  );
  if (res.flag < 0) throw new Error(`houses_ex failed`);
  const cusps = res.data.houses.slice(0, 12).map(norm360);
  return {
    cusps,
    ascendant: norm360(res.data.points[0]),
    midheaven: norm360(res.data.points[1]),
  };
}

/** Ayanamsa value in degrees at the given instant. */
export function ayanamsaValue(jdUT: number, ayanamsa: Ayanamsa): number {
  ensureEphe();
  setSiderealMode(ayanamsa);
  const res = sweph.get_ayanamsa_ex_ut(jdUT, C.SEFLG_SWIEPH);
  if (res.flag < 0) throw new Error(`get_ayanamsa failed: ${res.error}`);
  return res.data;
}

export function norm360(x: number): number {
  const r = x % 360;
  return r < 0 ? r + 360 : r;
}

/* ————— Eclipses: computed by the Swiss Ephemeris itself, never estimated ————— */

export type SolarEclipseType = "total" | "annular" | "partial" | "hybrid";
export type LunarEclipseType = "total" | "partial" | "penumbral";

export interface EclipseMoment {
  /** Julian Day (UT) of maximum eclipse. */
  jdMax: number;
  /** ISO UTC instant of maximum eclipse, to the minute. */
  utc: string;
  kind: "solar" | "lunar";
  type: SolarEclipseType | LunarEclipseType;
}

function jdToIso(jd: number): string {
  const r = sweph.revjul(jd, C.SE_GREG_CAL);
  const hours = Math.floor(r.hour);
  const minutes = Math.round((r.hour - hours) * 60);
  const d = new Date(Date.UTC(r.year, r.month - 1, r.day, hours, minutes));
  return d.toISOString().replace(/\.\d{3}Z$/, "Z");
}

function solarTypeOf(flag: number): SolarEclipseType {
  if (flag & C.SE_ECL_HYBRID) return "hybrid";
  if (flag & C.SE_ECL_TOTAL) return "total";
  if (flag & C.SE_ECL_ANNULAR_TOTAL) return "hybrid";
  if (flag & C.SE_ECL_ANNULAR) return "annular";
  return "partial";
}

function lunarTypeOf(flag: number): LunarEclipseType {
  if (flag & C.SE_ECL_TOTAL) return "total";
  if (flag & C.SE_ECL_PARTIAL) return "partial";
  return "penumbral";
}

/**
 * Every solar and lunar eclipse between two instants (max-eclipse moments),
 * found by walking the Swiss Ephemeris eclipse search forward.
 */
export function eclipsesBetween(fromUtcIso: string, toUtcIso: string): EclipseMoment[] {
  ensureEphe();
  const jdFrom = utcToJulianDayUT(fromUtcIso);
  const jdTo = utcToJulianDayUT(toUtcIso);
  const out: EclipseMoment[] = [];

  let cursor = jdFrom;
  for (let i = 0; i < 40 && cursor < jdTo; i++) {
    const res = sweph.sol_eclipse_when_glob(cursor, C.SEFLG_SWIEPH, 0, false);
    const jdMax = res.data[0];
    if (jdMax > jdTo) break;
    if (jdMax >= jdFrom) {
      out.push({ jdMax, utc: jdToIso(jdMax), kind: "solar", type: solarTypeOf(res.flag) });
    }
    cursor = jdMax + 1; // step past this eclipse
  }

  cursor = jdFrom;
  for (let i = 0; i < 40 && cursor < jdTo; i++) {
    const res = sweph.lun_eclipse_when(cursor, C.SEFLG_SWIEPH, 0, false);
    const jdMax = res.data[0];
    if (jdMax > jdTo) break;
    if (jdMax >= jdFrom) {
      out.push({ jdMax, utc: jdToIso(jdMax), kind: "lunar", type: lunarTypeOf(res.flag) });
    }
    cursor = jdMax + 1;
  }

  return out.sort((a, b) => a.jdMax - b.jdMax);
}
