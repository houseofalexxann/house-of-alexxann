/**
 * Hellenistic tables: decans, Egyptian terms, Lots, zodiacal releasing,
 * and angle nakshatras.
 */
import { describe, expect, it } from "vitest";
import {
  computeChart,
  decanOf,
  egyptianTermOf,
  egyptianTermsTable,
  lots,
  zodiacalReleasingL1,
  ZR_YEARS,
} from "../src";

const EINSTEIN = { utc: "1879-03-14T10:50:00Z", latitude: 48.4, longitude: 10.0 } as const;

describe("Chaldean decans (faces)", () => {
  it("first faces: Aries I = Mars, Aries II = Sun, Aries III = Venus", () => {
    expect(decanOf(5).ruler).toBe("mars");
    expect(decanOf(15).ruler).toBe("sun");
    expect(decanOf(25).ruler).toBe("venus");
  });
  it("known checkpoints: Leo I = Saturn, Libra I = Moon, Pisces III = Mars", () => {
    expect(decanOf(120 + 5).ruler).toBe("saturn");
    expect(decanOf(180 + 5).ruler).toBe("moon");
    expect(decanOf(330 + 25).ruler).toBe("mars");
  });
  it("boundaries: 9.99° is decan 1, 10° is decan 2 of Aries", () => {
    expect(decanOf(9.99).decanOfSign).toBe(1);
    expect(decanOf(10).decanOfSign).toBe(2);
    expect(decanOf(29.99).decanOfSign).toBe(3);
  });
  it("36 faces cycle the 7 Chaldean rulers", () => {
    const rulers = Array.from({ length: 36 }, (_, i) => decanOf(i * 10 + 5).ruler);
    expect(new Set(rulers).size).toBe(7);
    expect(rulers[35]).toBe("mars"); // Pisces III
  });
});

describe("Egyptian terms (bounds)", () => {
  it("every sign's bounds sum to 30°", () => {
    for (const { terms } of egyptianTermsTable()) {
      const total = terms.reduce((s, t) => s + (t.to - t.from), 0);
      expect(total).toBe(30);
      expect(terms).toHaveLength(5);
    }
  });
  it("classic checkpoints from the canonical table", () => {
    expect(egyptianTermOf(3).ruler).toBe("jupiter"); // Aries 0–6
    expect(egyptianTermOf(24.5).ruler).toBe("mars"); // Aries 20–25
    expect(egyptianTermOf(240 + 5).ruler).toBe("jupiter"); // Sag 0–12
    expect(egyptianTermOf(150 + 10).ruler).toBe("venus"); // Virgo 7–17
    expect(egyptianTermOf(330 + 1).ruler).toBe("venus"); // Pisces 0–12
    expect(egyptianTermOf(330 + 29).ruler).toBe("saturn"); // Pisces 28–30
  });
  it("luminaries never rule bounds", () => {
    for (const { terms } of egyptianTermsTable()) {
      for (const t of terms) {
        expect(["sun", "moon"]).not.toContain(t.ruler);
      }
    }
  });
});

describe("Lots of Fortune & Spirit", () => {
  it("day formula: Fortune = Asc + Moon − Sun; Spirit mirrors it", () => {
    const l = lots(100, 40, 70, true);
    expect(l.fortune).toBeCloseTo(130, 9); // 100 + 70 - 40
    expect(l.spirit).toBeCloseTo(70, 9); // 100 + 40 - 70
  });
  it("night reverses the formulas", () => {
    const day = lots(100, 40, 70, true);
    const night = lots(100, 40, 70, false);
    expect(night.fortune).toBeCloseTo(day.spirit, 9);
    expect(night.spirit).toBeCloseTo(day.fortune, 9);
  });
  it("wraps across 0° Aries", () => {
    const l = lots(350, 40, 30, true);
    expect(l.fortune).toBeCloseTo(340, 9);
  });
});

describe("zodiacal releasing (L1, from Spirit)", () => {
  it("Valens' minor years: Cancer 25, Capricorn 27, Aquarius 30", () => {
    expect(ZR_YEARS[3]).toBe(25);
    expect(ZR_YEARS[9]).toBe(27);
    expect(ZR_YEARS[10]).toBe(30);
    expect(ZR_YEARS.reduce((a, b) => a + b)).toBe(211);
  });
  it("periods start at birth in the lot's sign and march in order", () => {
    const zr = zodiacalReleasingL1(95, "2000-01-01T00:00:00Z"); // Cancer
    expect(zr[0].sign).toBe(3);
    expect(zr[0].ruler).toBe("moon");
    expect(zr[0].years).toBe(25);
    expect(zr[0].start).toBe("2000-01-01T00:00:00.000Z");
    expect(zr[1].sign).toBe(4); // Leo follows
    const firstLen =
      (Date.parse(zr[0].end) - Date.parse(zr[0].start)) / (365.25 * 86400e3);
    expect(firstLen).toBeCloseTo(25, 6);
  });
  it("integrated: Einstein's chart carries lots + ZR when time is known", () => {
    const c = computeChart({ ...EINSTEIN, system: "western" });
    expect(c.traditional.lots).not.toBeNull();
    expect(c.traditional.zodiacalReleasing!.length).toBeGreaterThan(4);
    // Day chart: Fortune = Asc + Moon − Sun.
    const asc = c.angles!.ascendant;
    const sun = c.planets.find((p) => p.body === "sun")!.longitude;
    const moon = c.planets.find((p) => p.body === "moon")!.longitude;
    const expected = ((asc + moon - sun) % 360 + 360) % 360;
    expect(c.traditional.lots!.fortune).toBeCloseTo(expected, 6);
  });
  it("suppressed without a birth time", () => {
    const c = computeChart({ ...EINSTEIN, system: "western", timeKnown: false });
    expect(c.traditional.lots).toBeNull();
    expect(c.traditional.zodiacalReleasing).toBeNull();
  });
});

describe("angle nakshatras (vedic)", () => {
  it("Asc and MC carry nakshatra + pada + lord in the vedic chart", () => {
    const c = computeChart({ ...EINSTEIN, system: "vedic" });
    const asc = c.angles!.ascendantNakshatra!;
    const mc = c.angles!.midheavenNakshatra!;
    expect(asc.name).toBeTruthy();
    expect(asc.pada).toBeGreaterThanOrEqual(1);
    expect(asc.pada).toBeLessThanOrEqual(4);
    expect(asc.lord).toBeTruthy();
    expect(mc.name).toBeTruthy();
    // Consistency: recompute from the sidereal Asc longitude.
    const lon = c.angles!.ascendant;
    const expectedIndex = Math.floor(lon / (360 / 27)) % 27;
    expect(asc.index).toBe(expectedIndex);
  });
  it("western charts omit angle nakshatras", () => {
    const c = computeChart({ ...EINSTEIN, system: "western" });
    expect(c.angles!.ascendantNakshatra).toBeUndefined();
  });
  it("every planet now carries decan + term", () => {
    const c = computeChart({ ...EINSTEIN, system: "western" });
    for (const p of c.planets) {
      expect(p.decan).toBeDefined();
      expect(p.term).toBeDefined();
      expect(p.decan!.sign).toBe(p.sign);
      expect(p.term!.sign).toBe(p.sign);
    }
  });
});
