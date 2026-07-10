/**
 * Human Design calculator: gates/lines from planetary longitudes on the Rave
 * Mandala, design chart at 88° of solar arc before birth, center definition
 * via the 36 channels, and type / strategy / authority / profile.
 *
 * Anchors validated: Gate 41 begins at 02°00' Aquarius (302°) — the Rave New
 * Year — and 0° Aries falls in Gate 25; Gate 15 begins 28°15' Gemini.
 */
import type { Ayanamsa, Body, NodeType } from "./types";
import { bodyPosition, norm360, utcToJulianDayUT } from "./ephemeris";

/** The 64 gates in mandala order, starting at 302° (2° Aquarius). */
const WHEEL: number[] = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
];
const GATE_SPAN = 360 / 64; // 5.625°
const LINE_SPAN = GATE_SPAN / 6; // 0.9375°
const WHEEL_START = 302; // 2° Aquarius

export type HDCenter =
  | "head" | "ajna" | "throat" | "g" | "ego"
  | "sacral" | "solarPlexus" | "spleen" | "root";

const GATE_CENTER: Record<number, HDCenter> = {
  64: "head", 61: "head", 63: "head",
  47: "ajna", 24: "ajna", 4: "ajna", 17: "ajna", 43: "ajna", 11: "ajna",
  62: "throat", 23: "throat", 56: "throat", 35: "throat", 12: "throat",
  45: "throat", 33: "throat", 8: "throat", 31: "throat", 20: "throat", 16: "throat",
  1: "g", 13: "g", 25: "g", 46: "g", 2: "g", 15: "g", 10: "g", 7: "g",
  21: "ego", 40: "ego", 26: "ego", 51: "ego",
  34: "sacral", 5: "sacral", 14: "sacral", 29: "sacral", 59: "sacral",
  9: "sacral", 3: "sacral", 42: "sacral", 27: "sacral",
  36: "solarPlexus", 22: "solarPlexus", 37: "solarPlexus", 6: "solarPlexus",
  49: "solarPlexus", 55: "solarPlexus", 30: "solarPlexus",
  48: "spleen", 57: "spleen", 44: "spleen", 50: "spleen",
  32: "spleen", 28: "spleen", 18: "spleen",
  58: "root", 38: "root", 54: "root", 53: "root", 60: "root",
  52: "root", 19: "root", 39: "root", 41: "root",
};

const CHANNELS: [number, number][] = [
  [64, 47], [61, 24], [63, 4],
  [17, 62], [43, 23], [11, 56],
  [16, 48], [20, 57], [20, 34], [20, 10], [31, 7], [8, 1], [33, 13],
  [45, 21], [35, 36], [12, 22],
  [10, 34], [10, 57], [15, 5], [2, 14], [46, 29], [25, 51],
  [26, 44], [40, 37],
  [59, 6], [27, 50], [34, 57], [42, 53], [3, 60], [9, 52],
  [32, 54], [28, 38], [18, 58],
  [49, 19], [55, 39], [30, 41],
];

const MOTORS: HDCenter[] = ["sacral", "solarPlexus", "ego", "root"];

export interface GateActivation {
  body: Body | "earth";
  gate: number;
  line: number;
  longitude: number;
}

export interface HumanDesignResult {
  type: "Generator" | "Manifesting Generator" | "Manifestor" | "Projector" | "Reflector";
  strategy: string;
  authority: string;
  profile: string;
  definition: string;
  definedCenters: HDCenter[];
  openCenters: HDCenter[];
  activeChannels: [number, number][];
  personality: GateActivation[];
  design: GateActivation[];
  designUtc: string;
}

export function gateOf(longitude: number): { gate: number; line: number } {
  const offset = norm360(longitude - WHEEL_START);
  const idx = Math.floor(offset / GATE_SPAN) % 64;
  const line = Math.floor((offset - idx * GATE_SPAN) / LINE_SPAN) + 1;
  return { gate: WHEEL[idx], line };
}

const HD_BODIES: Body[] = [
  "sun", "moon", "rahu", "ketu", "mercury", "venus", "mars",
  "jupiter", "saturn", "uranus", "neptune", "pluto",
];

function activations(jdUT: number, opts: { ayanamsa: Ayanamsa; nodeType: NodeType }): GateActivation[] {
  const out: GateActivation[] = [];
  const sun = bodyPosition(jdUT, "sun", { sidereal: false, ...opts });
  out.push({ body: "sun", ...gateOf(sun.longitude), longitude: sun.longitude });
  const earthLon = norm360(sun.longitude + 180);
  out.push({ body: "earth", ...gateOf(earthLon), longitude: earthLon });
  for (const b of HD_BODIES.slice(1)) {
    const p = bodyPosition(jdUT, b, { sidereal: false, ...opts });
    out.push({ body: b, ...gateOf(p.longitude), longitude: p.longitude });
  }
  return out;
}

