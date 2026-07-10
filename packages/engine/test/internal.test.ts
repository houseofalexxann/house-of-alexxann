/**
 * Internal invariants: determinism, house geometry, navamsa & nakshatra
 * arithmetic, Vimshottari algebra, aspects, and time-unknown handling.
 */
import { describe, expect, it } from "vitest";
import {
  computeChart,
  nakshatraOf,
  navamsaSign,
  separation,
  vimshottariDasha,
} from "../src";

const EINSTEIN = {
  utc: "1879-03-14T10:50:00Z",
  latitude: 48.4,
  longitude: 10.0,
} as const;

describe("determinism", () => {
  it("same input → byte-identical output", () => {
    const a = computeChart({ ...EINSTEIN, system: "western" });
    const b = computeChart({ ...EINSTEIN, system: "western" });
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it("vedic runs do not contaminate subsequent western runs (sidereal mode reset)", () => {
    const w1 = computeChart({ ...EINSTEIN, system: "western" });
    computeChart({ ...EINSTEIN, system: "vedic" });
    const w2 = computeChart({ ...EINSTEIN, system: "western" });
    expect(JSON.stringify(w1.planets)).toBe(JSON.stringify(w2.planets));
  });
});

describe("house geometry", () => {
  it("whole-sign cusps are exact sign boundaries starting at the Asc sign", () => {
    const c = computeChart({ ...EINSTEIN, system: "western", houseSystem: "whole-sign" });
    const ascSignStart = Math.floor(c.angles!.ascendant / 30) * 30;
    for (let i = 0; i < 12; i++) {
      expect(c.houseCusps![i]).toBeCloseTo((ascSignStart + i * 30) % 360, 8);
    }
  });

  it("placidus: cusp 1 = Asc, cusp 10 = MC, opposite cusps 180° apart", () => {
    const c = computeChart({ ...EINSTEIN, system: "western", houseSystem: "placidus" });
    expect(c.houseCusps![0]).toBeCloseTo(c.angles!.ascendant, 6);
    expect(c.houseCusps![9]).toBeCloseTo(c.angles!.midheaven, 6);
    for (let i = 0; i < 6; i++) {
      const diff = Math.abs(c.houseCusps![i] - c.houseCusps![i + 6]);
      expect(Math.min(diff, 360 - diff)).toBeCloseTo(180, 6);
    }
  });

  it("house systems differ in cusps but agree on the angles", () => {
    const p = computeChart({ ...EINSTEIN, system: "western", houseSystem: "placidus" });
    const k = computeChart({ ...EINSTEIN, system: "western", houseSystem: "koch" });
    expect(k.angles!.ascendant).toBeCloseTo(p.angles!.ascendant, 6);
    expect(k.angles!.midheaven).toBeCloseTo(p.angles!.midheaven, 6);
    expect(k.houseCusps![1]).not.toBeCloseTo(p.houseCusps![1], 1);
  });

  it("every planet lands in the house containing its longitude", () => {
    const c = computeChart({ ...EINSTEIN, system: "western" });
    for (const p of c.planets) {
      const h = p.house!;
      const start = c.houseCusps![h - 1];
      const end = c.houseCusps![h % 12];
      const span = (end - start + 360) % 360;
      const off = (p.longitude - start + 360) % 360;
      expect(off, `${p.body} in house ${h}`).toBeLessThan(span);
    }
  });
});

describe("tropical ↔ sidereal relationship", () => {
  it("tropical − sidereal = ayanamsa for every body", () => {
    const w = computeChart({ ...EINSTEIN, system: "western" });
    const v = computeChart({ ...EINSTEIN, system: "vedic" });
    for (const vp of v.planets) {
      const wp = w.planets.find((p) => p.body === vp.body)!;
      const diff = (wp.longitude - vp.longitude + 360) % 360;
      expect(diff).toBeCloseTo(v.ayanamsaValue!, 4);
    }
  });

  it("Lahiri ayanamsa ≈ 23.85° at J2000", () => {
    const v = computeChart({
      utc: "2000-01-01T12:00:00Z",
      latitude: 0,
      longitude: 0,
      system: "vedic",
    });
    expect(v.ayanamsaValue!).toBeGreaterThan(23.8);
    expect(v.ayanamsaValue!).toBeLessThan(23.9);
  });

  it("ayanamsa is configurable (Raman differs from Lahiri by ~1.4°)", () => {
    const lahiri = computeChart({ ...EINSTEIN, system: "vedic", ayanamsa: "lahiri" });
    const raman = computeChart({ ...EINSTEIN, system: "vedic", ayanamsa: "raman" });
    const d = lahiri.ayanamsaValue! - raman.ayanamsaValue!;
    expect(Math.abs(d)).toBeGreaterThan(1);
    expect(Math.abs(d)).toBeLessThan(2);
  });
});

describe("nakshatra arithmetic", () => {
  it("boundaries: 0° = Ashwini p1, 13°19' = Ashwini p4, 13°20' = Bharani p1", () => {
    expect(nakshatraOf(0)).toMatchObject({ name: "Ashwini", pada: 1, lord: "ketu" });
    expect(nakshatraOf(13 + 19 / 60)).toMatchObject({ name: "Ashwini", pada: 4 });
    expect(nakshatraOf(13 + 20 / 60)).toMatchObject({ name: "Bharani", pada: 1, lord: "venus" });
    expect(nakshatraOf(359.99)).toMatchObject({ name: "Revati", pada: 4, lord: "mercury" });
  });

  it("each pada spans 3°20'", () => {
    expect(nakshatraOf(3 + 20 / 60).pada).toBe(2);
    expect(nakshatraOf(6 + 40 / 60).pada).toBe(3);
    expect(nakshatraOf(10).pada).toBe(4);
  });
});

describe("navamsa (D9) arithmetic", () => {
  it("movable sign counts from itself (0° Aries → Aries navamsa)", () => {
    expect(navamsaSign(0)).toBe(0);
    expect(navamsaSign(3.4)).toBe(1); // second navamsa of Aries → Taurus
  });
  it("fixed sign counts from the 9th (0° Taurus → Capricorn)", () => {
    expect(navamsaSign(30)).toBe(9);
  });
  it("dual sign counts from the 5th (0° Gemini → Libra)", () => {
    expect(navamsaSign(60)).toBe(6);
  });
  it("last navamsa of Pisces is Pisces (vargottama edge)", () => {
    expect(navamsaSign(359.9)).toBe(11);
  });
});

describe("Vimshottari algebra", () => {
  it("Moon at 0° Ashwini → full 7y Ketu mahadasha from birth", () => {
    const d = vimshottariDasha(0, "2000-01-01T00:00:00Z");
    expect(d.moonNakshatra.name).toBe("Ashwini");
    expect(d.balanceOfFirst).toBeCloseTo(1, 9);
    expect(d.mahadashas[0].lord).toBe("ketu");
    const start = new Date(d.mahadashas[0].start).getTime();
    const end = new Date(d.mahadashas[0].end).getTime();
    expect((end - start) / 86400000).toBeCloseTo(7 * 365.25, 3);
  });

  it("Moon halfway through Bharani → half of Venus 20y remains", () => {
    const half = 13.3333333333 + 6.6666666667; // 20°00'
    const d = vimshottariDasha(half, "2000-01-01T00:00:00Z");
    expect(d.mahadashas[0].lord).toBe("venus");
    expect(d.balanceOfFirst).toBeCloseTo(0.5, 6);
    const start = new Date(d.mahadashas[0].start).getTime();
    const end = new Date(d.mahadashas[0].end).getTime();
    expect((end - start) / 86400000).toBeCloseTo(10 * 365.25, 2);
  });

  it("nine mahadashas cover exactly 120 years (minus elapsed balance)", () => {
    const d = vimshottariDasha(0, "2000-01-01T00:00:00Z");
    expect(d.mahadashas).toHaveLength(9);
    const start = new Date(d.mahadashas[0].start).getTime();
    const end = new Date(d.mahadashas[8].end).getTime();
    expect((end - start) / 86400000).toBeCloseTo(120 * 365.25, 2);
    const lords = d.mahadashas.map((m) => m.lord);
    expect(lords).toEqual([
      "ketu", "venus", "sun", "moon", "mars", "rahu", "jupiter", "saturn", "mercury",
    ]);
  });

  it("antardashas subdivide proportionally and start with the maha lord", () => {
    const d = vimshottariDasha(0, "2000-01-01T00:00:00Z");
    const ketu = d.mahadashas[0];
    expect(ketu.sub![0].lord).toBe("ketu");
    expect(ketu.sub).toHaveLength(9);
    // Ketu-Ketu antardasha: 7 * 7 / 120 years.
    const s = new Date(ketu.sub![0].start).getTime();
    const e = new Date(ketu.sub![0].end).getTime();
    expect((e - s) / 86400000).toBeCloseTo((7 * 7 * 365.25) / 120, 3);
    // Antardashas exactly tile the mahadasha.
    expect(ketu.sub![8].end).toBe(ketu.end);
  });

  it("first mahadasha's pre-birth antardashas are clipped", () => {
    const d = vimshottariDasha(20, "2000-01-01T00:00:00Z"); // mid-Bharani
    const first = d.mahadashas[0];
    expect(new Date(first.sub![0].start).getTime()).toBe(
      new Date("2000-01-01T00:00:00Z").getTime()
    );
  });
});

describe("aspects", () => {
  it("finds the classic Einstein Mercury–Saturn conjunction", () => {
    const c = computeChart({ ...EINSTEIN, system: "western" });
    const conj = c.aspects.find(
      (a) =>
        a.type === "conjunction" &&
        [a.a, a.b].includes("mercury") &&
        [a.a, a.b].includes("saturn")
    );
    expect(conj).toBeDefined();
    expect(conj!.orb).toBeLessThan(1.5);
  });

  it("respects orb configuration", () => {
    const wide = computeChart({ ...EINSTEIN, system: "western" });
    const tight = computeChart({
      ...EINSTEIN,
      system: "western",
      orbs: { conjunction: 0.5, opposition: 0.5, trine: 0.5, square: 0.5, sextile: 0.5 },
    });
    expect(tight.aspects.length).toBeLessThan(wide.aspects.length);
    for (const a of tight.aspects) expect(a.orb).toBeLessThanOrEqual(0.5);
  });

  it("separation is symmetric and wraps", () => {
    expect(separation(350, 10)).toBe(20);
    expect(separation(10, 350)).toBe(20);
    expect(separation(0, 180)).toBe(180);
  });
});

describe("time-unknown mode (PRD §11)", () => {
  const unknown = computeChart({ ...EINSTEIN, system: "western", timeKnown: false });

  it("suppresses angles, cusps and house placements", () => {
    expect(unknown.angles).toBeNull();
    expect(unknown.houseCusps).toBeNull();
    for (const p of unknown.planets) expect(p.house).toBeNull();
  });

  it("still returns planetary positions", () => {
    expect(unknown.planets.length).toBeGreaterThan(0);
    expect(unknown.planets[0].longitude).toBeGreaterThanOrEqual(0);
  });

  it("vedic time-unknown omits navamsa ascendant but keeps planet navamsas", () => {
    const v = computeChart({ ...EINSTEIN, system: "vedic", timeKnown: false });
    expect(v.navamsa!.find((n) => n.body === "ascendant")).toBeUndefined();
    expect(v.navamsa!.length).toBe(9);
  });
});

describe("input validation", () => {
  it("rejects bad datetimes and out-of-range coordinates", () => {
    expect(() => computeChart({ utc: "not-a-date", latitude: 0, longitude: 0, system: "western" })).toThrow();
    expect(() => computeChart({ utc: "2000-01-01T00:00:00Z", latitude: 91, longitude: 0, system: "western" })).toThrow();
    expect(() => computeChart({ utc: "2000-01-01T00:00:00Z", latitude: 0, longitude: 200, system: "western" })).toThrow();
  });

  it("retrograde flags: Mercury retrograde in Diana's chart", () => {
    const c = computeChart({
      utc: "1961-07-01T18:45:00Z",
      latitude: 52.8333,
      longitude: 0.5,
      system: "western",
    });
    expect(c.planets.find((p) => p.body === "mercury")!.retrograde).toBe(true);
    expect(c.planets.find((p) => p.body === "sun")!.retrograde).toBe(false);
  });
});
