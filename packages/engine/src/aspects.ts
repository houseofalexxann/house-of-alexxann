import type { Aspect, AspectType, PlanetPosition } from "./types";
import { ASPECT_ANGLES, DEFAULT_ORBS } from "./constants";

/** Smallest angular separation between two longitudes (0–180). */
export function separation(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

/**
 * Major (Ptolemaic) aspects between the given positions.
 * Rahu/Ketu are always in exact opposition, so the node pair is skipped.
 */
export function findAspects(
  planets: PlanetPosition[],
  orbOverrides?: Partial<Record<AspectType, number>>
): Aspect[] {
  const orbs = { ...DEFAULT_ORBS, ...orbOverrides };
  const aspects: Aspect[] = [];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const p = planets[i];
      const q = planets[j];
      if (
        (p.body === "rahu" && q.body === "ketu") ||
        (p.body === "ketu" && q.body === "rahu")
      ) {
        continue;
      }
      const sep = separation(p.longitude, q.longitude);
      let best: Aspect | null = null;
      for (const [type, angle] of Object.entries(ASPECT_ANGLES) as [
        AspectType,
        number
      ][]) {
        const orb = Math.abs(sep - angle);
        if (orb <= orbs[type] && (best === null || orb < best.orb)) {
          // Applying if the separation is moving toward the exact angle.
          const relSpeed = p.speed - q.speed;
          const dSepDt =
            Math.sign(norm180(p.longitude - q.longitude)) * relSpeed;
          const applying =
            relSpeed === 0 ? null : (sep > angle ? dSepDt < 0 : dSepDt > 0);
          best = { a: p.body, b: q.body, type, angle, orb, applying };
        }
      }
      if (best) aspects.push(best);
    }
  }
  return aspects.sort((x, y) => x.orb - y.orb);
}

function norm180(x: number): number {
  let r = x % 360;
  if (r > 180) r -= 360;
  if (r < -180) r += 360;
  return r;
}
