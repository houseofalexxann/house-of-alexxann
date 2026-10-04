import { describe, expect, it } from "vitest";
import {
  classifyWeather,
  computeChart,
  moonPhase,
  skyWeatherAt,
  weekWeather,
  WEATHER_BODIES,
  WEATHER_CONDITIONS,
  WEATHER_ORBS,
} from "../src/index";

describe("classifyWeather", () => {
  it("reads an empty sky as still", () => {
    const r = classifyWeather({ tension: 0, ease: 0, moonSoft: false });
    expect(r.conditions).toBe("still");
    expect(r.charge).toBe(0);
    expect(r.ease).toBe(0);
    expect(r.activity).toBe(0);
  });

  it("reads a busy, mostly hard sky as turbulent and a lighter hard sky as charged", () => {
    expect(classifyWeather({ tension: 3, ease: 0.5, moonSoft: false }).conditions).toBe("turbulent");
    expect(classifyWeather({ tension: 1, ease: 0.3, moonSoft: false }).conditions).toBe("charged");
  });

  it("reads an easy sky as clear, or tender when the Moon is soft and the day is light", () => {
    expect(classifyWeather({ tension: 0.2, ease: 1.5, moonSoft: false }).conditions).toBe("clear");
    expect(classifyWeather({ tension: 0.2, ease: 1.0, moonSoft: true }).conditions).toBe("tender");
    // A loud easy day is clear even with a soft Moon: tenderness is quiet.
    expect(classifyWeather({ tension: 0.2, ease: 4, moonSoft: true }).conditions).toBe("clear");
  });

  it("reads a mixed sky as shifting", () => {
    expect(classifyWeather({ tension: 1, ease: 1, moonSoft: false }).conditions).toBe("shifting");
  });

  it("keeps every ratio inside 0..1 and charge plus ease at one when anything is happening", () => {
    for (const [t, e] of [[0.1, 0.9], [2, 2], [5, 0], [0, 5]]) {
      const r = classifyWeather({ tension: t, ease: e, moonSoft: false });
      expect(r.charge).toBeGreaterThanOrEqual(0);
      expect(r.charge).toBeLessThanOrEqual(1);
      expect(r.ease).toBeGreaterThanOrEqual(0);
      expect(r.ease).toBeLessThanOrEqual(1);
      expect(r.activity).toBeGreaterThan(0);
      expect(r.activity).toBeLessThan(1);
      expect(r.charge + r.ease).toBeCloseTo(1, 9);
    }
  });
});

describe("skyWeatherAt", () => {
  const MOMENT = "2026-09-30T12:00:00Z";
  const w = skyWeatherAt(MOMENT);

  it("returns every watched body with positions that match the chart engine", () => {
    expect(w.planets.map((p) => p.body)).toEqual([...WEATHER_BODIES]);
    const chart = computeChart({ system: "western", utc: MOMENT, latitude: 0, longitude: 0, timeKnown: false });
    for (const p of w.planets) {
      const ref = chart.planets.find((q) => q.body === p.body)!;
      expect(p.longitude).toBeCloseTo(ref.longitude, 6);
      expect(p.sign).toBe(ref.sign);
      expect(p.retrograde).toBe(ref.retrograde);
    }
  });

  it("agrees with the engine's own moon phase", () => {
    const sun = w.planets.find((p) => p.body === "sun")!;
    const moon = w.planets.find((p) => p.body === "moon")!;
    const ref = moonPhase(sun.longitude, moon.longitude);
    expect(w.moon.phase).toBe(ref.phase);
    expect(w.moon.illumination).toBeCloseTo(ref.illumination, 9);
    expect(w.moon.sign).toBe(moon.sign);
  });

  it("only reports contacts inside the forecast orbs, heaviest first", () => {
    for (const a of w.aspects) {
      const lunar = a.a === "moon" || a.b === "moon";
      const limit = WEATHER_ORBS[a.type] + (lunar ? 2 : 0);
      expect(a.orb).toBeLessThanOrEqual(limit);
      expect(a.weight).toBeGreaterThan(0);
      expect(["tension", "ease"]).toContain(a.nature);
    }
    for (let i = 1; i < w.aspects.length; i++) {
      expect(w.aspects[i - 1].weight).toBeGreaterThanOrEqual(w.aspects[i].weight);
    }
  });

  it("classifies into one of the named conditions with ratios in range", () => {
    expect(WEATHER_CONDITIONS).toContain(w.conditions);
    expect(w.charge).toBeGreaterThanOrEqual(0);
    expect(w.charge).toBeLessThanOrEqual(1);
    expect(w.activity).toBeGreaterThanOrEqual(0);
    expect(w.activity).toBeLessThanOrEqual(1);
    expect(w.utc).toBe(MOMENT);
  });

  it("never lists the Sun or Moon as retrograde", () => {
    expect(w.retrogrades).not.toContain("sun");
    expect(w.retrogrades).not.toContain("moon");
  });
});

describe("weekWeather", () => {
  const week = weekWeather("2026-09-30T15:30:00Z", 7);

  it("returns seven consecutive UTC dates, each read at noon", () => {
    expect(week).toHaveLength(7);
    expect(week[0].date).toBe("2026-09-30");
    expect(week[6].date).toBe("2026-10-06");
    for (const d of week) expect(d.utc.endsWith("T12:00:00Z")).toBe(true);
  });

  it("keeps the Moon moving through the signs in order", () => {
    // The Moon covers a sign in about two and a half days; across a week the
    // sign index only ever steps forward (mod 12) or stays.
    for (let i = 1; i < week.length; i++) {
      const step = (week[i].moon.sign - week[i - 1].moon.sign + 12) % 12;
      expect(step).toBeLessThanOrEqual(1);
    }
  });

  it("reports lunations exactly on the days the phase name says so", () => {
    for (const d of week) {
      const lunation = d.highlights.find((h) => h.kind === "lunation");
      const named = d.moon.phase === "New Moon" || d.moon.phase === "Full Moon";
      expect(!!lunation).toBe(named);
      if (lunation) expect(lunation.phase).toBe(d.moon.phase === "New Moon" ? "new moon" : "full moon");
    }
  });

  it("marks an ingress only when the sign actually changed since the day before", () => {
    for (let i = 1; i < week.length; i++) {
      for (const h of week[i].highlights.filter((x) => x.kind === "ingress")) {
        const was = week[i - 1].planets.find((p) => p.body === h.body)!;
        const now = week[i].planets.find((p) => p.body === h.body)!;
        expect(was.sign).not.toBe(now.sign);
        expect(h.sign).toBe(now.sign);
      }
    }
  });

  it("finds at least one lunation and one Moon sign change over a longer run", () => {
    const month = weekWeather("2026-09-30T00:00:00Z", 30);
    expect(month.some((d) => d.highlights.some((h) => h.kind === "lunation"))).toBe(true);
    expect(new Set(month.map((d) => d.moon.sign)).size).toBeGreaterThan(5);
  });
});
