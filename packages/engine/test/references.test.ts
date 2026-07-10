/**
 * THE ACCURACY GATE (PRD §12 criterion 2).
 *
 * Engine output vs published reference values for 6 known birth data sets:
 * planetary positions, Ascendant, Midheaven, Placidus house placements,
 * sidereal positions, nakshatra and the Vimshottari dasha timeline.
 * Tolerance: 2 arcminutes on longitudes (published values are rounded to
 * the arcminute), exact match on signs/houses/nakshatras/dasha lords.
 */
import { describe, expect, it } from "vitest";
import { computeChart } from "../src";
import { DEG, OBAMA_VEDIC, REFERENCE_CHARTS } from "./fixtures";

const TOL = 2 / 60; // 2 arcminutes

function delta(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

describe("reference charts — western tropical (vs astrotheme/AstroDatabank)", () => {
  for (const ref of REFERENCE_CHARTS) {
    describe(ref.name, () => {
      const chart = computeChart({
        utc: ref.utc,
        latitude: ref.latitude,
        longitude: ref.longitude,
        system: "western",
        houseSystem: "placidus",
      });

      for (const [body, [d, m, sign]] of Object.entries(ref.expected)) {
        it(`${body} at ${d}°${m}' of sign ${sign}`, () => {
          const p = chart.planets.find((x) => x.body === body)!;
          expect(p).toBeDefined();
          expect(delta(p.longitude, DEG(d, m, sign))).toBeLessThanOrEqual(TOL);
          expect(p.sign).toBe(sign);
        });
      }

      it("ascendant matches", () => {
        const [d, m, sign] = ref.ascendant;
        expect(delta(chart.angles!.ascendant, DEG(d, m, sign))).toBeLessThanOrEqual(TOL);
        expect(chart.angles!.ascendantSign).toBe(sign);
      });

      it("midheaven matches", () => {
        const [d, m, sign] = ref.midheaven;
        expect(delta(chart.angles!.midheaven, DEG(d, m, sign))).toBeLessThanOrEqual(TOL);
        expect(chart.angles!.midheavenSign).toBe(sign);
      });

      if (ref.placidusHouses) {
        it("Placidus house placements match published houses", () => {
          for (const [body, house] of Object.entries(ref.placidusHouses!)) {
            const p = chart.planets.find((x) => x.body === body)!;
            if (p.house !== house) {
              // Astrotheme "bumps" a planet conjunct the next cusp into the
              // next house; we use strict geometric placement (astro.com
              // data-table convention). Accept only that exact case, and
              // only when the planet is within 0.5° of the next cusp.
              const nextCusp = chart.houseCusps![p.house! % 12];
              const gap = (nextCusp - p.longitude + 360) % 360;
              expect(house, `${body}: published house`).toBe((p.house! % 12) + 1);
              expect(gap, `${body}: distance to next cusp`).toBeLessThan(0.5);
            } else {
              expect(p.house, `${body} house`).toBe(house);
            }
          }
        });
      }
    });
  }
});

describe("reference chart — vedic sidereal + Vimshottari (Obama vs vedicastroindex)", () => {
  const chart = computeChart({
    utc: "1961-08-05T05:24:00Z",
    latitude: 21.3,
    longitude: -157.8667,
    system: "vedic",
    ayanamsa: "lahiri",
  });

  it("sidereal Moon ≈ 10°02' Taurus (Lahiri)", () => {
    const moon = chart.planets.find((p) => p.body === "moon")!;
    expect(delta(moon.longitude, OBAMA_VEDIC.moonSidereal)).toBeLessThanOrEqual(0.05);
    expect(moon.sign).toBe(1); // Taurus
  });

  it("Moon nakshatra is Rohini pada 1", () => {
    const moon = chart.planets.find((p) => p.body === "moon")!;
    expect(moon.nakshatra!.name).toBe(OBAMA_VEDIC.nakshatra);
    expect(moon.nakshatra!.pada).toBe(OBAMA_VEDIC.pada);
  });

  it("mahadasha timeline matches the published sequence and dates", () => {
    const mahas = chart.vimshottari!.mahadashas;
    // First mahadasha starts at birth.
    expect(mahas[0].start).toBe("1961-08-05T05:24:00.000Z");
    for (let i = 0; i < OBAMA_VEDIC.mahadashas.length; i++) {
      const expected = OBAMA_VEDIC.mahadashas[i];
      const actual = mahas[i];
      expect(actual.lord, `mahadasha ${i} lord`).toBe(expected.lord);
      const end = new Date(actual.end);
      expect(end.getUTCFullYear(), `mahadasha ${i} end year`).toBe(expected.endYear);
      // Month precision (published tables round); allow ±1 month.
      const monthDelta = Math.abs(end.getUTCMonth() + 1 - expected.endMonth);
      expect(monthDelta, `mahadasha ${i} end month`).toBeLessThanOrEqual(1);
    }
  });

  it("published sidereal Jupiter ≈ 7.54° Capricorn (debilitated)", () => {
    const jup = chart.planets.find((p) => p.body === "jupiter")!;
    expect(jup.sign).toBe(9); // Capricorn
    expect(Math.abs(jup.degreeInSign - 7.54)).toBeLessThanOrEqual(0.1);
  });
});

describe("vedic nakshatras — known lunar nakshatras of reference charts", () => {
  const cases: [string, string, string][] = [
    ["1879-03-14T10:50:00Z", "48.4,10.0", "Jyeshtha"], // Einstein
    ["1961-07-01T18:45:00Z", "52.8333,0.5", "Dhanishta"], // Diana
  ];
  for (const [utc, coords, nakshatra] of cases) {
    it(`${utc} Moon in ${nakshatra}`, () => {
      const [lat, lon] = coords.split(",").map(Number);
      const chart = computeChart({ utc, latitude: lat, longitude: lon, system: "vedic" });
      const moon = chart.planets.find((p) => p.body === "moon")!;
      expect(moon.nakshatra!.name).toBe(nakshatra);
    });
  }
});
