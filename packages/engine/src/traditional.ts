/**
 * Traditional / Hellenistic depth: sect, essential dignities, moon phase,
 * and aspects to the angles. Grounded in the Ptolemaic/Abu Ma'shar scheme
 * used across Hellenistic and later traditional astrology. All derived from
 * positions the core already computes, so it stays deterministic.
 */
import type {
  AngleAspect,
  Angles,
  AspectType,
  Body,
  Dignity,
  MoonPhase,
  PlanetDignity,
  PlanetPosition,
  SectInfo,
} from "./types";
import { ASPECT_ANGLES, DEFAULT_ORBS } from "./constants";
import { separation } from "./aspects";

/** Domicile (rulership) by sign index 0=Aries…11=Pisces — traditional 7. */
const DOMICILE: Record<number, Body[]> = {
  0: ["mars"], 1: ["venus"], 2: ["mercury"], 3: ["moon"], 4: ["sun"],
  5: ["mercury"], 6: ["venus"], 7: ["mars"], 8: ["jupiter"], 9: ["saturn"],
  10: ["saturn"], 11: ["jupiter"],
};

/** Exaltation sign by planet. */
const EXALTATION: Partial<Record<Body, number>> = {
  sun: 0, // Aries
  moon: 1, // Taurus
  mercury: 5, // Virgo
  venus: 11, // Pisces
  mars: 9, // Capricorn
  jupiter: 3, // Cancer
  saturn: 6, // Libra
};

/** The traditional seven; outer planets & nodes are peregrine here. */
const TRADITIONAL: Body[] = [
  "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn",
];

const RULER_OF_SIGN: Record<number, Body> = {
  0: "mars", 1: "venus", 2: "mercury", 3: "moon", 4: "sun", 5: "mercury",
  6: "venus", 7: "mars", 8: "jupiter", 9: "saturn", 10: "saturn", 11: "jupiter",
};

function opposite(sign: number): number {
  return (sign + 6) % 12;
}

/** Essential dignity of a planet by the sign it occupies. */
export function dignityOf(body: Body, sign: number): Dignity {
  if (!TRADITIONAL.includes(body)) return "peregrine";
  if (DOMICILE[sign]?.includes(body)) return "domicile";
  if (EXALTATION[body] === sign) return "exaltation";
  // Detriment: sign opposite a domicile of this planet.
  const domiciles = Object.entries(DOMICILE)
    .filter(([, rulers]) => rulers.includes(body))
    .map(([s]) => Number(s));
  if (domiciles.some((d) => opposite(d) === sign)) return "detriment";
  // Fall: sign opposite the exaltation.
  if (EXALTATION[body] !== undefined && opposite(EXALTATION[body]!) === sign)
    return "fall";
  return "peregrine";
}

export function dignities(planets: PlanetPosition[]): PlanetDignity[] {
  return planets
    .filter((p) => TRADITIONAL.includes(p.body))
    .map((p) => ({
      body: p.body,
      sign: p.sign,
      dignity: dignityOf(p.body, p.sign),
      rulerOfSign: RULER_OF_SIGN[p.sign],
    }));
}

const PHASE_NAMES = [
  "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
  "Full Moon", "Waning Gibbous (Disseminating)", "Last Quarter",
  "Waning Crescent (Balsamic)",
];

/**
 * Natal moon phase from the Sun–Moon elongation (zodiac-independent).
 * Phases are centered so New ≈ 0° and Full ≈ 180°.
 */
export function moonPhase(sunLon: number, moonLon: number): MoonPhase {
  const elongation = ((moonLon - sunLon) % 360 + 360) % 360;
  const index = Math.floor(((elongation + 22.5) % 360) / 45) % 8;
  const illumination = (1 - Math.cos((elongation * Math.PI) / 180)) / 2;
  return {
    elongation,
    phase: PHASE_NAMES[index],
    waxing: elongation < 180,
    illumination,
  };
}

/** Sect: day chart if the Sun is above the horizon (houses 7–12). */
export function sectOf(planets: PlanetPosition[]): SectInfo | null {
  const sun = planets.find((p) => p.body === "sun");
  if (!sun || sun.house === null) return null; // needs a known birth time
  const isDay = sun.house >= 7 && sun.house <= 12;

  const diurnal: Body[] = ["sun", "jupiter", "saturn"];
  const nocturnal: Body[] = ["moon", "venus", "mars"];

  // Mercury takes the sect of the hemisphere it rises in: oriental
  // (rising before the Sun) → diurnal, occidental → nocturnal.
  const merc = planets.find((p) => p.body === "mercury");
  if (merc) {
    let d = (merc.longitude - sun.longitude) % 360;
    if (d > 180) d -= 360;
    if (d < 180 && d > -180) (d < 0 ? diurnal : nocturnal).push("mercury");
  }

  const inSect: Partial<Record<Body, boolean>> = {};
  for (const b of diurnal) inSect[b] = isDay;
  for (const b of nocturnal) inSect[b] = !isDay;

  return {
    sect: isDay ? "day" : "night",
    lightLeader: isDay ? "sun" : "moon",
    beneficOfSect: isDay ? "jupiter" : "venus",
    maleficContraryToSect: isDay ? "mars" : "saturn",
    inSect,
  };
}

/** Ptolemaic aspects between each planet and the Ascendant / Midheaven. */
export function aspectsToAngles(
  planets: PlanetPosition[],
  angles: Angles | null,
  orbOverrides?: Partial<Record<AspectType, number>>
): AngleAspect[] {
  if (!angles) return [];
  const orbs = { ...DEFAULT_ORBS, ...orbOverrides };
  const targets: { name: "ascendant" | "midheaven"; lon: number }[] = [
    { name: "ascendant", lon: angles.ascendant },
    { name: "midheaven", lon: angles.midheaven },
  ];
  const out: AngleAspect[] = [];
  for (const p of planets) {
    if (p.body === "rahu" || p.body === "ketu") continue;
    for (const target of targets) {
      const sep = separation(p.longitude, target.lon);
      let best: AngleAspect | null = null;
      for (const [type, exact] of Object.entries(ASPECT_ANGLES) as [
        AspectType,
        number
      ][]) {
        const orb = Math.abs(sep - exact);
        if (orb <= orbs[type] && (best === null || orb < best.orb)) {
          best = { planet: p.body, angle: target.name, type, orb };
        }
      }
      if (best) out.push(best);
    }
  }
  return out.sort((a, b) => a.orb - b.orb);
}
