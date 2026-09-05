/**
 * A transit snapshot: the sky at one moment laid over a natal chart. The
 * aspects here are between a transiting planet and a natal point, with the
 * tighter orbs transits are customarily read with.
 */
import type { AspectType, Body, PlanetPosition, TransitAspect } from "./types";
import { ASPECT_ANGLES } from "./constants";
import { separation } from "./aspects";

export const TRANSIT_ORBS: Record<AspectType, number> = {
  conjunction: 3,
  opposition: 3,
  square: 2.5,
  trine: 2.5,
  sextile: 2,
};

export interface NatalPointRef {
  point: Body | "ascendant" | "midheaven";
  longitude: number;
}

function norm180(x: number): number {
  let r = x % 360;
  if (r > 180) r -= 360;
  if (r < -180) r += 360;
  return r;
}

export function transitAspects(
  transiting: PlanetPosition[],
  natal: NatalPointRef[],
  orbs: Record<AspectType, number> = TRANSIT_ORBS
): TransitAspect[] {
  const out: TransitAspect[] = [];
  for (const t of transiting) {
    for (const n of natal) {
      const sep = separation(t.longitude, n.longitude);
      let best: TransitAspect | null = null;
      for (const [type, angle] of Object.entries(ASPECT_ANGLES) as [AspectType, number][]) {
        const orb = Math.abs(sep - angle);
        if (orb <= orbs[type] && (best === null || orb < best.orb)) {
          // The natal point stands still; only the transiting planet moves.
          const dSepDt = Math.sign(norm180(t.longitude - n.longitude)) * t.speed;
          const applying = t.speed === 0 ? null : sep > angle ? dSepDt < 0 : dSepDt > 0;
          best = { transiting: t.body, natal: n.point, type, angle, orb, applying };
        }
      }
      if (best) out.push(best);
    }
  }
  return out.sort((a, b) => a.orb - b.orb);
}
