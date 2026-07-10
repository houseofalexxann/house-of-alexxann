/**
 * Thin wrapper around the Swiss Ephemeris (sweph) native binding.
 * Everything else in the engine goes through this module, so the
 * underlying library can be swapped or mocked in one place.
 */
import * as path from "path";
import sweph from "sweph";
import type { Ayanamsa, Body, HouseSystem, NodeType } from "./types";
import { AYANAMSA_IDS, HOUSE_SYSTEM_CODES } from "./constants";

const C = sweph.constants;

let epheInitialized = false;
function ensureEphe(): void {
  if (!epheInitialized) {
    // Bundled Swiss Ephemeris data files (1800–2400 AD): sepl/semo/seas.
    sweph.set_ephe_path(path.join(__dirname, "..", "ephe"));
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