/** Instant when the Sun was exactly `arc`° earlier than at birth (~88 days). */
function designInstant(birthUtc: string, natalSunLon: number, arc = 88): string {
  const target = norm360(natalSunLon - arc);
  const birthMs = new Date(birthUtc).getTime();
  const diffAt = (ms: number) => {
    const jd = utcToJulianDayUT(new Date(ms).toISOString().replace(/\.\d{3}Z$/, "Z"));
    const lon = bodyPosition(jd, "sun", { sidereal: false, ayanamsa: "lahiri", nodeType: "true" }).longitude;
    let d = (lon - target) % 360;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    return d;
  };
  let lo = birthMs - 100 * 86400e3;
  let hi = birthMs - 80 * 86400e3;
  let dLo = diffAt(lo);
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    const dMid = diffAt(mid);
    if (Math.sign(dMid) === Math.sign(dLo)) { lo = mid; dLo = dMid; } else hi = mid;
    if (hi - lo < 1000) break;
  }
  return new Date((lo + hi) / 2).toISOString().replace(/\.\d{3}Z$/, "Z");
}

export function computeHumanDesign(input: {
  utc: string;
  ayanamsa?: Ayanamsa;
  nodeType?: NodeType;
}): HumanDesignResult {
  const opts = { ayanamsa: input.ayanamsa ?? "lahiri", nodeType: input.nodeType ?? "true" };
  const jdBirth = utcToJulianDayUT(input.utc);
  const personality = activations(jdBirth, opts);
  const natalSun = personality[0].longitude;
  const designUtc = designInstant(input.utc, natalSun);
  const design = activations(utcToJulianDayUT(designUtc), opts);

  const activeGates = new Set([...personality, ...design].map((a) => a.gate));
  const activeChannels = CHANNELS.filter(([a, b]) => activeGates.has(a) && activeGates.has(b));

  const defined = new Set<HDCenter>();
  for (const [a, b] of activeChannels) {
    defined.add(GATE_CENTER[a]);
    defined.add(GATE_CENTER[b]);
  }
  const definedCenters = [...defined];
  const ALL: HDCenter[] = ["head", "ajna", "throat", "g", "ego", "sacral", "solarPlexus", "spleen", "root"];
  const openCenters = ALL.filter((c) => !defined.has(c));

  // Connectivity between defined centers via active channels.
  const adj = new Map<HDCenter, Set<HDCenter>>();
  for (const [a, b] of activeChannels) {
    const ca = GATE_CENTER[a], cb = GATE_CENTER[b];
    (adj.get(ca) ?? adj.set(ca, new Set()).get(ca)!).add(cb);
    (adj.get(cb) ?? adj.set(cb, new Set()).get(cb)!).add(ca);
  }
  const reaches = (from: HDCenter, to: HDCenter): boolean => {
    const seen = new Set<HDCenter>([from]);
    const stack = [from];
    while (stack.length) {
      const c = stack.pop()!;
      if (c === to) return true;
      for (const n of adj.get(c) ?? []) if (!seen.has(n)) { seen.add(n); stack.push(n); }
    }
    return false;
  };
  const motorToThroat = defined.has("throat") && MOTORS.some((m) => defined.has(m) && reaches(m, "throat"));

  // Definition: connected components among defined centers.
  const comps: number = (() => {
    const seen = new Set<HDCenter>();
    let n = 0;
    for (const c of definedCenters) {
      if (seen.has(c)) continue;
      n++;
      const stack = [c];
      seen.add(c);
      while (stack.length) {
        const x = stack.pop()!;
        for (const y of adj.get(x) ?? []) if (!seen.has(y)) { seen.add(y); stack.push(y); }
      }
    }
    return n;
  })();
  const definition =
    comps === 0 ? "None" : comps === 1 ? "Single" : comps === 2 ? "Split" : comps === 3 ? "Triple Split" : "Quadruple Split";

  let type: HumanDesignResult["type"];
  if (definedCenters.length === 0) type = "Reflector";
  else if (defined.has("sacral")) type = motorToThroat ? "Manifesting Generator" : "Generator";
  else if (motorToThroat) type = "Manifestor";
  else type = "Projector";

  const STRATEGY: Record<HumanDesignResult["type"], string> = {
    Generator: "To respond",
    "Manifesting Generator": "To respond, then inform",
    Manifestor: "To inform before acting",
    Projector: "To wait for the invitation",
    Reflector: "To wait a lunar cycle",
  };

  let authority: string;
  if (type === "Reflector") authority = "Lunar (a full cycle of the Moon)";
  else if (defined.has("solarPlexus")) authority = "Emotional — clarity comes in waves, not moments";
  else if (defined.has("sacral")) authority = "Sacral — the gut's yes and no";
  else if (defined.has("spleen")) authority = "Splenic — the quiet first whisper";
  else if (defined.has("ego")) authority = motorToThroat ? "Ego-manifested" : "Ego-projected";
  else if (defined.has("g")) authority = "Self-projected — hear yourself speak it";
  else authority = "Mental (sounding board) — talk it through in the right company";

  const profile = `${personality[0].line}/${design[0].line}`;

  return {
    type,
    strategy: STRATEGY[type],
    authority,
    profile,
    definition,
    definedCenters,
    openCenters,
    activeChannels,
    personality,
    design,
    designUtc,
  };
}
