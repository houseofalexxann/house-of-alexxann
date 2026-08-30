import { describe, expect, it } from "vitest";
import {
  annualProfection,
  computeChart,
  profectionSeries,
  scanSkyEvents,
  scanTransits,
  wholeSignHouse,
  SIGN_RULER,
  type NatalSnapshot,
} from "../src/index";

/** Reference natal chart used across the suite (Dallas, 1992-09-30 17:59). */
const NATAL = computeChart({
  system: "western",
  utc: "1992-09-30T22:59:00Z",
  latitude: 32.7767,
  longitude: -96.797,
  houseSystem: "whole-sign",
});

function snapshot(): NatalSnapshot {
  return {
    utc: "1992-09-30T22:59:00Z",
    ascendantSign: NATAL.angles!.ascendantSign,
    points: [
      ...NATAL.planets.map((p) => ({ point: p.body, longitude: p.longitude })),
      { point: "ascendant" as const, longitude: NATAL.angles!.ascendant },
      { point: "midheaven" as const, longitude: NATAL.angles!.midheaven },
    ],
  };
}

describe("whole-sign houses", () => {
  it("puts the rising sign in the first house", () => {
    expect(wholeSignHouse(5, 0)).toBe(1);
    expect(wholeSignHouse(35, 0)).toBe(2);
    expect(wholeSignHouse(355, 0)).toBe(12);
  });

  it("counts from the ascendant sign, not from Aries", () => {
    // Ascendant in Leo (4): Leo = 1st, Virgo = 2nd, Cancer = 12th.
    expect(wholeSignHouse(125, 4)).toBe(1);
    expect(wholeSignHouse(155, 4)).toBe(2);
    expect(wholeSignHouse(95, 4)).toBe(12);
  });
});

describe("annual profections (Hellenistic; Valens, Paulus; cf. Brennan 2017)", () => {
  it("returns to the first house every twelve years", () => {
    for (const age of [0, 12, 24, 36, 48, 60]) {
      const on = `${1992 + age}-10-01T00:00:00Z`;
      const p = annualProfection("1992-09-30T22:59:00Z", on, 0);
      expect(p.age).toBe(age);
      expect(p.house).toBe(1);
    }
  });

  it("advances one whole sign per year of life", () => {
    const asc = 0; // Aries rising
    const houses = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    houses.forEach((expected, i) => {
      const p = annualProfection("1992-09-30T22:59:00Z", `${1992 + i}-10-05T00:00:00Z`, asc);
      expect(p.house).toBe(expected);
      expect(p.sign).toBe(i % 12);
    });
  });

  it("names the domicile ruler of the profected sign as Lord of the Year", () => {
    // Aries rising, age 1 → 2nd house → Taurus → Venus.
    const p = annualProfection("1992-09-30T22:59:00Z", "1993-10-05T00:00:00Z", 0);
    expect(p.signName).toBe("Taurus");
    expect(p.lordOfYear).toBe("venus");
    // Age 9 → 10th house → Capricorn → Saturn.
    const q = annualProfection("1992-09-30T22:59:00Z", "2001-10-05T00:00:00Z", 0);
    expect(q.house).toBe(10);
    expect(q.lordOfYear).toBe("saturn");
  });

  it("uses the birthday, not January, as the year boundary", () => {
    const birth = "1992-09-30T22:59:00Z";
    const before = annualProfection(birth, "2026-09-29T00:00:00Z", 0);
    const after = annualProfection(birth, "2026-10-01T00:00:00Z", 0);
    expect(after.age).toBe(before.age + 1);
    expect(after.house).toBe((before.house % 12) + 1);
  });

  it("locates the Lord of the Year in the natal chart when given one", () => {
    const p = annualProfection(
      "1992-09-30T22:59:00Z",
      "2026-10-05T00:00:00Z",
      NATAL.angles!.ascendantSign,
      snapshot().points
    );
    expect(p.lordNatalHouse).toBeGreaterThanOrEqual(1);
    expect(p.lordNatalHouse).toBeLessThanOrEqual(12);
    expect(p.lordNatalSignName).toBeTruthy();
  });

  it("produces a continuous series with no gaps between years", () => {
    const series = profectionSeries("1992-09-30T22:59:00Z", "2026-01-01T00:00:00Z", 0, 3);
    expect(series).toHaveLength(3);
    expect(series[1].age).toBe(series[0].age + 1);
    expect(new Date(series[1].startUtc).getTime()).toBe(new Date(series[0].endUtc).getTime());
  });

  it("keeps the traditional rulership table intact", () => {
    expect(SIGN_RULER[0]).toBe("mars"); // Aries
    expect(SIGN_RULER[4]).toBe("sun"); // Leo
    expect(SIGN_RULER[3]).toBe("moon"); // Cancer
    expect(SIGN_RULER[10]).toBe("saturn"); // Aquarius, traditionally Saturn
    expect(SIGN_RULER[11]).toBe("jupiter"); // Pisces, traditionally Jupiter
  });
});

