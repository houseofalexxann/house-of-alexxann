/**
 * Cross-implementation verification: Swiss Ephemeris (sweph) vs
 * astronomy-engine (independent VSOP87/NOVAS-lineage implementation, MIT).
 *
 * Two unrelated ephemeris implementations agreeing to ~arcseconds is strong
 * evidence of correctness independent of any hand-copied reference table.
 * Covers Sun–Pluto (incl. Pluto, which the published tables didn't) across
 * all six reference charts.
 */
import { describe, expect, it } from "vitest";
import * as A from "astronomy-engine";
import { computeChart } from "../src";
import { REFERENCE_CHARTS } from "./fixtures";

const TOL = 0.02; // degrees (72 arcseconds) — astronomy-engine is ±1 arcmin

const AE_BODIES: Record<string, A.Body> = {
  mercury: A.Body.Mercury,
  venus: A.Body.Venus,
  mars: A.Body.Mars,
  jupiter: A.Body.Jupiter,
  saturn: A.Body.Saturn,
  uranus: A.Body.Uranus,
  neptune: A.Body.Neptune,
  pluto: A.Body.Pluto,
};

/** Apparent geocentric ecliptic-of-date longitude via astronomy-engine. */
function aeLongitude(body: string, date: Date): number {
  if (body === "sun") return A.SunPosition(date).elon;
  if (body === "moon") return A.EclipticGeoMoon(date).lon;
  const t = A.MakeTime(date);
  const vec = A.GeoVector(AE_BODIES[body], t, true);
  const ect = A.RotateVector(A.Rotation_EQJ_ECT(t), vec);
  const lon = A.SphereFromVector(ect).lon;
  return lon < 0 ? lon + 360 : lon;
}

function delta(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

describe("cross-engine: sweph vs astronomy-engine (tropical longitudes)", () => {
  for (const ref of REFERENCE_CHARTS) {
    it(`${ref.name}: all 10 bodies agree within ${TOL}°`, () => {
      const chart = computeChart({
        utc: ref.utc,
        latitude: ref.latitude,
        longitude: ref.longitude,
        system: "western",
      });
      const date = new Date(ref.utc);
      for (const body of Object.keys(AE_BODIES).concat(["sun", "moon"])) {
        const ours = chart.planets.find((p) => p.body === body)!.longitude;
        const theirs = aeLongitude(body, date);
        expect(
          delta(ours, theirs),
          `${body}: sweph=${ours.toFixed(5)} ae=${theirs.toFixed(5)}`
        ).toBeLessThanOrEqual(TOL);
      }
    });
  }
});
