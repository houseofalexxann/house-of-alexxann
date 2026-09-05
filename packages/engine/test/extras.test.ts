import { describe, expect, it } from "vitest";
import {
  computeChart,
  equatorialToEcliptic,
  fixedStarPositions,
  FIXED_STARS,
  starConjunctions,
  transitAspects,
  utcToJulianDayUT,
} from "../src";

const NYC = { latitude: 40.7128, longitude: -74.006 };

describe("asteroids and points", () => {
  it("computes Chiron, the four asteroids and mean Lilith with the bundled files", () => {
    const chart = computeChart({
      system: "western",
      utc: "1990-06-15T18:30:00Z",
      ...NYC,
      extras: ["chiron", "ceres", "pallas", "juno", "vesta", "lilith"],
    });
    expect(chart.extras).not.toBeNull();
    const by = new Map(chart.extras!.map((e) => [e.body, e]));
    // Values cross-checked directly against swe_calc_ut for this instant.
    expect(by.get("chiron")!.longitude).toBeCloseTo(106.088, 2);
    expect(by.get("ceres")!.longitude).toBeCloseTo(117.993, 2);
    expect(by.get("juno")!.retrograde).toBe(true);
    expect(by.get("vesta")!.sign).toBe(1); // Taurus
    expect(by.get("lilith")!.longitude).toBeCloseTo(234.982, 2);
    // Houses come from the natal cusps like any planet.
    expect(by.get("chiron")!.house).toBeGreaterThanOrEqual(1);
  });

  it("leaves extras null unless asked for", () => {
    const chart = computeChart({ system: "western", utc: "1990-06-15T18:30:00Z", ...NYC });
    expect(chart.extras).toBeNull();
  });
});

describe("fixed stars", () => {
  it("places Regulus at 29°50' Leo at J2000 and past 0° Virgo by 2012", () => {
    const j2000 = utcToJulianDayUT("2000-01-01T12:00:00Z");
    const regulus2000 = fixedStarPositions(j2000).find((s) => s.name === "Regulus")!;
    expect(regulus2000.longitude).toBeCloseTo(149.83, 1);
    const regulus2012 = fixedStarPositions(utcToJulianDayUT("2012-06-01T00:00:00Z")).find(
      (s) => s.name === "Regulus"
    )!;
    expect(regulus2012.longitude).toBeGreaterThan(150);
    expect(regulus2012.longitude).toBeLessThan(150.05);
  });

  it("converts equatorial to ecliptic coordinates correctly for Spica", () => {
    // Spica J2000: 23°50' Libra, ecliptic latitude about -2°03'.
    const e = equatorialToEcliptic(201.2983, -11.1613);
    expect(e.lon).toBeCloseTo(203.84, 1);
    expect(e.lat).toBeCloseTo(-2.06, 1);
  });

  it("finds conjunctions within a one-degree orb only", () => {
    const stars = fixedStarPositions(utcToJulianDayUT("2000-01-01T12:00:00Z"));
    const hits = starConjunctions(stars, [
      { point: "sun", longitude: 149.5 }, // 0.33° from Regulus
      { point: "moon", longitude: 20 }, // 20° Aries: no catalogued star within 1°
    ]);
    expect(hits.map((h) => `${h.star}:${h.point}`)).toEqual(["Regulus:sun"]);
    expect(hits[0].orb).toBeLessThan(0.4);
    expect(FIXED_STARS.length).toBe(50);
    // Alcyone, the Pleiades' brightest, sits right at 0° Gemini at J2000.
    const alcyone = stars.find((s) => s.name === "Alcyone")!;
    expect(alcyone.longitude).toBeCloseTo(60.0, 0);
  });
});

describe("transit snapshot", () => {
  it("finds aspects from transiting planets to natal points with transit orbs", () => {
    const natal = computeChart({ system: "western", utc: "1990-06-15T18:30:00Z", ...NYC });
    const transiting = computeChart({ system: "western", utc: "2026-09-03T12:00:00Z", ...NYC });
    const hits = transitAspects(transiting.planets, [
      ...natal.planets.map((p) => ({ point: p.body, longitude: p.longitude })),
      { point: "ascendant" as const, longitude: natal.angles!.ascendant },
      { point: "midheaven" as const, longitude: natal.angles!.midheaven },
    ]);
    expect(hits.length).toBeGreaterThan(0);
    for (const h of hits) {
      expect(h.orb).toBeLessThanOrEqual(3);
      expect(["conjunction", "sextile", "square", "trine", "opposition"]).toContain(h.type);
    }
    // Sorted tightest first.
    for (let i = 1; i < hits.length; i++) expect(hits[i].orb).toBeGreaterThanOrEqual(hits[i - 1].orb);
  });

  it("labels an approaching square as applying", () => {
    const hits = transitAspects(
      [
        {
          body: "mars",
          longitude: 88.5, // 1.5° short of a square to 0° Aries, moving forward
          latitude: 0,
          speed: 0.6,
          retrograde: false,
          sign: 2,
          degreeInSign: 28.5,
          formatted: "28°30'",
          house: null,
        },
      ],
      [{ point: "sun", longitude: 0 }]
    );
    expect(hits).toHaveLength(1);
    expect(hits[0].type).toBe("square");
    expect(hits[0].applying).toBe(true);
  });
});