describe("transit scanning", () => {
  it("finds the solar return within a day or two of the birthday", () => {
    // The return drifts off the calendar birthday by up to ~a day and a half
    // as leap years and the tropical year fall out of step, so 34 years on
    // this one lands Oct 1 rather than Sep 30. The window allows for that;
    // the exact instant is what computeSolarReturn is for.
    const events = scanTransits(snapshot(), "2026-09-20T00:00:00Z", "2026-10-10T00:00:00Z", {
      bodies: ["sun"],
      aspects: ["conjunction"],
      natalPoints: ["sun"],
      includeStations: false,
      includeLunations: false,
      includeIngresses: false,
    });
    expect(events).toHaveLength(1);
    const when = new Date(events[0].utc).getTime();
    expect(when).toBeGreaterThan(new Date("2026-09-29T00:00:00Z").getTime());
    expect(when).toBeLessThan(new Date("2026-10-02T00:00:00Z").getTime());
  });

  it("returns events in chronological order", () => {
    const events = scanTransits(snapshot(), "2026-01-01T00:00:00Z", "2026-04-01T00:00:00Z", {
      bodies: ["mars", "jupiter"],
    });
    const times = events.map((e) => new Date(e.utc).getTime());
    expect([...times].sort((a, b) => a - b)).toEqual(times);
  });

  it("finds twelve-ish lunations in a season and labels both phases", () => {
    const events = scanTransits(snapshot(), "2026-01-01T00:00:00Z", "2026-04-01T00:00:00Z", {
      bodies: [],
      includeStations: false,
      includeIngresses: false,
    });
    // Eclipses are lunations too — this window holds the Feb 17 solar and
    // Mar 3 lunar eclipses, which correctly arrive as eclipse events rather
    // than plain lunations.
    const lunations = events.filter((e) => e.kind === "lunation" || e.kind === "eclipse");
    // Three months ≈ 3 new + 3 full moons.
    expect(lunations.length).toBeGreaterThanOrEqual(5);
    expect(lunations.length).toBeLessThanOrEqual(8);
    expect(lunations.some((l) => l.phase === "new moon")).toBe(true);
    expect(lunations.some((l) => l.phase === "full moon")).toBe(true);
    expect(lunations.filter((l) => l.kind === "eclipse")).toHaveLength(2);
    for (const l of lunations) {
      expect(l.natalHouse).toBeGreaterThanOrEqual(1);
      expect(l.natalHouse).toBeLessThanOrEqual(12);
    }
  });

  it("catches Mercury stationing retrograde and direct", () => {
    const events = scanTransits(snapshot(), "2026-01-01T00:00:00Z", "2026-12-31T00:00:00Z", {
      bodies: ["mercury"],
      aspects: [],
      natalPoints: [],
      includeLunations: false,
      includeIngresses: false,
    });
    const stations = events.filter((e) => e.kind === "station");
    // Mercury turns retrograde three times most years, so ~6 stations.
    expect(stations.length).toBeGreaterThanOrEqual(4);
    expect(stations.some((s) => s.station === "retrograde")).toBe(true);
    expect(stations.some((s) => s.station === "direct")).toBe(true);
  });

  it("flags modern planets as modern and traditional ones as not", () => {
    const events = scanTransits(snapshot(), "2026-01-01T00:00:00Z", "2026-06-01T00:00:00Z", {
      bodies: ["saturn", "pluto"],
      includeLunations: false,
    });
    for (const e of events) {
      expect(e.modern).toBe(e.transiting === "pluto");
    }
  });

  it("returns nothing for an inverted range", () => {
    expect(scanTransits(snapshot(), "2026-06-01T00:00:00Z", "2026-01-01T00:00:00Z")).toEqual([]);
  });
});

