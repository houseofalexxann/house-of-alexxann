import { describe, expect, it } from "vitest";
import { computeHumanDesign, gateOf } from "../src/humandesign";

describe("Rave Mandala anchors", () => {
  it("Gate 41 begins at 2° Aquarius (Rave New Year)", () => {
    expect(gateOf(302.1).gate).toBe(41);
    expect(gateOf(302.1).line).toBe(1);
    expect(gateOf(301.9).gate).toBe(60); // last gate before the wheel restarts
  });
  it("0° Aries falls in Gate 25; Gate 15 begins 28°15' Gemini", () => {
    expect(gateOf(0.5).gate).toBe(25);
    expect(gateOf(88.3).gate).toBe(15);
    expect(gateOf(88.2).gate).toBe(12);
  });
  it("lines run 1–6 across each 5.625° gate", () => {
    expect(gateOf(302 + 0.9).line).toBe(1);
    expect(gateOf(302 + 1.0).line).toBe(2);
    expect(gateOf(302 + 5.6).line).toBe(6);
  });
});

describe("computeHumanDesign", () => {
  const hd = computeHumanDesign({ utc: "1990-06-15T18:30:00Z" });

  it("returns a valid type/strategy/authority/profile", () => {
    expect(["Generator", "Manifesting Generator", "Manifestor", "Projector", "Reflector"]).toContain(hd.type);
    expect(hd.strategy.length).toBeGreaterThan(3);
    expect(hd.authority.length).toBeGreaterThan(3);
    expect(hd.profile).toMatch(/^[1-6]\/[1-6]$/);
  });

  it("design sun sits 88° behind the natal sun, ~88–91 days earlier", () => {
    const natal = hd.personality[0].longitude;
    const design = hd.design.find((a) => a.body === "sun")!.longitude;
    const arc = ((natal - design) % 360 + 360) % 360;
    expect(Math.abs(arc - 88)).toBeLessThan(0.01);
    const days =
      (Date.parse("1990-06-15T18:30:00Z") - Date.parse(hd.designUtc)) / 86400e3;
    expect(days).toBeGreaterThan(80);
    expect(days).toBeLessThan(100);
  });

  it("earth always opposes the sun (32 gates apart on the wheel)", () => {
    const sun = hd.personality.find((a) => a.body === "sun")!;
    const earth = hd.personality.find((a) => a.body === "earth")!;
    const d = Math.abs(((sun.longitude + 180) % 360) - earth.longitude);
    expect(Math.min(d, 360 - d)).toBeLessThan(1e-9);
  });

  it("13 activations per side; centers partition into defined + open = 9", () => {
    expect(hd.personality).toHaveLength(13);
    expect(hd.design).toHaveLength(13);
    expect(hd.definedCenters.length + hd.openCenters.length).toBe(9);
  });

  it("every active channel has both gates activated", () => {
    const gates = new Set([...hd.personality, ...hd.design].map((a) => a.gate));
    for (const [a, b] of hd.activeChannels) {
      expect(gates.has(a)).toBe(true);
      expect(gates.has(b)).toBe(true);
    }
  });

  it("deterministic", () => {
    const again = computeHumanDesign({ utc: "1990-06-15T18:30:00Z" });
    expect(JSON.stringify(again)).toBe(JSON.stringify(hd));
  });
});
