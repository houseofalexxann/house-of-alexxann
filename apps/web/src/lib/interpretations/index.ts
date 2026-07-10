/**
 * Assembles the authored interpretation modules into lookup functions used
 * by the Chart Studio. Content lives in the sibling files; this module only
 * routes.
 */
import type { Interpretation, InterpBody } from "./types";
import {
  SUN_IN_SIGN, MOON_IN_SIGN, MERCURY_IN_SIGN, VENUS_IN_SIGN, MARS_IN_SIGN,
} from "./signs-personal";
import {
  JUPITER_IN_SIGN, SATURN_IN_SIGN, URANUS_IN_SIGN, NEPTUNE_IN_SIGN, PLUTO_IN_SIGN,
} from "./signs-outer";
import {
  SUN_IN_HOUSE, MOON_IN_HOUSE, MERCURY_IN_HOUSE, VENUS_IN_HOUSE, MARS_IN_HOUSE,
} from "./houses-personal";
import {
  JUPITER_IN_HOUSE, SATURN_IN_HOUSE, URANUS_IN_HOUSE, NEPTUNE_IN_HOUSE, PLUTO_IN_HOUSE,
} from "./houses-outer";
import { ASPECTS as HARD_ASPECTS } from "./aspects-hard";
import { ASPECTS as SOFT_ASPECTS } from "./aspects-soft";
import { RISING_SIGN, MOON_NAKSHATRA, DASHA_LORD } from "./vedic";

export type { Interpretation, InterpBody } from "./types";

const IN_SIGN: Record<InterpBody, Interpretation[]> = {
  sun: SUN_IN_SIGN, moon: MOON_IN_SIGN, mercury: MERCURY_IN_SIGN,
  venus: VENUS_IN_SIGN, mars: MARS_IN_SIGN, jupiter: JUPITER_IN_SIGN,
  saturn: SATURN_IN_SIGN, uranus: URANUS_IN_SIGN, neptune: NEPTUNE_IN_SIGN,
  pluto: PLUTO_IN_SIGN,
};

const IN_HOUSE: Record<InterpBody, Interpretation[]> = {
  sun: SUN_IN_HOUSE, moon: MOON_IN_HOUSE, mercury: MERCURY_IN_HOUSE,
  venus: VENUS_IN_HOUSE, mars: MARS_IN_HOUSE, jupiter: JUPITER_IN_HOUSE,
  saturn: SATURN_IN_HOUSE, uranus: URANUS_IN_HOUSE, neptune: NEPTUNE_IN_HOUSE,
  pluto: PLUTO_IN_HOUSE,
};

const ALL_ASPECTS: Record<string, Interpretation> = {
  ...HARD_ASPECTS,
  ...SOFT_ASPECTS,
};

const INTERP_BODIES = new Set<string>([
  "sun", "moon", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
]);

export function isInterpBody(body: string): body is InterpBody {
  return INTERP_BODIES.has(body);
}

export function planetInSign(body: string, sign: number): Interpretation | null {
  if (!isInterpBody(body)) return null;
  return IN_SIGN[body][sign] ?? null;
}

export function planetInHouse(body: string, house: number): Interpretation | null {
  if (!isInterpBody(body) || house < 1 || house > 12) return null;
  return IN_HOUSE[body][house - 1] ?? null;
}

export function aspectInterp(a: string, b: string, type: string): Interpretation | null {
  return ALL_ASPECTS[`${a}-${b}-${type}`] ?? ALL_ASPECTS[`${b}-${a}-${type}`] ?? null;
}

export function risingSign(sign: number): Interpretation | null {
  return RISING_SIGN[sign] ?? null;
}

export function moonNakshatra(index: number): Interpretation | null {
  return MOON_NAKSHATRA[index] ?? null;
}

export function dashaLord(lord: string): Interpretation | null {
  return DASHA_LORD[lord] ?? null;
}