describe("eclipses (Swiss Ephemeris eclipse search, never estimated)", () => {
  it("finds all four documented 2026 eclipses with correct types", () => {
    const events = scanTransits(snapshot(), "2026-01-01T00:00:00Z", "2026-12-31T23:59:00Z", {
      bodies: [],
      natalPoints: [],
      includeStations: false,
      includeIngresses: false,
      includeLunations: false,
      includeCazimi: false,
    });
    const eclipses = events.filter((e) => e.kind === "eclipse");
    expect(eclipses).toHaveLength(4);

    const byDate = (d: string) => eclipses.find((e) => e.utc.startsWith(d));
    // Feb 17: annular solar. Mar 3: total lunar.
    expect(byDate("2026-02-17")?.eclipseType).toBe("annular");
    expect(byDate("2026-02-17")?.phase).toBe("new moon");
    expect(byDate("2026-03-03")?.eclipseType).toBe("total");
    expect(byDate("2026-03-03")?.phase).toBe("full moon");
    // Aug 12: total solar. Aug 28: partial lunar.
    expect(byDate("2026-08-12")?.eclipseType).toBe("total");
    expect(byDate("2026-08-12")?.phase).toBe("new moon");
    expect(byDate("2026-08-28")?.eclipseType).toBe("partial");
    expect(byDate("2026-08-28")?.phase).toBe("full moon");
  });

  it("does not also emit a plain lunation for an eclipse moment", () => {
    const events = scanTransits(snapshot(), "2026-08-01T00:00:00Z", "2026-08-31T23:59:00Z", {
      bodies: [],
      natalPoints: [],
      includeStations: false,
      includeIngresses: false,
      includeCazimi: false,
    });
    const eclipses = events.filter((e) => e.kind === "eclipse");
    const lunations = events.filter((e) => e.kind === "lunation");
    expect(eclipses).toHaveLength(2); // Aug 12 solar + Aug 28 lunar
    // No lunation within half a day of either eclipse.
    for (const ec of eclipses) {
      const t = new Date(ec.utc).getTime();
      expect(
        lunations.some((l) => Math.abs(new Date(l.utc).getTime() - t) < 43_200_000)
      ).toBe(false);
    }
  });
});

describe("cazimi (exact conjunction with the Sun)", () => {
  it("finds Mercury's ~6 solar conjunctions in a year, alternating inferior/superior", () => {
    const events = scanTransits(snapshot(), "2026-01-01T00:00:00Z", "2026-12-31T23:59:00Z", {
      bodies: ["mercury"],
      natalPoints: [],
      aspects: [],
      includeStations: false,
      includeIngresses: false,
      includeLunations: false,
      includeEclipses: false,
    });
    const cazimi = events.filter((e) => e.kind === "cazimi");
    // Mercury's synodic period is ~116 days → 6-7 conjunctions per year.
    expect(cazimi.length).toBeGreaterThanOrEqual(5);
    expect(cazimi.length).toBeLessThanOrEqual(7);
    expect(cazimi.some((c) => c.conjunction === "inferior")).toBe(true);
    expect(cazimi.some((c) => c.conjunction === "superior")).toBe(true);
    // Consecutive conjunctions alternate inferior/superior.
    for (let i = 1; i < cazimi.length; i++) {
      expect(cazimi[i].conjunction).not.toBe(cazimi[i - 1].conjunction);
    }
  });

  it("scanSkyEvents returns mundane events with no natal houses", () => {
    const events = scanSkyEvents("2026-08-01T00:00:00Z", "2026-08-31T23:59:00Z", {
      bodies: ["mercury", "venus", "mars", "jupiter", "saturn"],
    });
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((e) => e.natalHouse === undefined)).toBe(true);
    expect(events.some((e) => e.kind === "eclipse")).toBe(true);
  });
});
