/**
 * Traditional depth: dignities, sect, moon phase, angle aspects, solar return.
 */
import { describe, expect, it } from "vitest";
import { computeChart, computeSolarReturn, dignityOf, moonPhase } from "../src";

const EINSTEIN = { utc: "1879-03-14T10:50:00Z", latitude: 48.4, longitude: 10.0 } as const;

describe("essential dignities (Ptolemaic)", () => {
  it("Sun: Leo domicile, Aries exalted, Aquarius detriment, Libra fall", () => {
    expect(dignityOf("sun", 4)).toBe("domicile");
    expect(dignityOf("sun", 0)).toBe("exaltation");
    expect(dignityOf("sun", 10)).toBe("detriment");
    expect(dignityOf("sun", 6)).toBe("fall");
    expect(dignityOf("sun", 11)).toBe("peregrine");
  });

  it("Moon: Cancer domicile, Taurus exalted, Capricorn detriment, Scorpio fall", () => {
    expect(dignityOf("moon", 3)).toBe("domicile");
    expect(dignityOf("moon", 1)).toBe("exaltation");
    expect(dignityOf("moon", 9)).toBe("detriment");
    expect(dignityOf("moon", 7)).toBe("fall");
  });

  it("Saturn rules Capricorn and Aquarius; exalted Libra, fall Aries", () => {
    expect(dignityOf("saturn", 9)).toBe("domicile");
    expect(dignityOf("saturn", 10)).toBe("domicile");
    expect(dignityOf("saturn", 6)).toBe("exaltation");
    expect(dignityOf("saturn", 0)).toBe("fall");
    expect(dignityOf("saturn", 3)).toBe("detriment"); // opposite Capricorn
  });

  it("outer planets are peregrine in this scheme", () => {
    expect(dignityOf("uranus", 4)).toBe("peregrine");
    expect(dignityOf("pluto", 7)).toBe("peregrine");
  });
});

describe("moon phase", () => {
  it("New at 0°, Full near 180°, First Quarter near 90°", () => {
    expect(moonPhase(100, 100).phase).toBe("New Moon");
    expect(moonPhase(0, 180).phase).toBe("Full Moon");
    expect(moonPhase(0, 90).phase).toBe("First Quarter");
    expect(moonPhase(0, 270).phase).toBe("Last Quarter");
  });
  it("waxing before opposition, waning after", () => {
    expect(moonPhase(0, 80).waxing).toBe(true);
    expect(moonPhase(0, 200).waxing).toBe(false);
  });
  it("illumination: dark at new, full at opposition", () => {
    expect(moonPhase(0, 0).illumination).toBeCloseTo(0, 5);
    expect(moonPhase(0, 180).illumination).toBeCloseTo(1, 5);
  });
});

describe("sect", () => {
  it("Einstein is a day chart (Sun above the horizon), Sun is the light leader", () => {
    const c = computeChart({ ...EINSTEIN, system: "western" });
    expect(c.traditional.sect).not.toBeNull();
    expect(c.traditional.sect!.sect).toBe("day");
    expect(c.traditional.sect!.lightLeader).toBe("sun");
    // Diurnal planets are in sect by day.
    expect(c.traditional.sect!.inSect.jupiter).toBe(true);
    expect(c.traditional.sect!.inSect.moon).toBe(false);
  });
  it("sect is null when birth time is unknown", () => {
    const c = computeChart({ ...EINSTEIN, system: "western", timeKnown: false });
    expect(c.traditional.sect).toBeNull();
    expect(c.traditional.angleAspects).toHaveLength(0);
    // Dignities and moon phase still compute without a time.
    expect(c.traditional.dignities.length).toBeGreaterThan(0);
    expect(c.traditional.moonPhase.phase).toBeTruthy();
  });
});

describe("aspects to angles", () => {
  it("returns planet↔Asc/MC aspects sorted by orb", () => {
    const c = computeChart({ ...EINSTEIN, system: "western" });
    const aa = c.traditional.angleAspects;
    expect(aa.length).toBeGreaterThan(0);
    for (let i = 1; i < aa.length; i++) {
      expect(aa[i].orb).toBeGreaterThanOrEqual(aa[i - 1].orb);
    }
    for (const a of aa) {
      expect(["ascendant", "midheaven"]).toContain(a.angle);
      expect(a.orb).toBeLessThanOrEqual(8);
    }
  });
});

describe("solar return", () => {
  it("returns the Sun to its natal longitude, near the birthday", () => {
    const natal = computeChart({ ...EINSTEIN, system: "western" });
    const natalSun = natal.planets.find((p) => p.body === "sun")!.longitude;
    const sr = computeSolarReturn(
      { ...EINSTEIN, system: "western" },
      1922
    );
    const srSun = sr.planets.find((p) => p.body === "sun")!.longitude;
    const d = Math.abs(((srSun - natalSun + 540) % 360) - 180);
    expect(d).toBeLessThan(0.02); // within ~1 arcminute
    const when = new Date(sr.input.utc);
    expect(when.getUTCFullYear()).toBe(1922);
    expect(when.getUTCMonth()).toBe(2); // March
  });
});
