/**
 * Personal timing: annual profections and transits to the natal chart.
 *
 * Techniques and their provenance, kept honest because the House cites its
 * sources:
 *
 * - ANNUAL PROFECTION is a Hellenistic time-lord technique. Each year of life
 *   advances one whole sign from the Ascendant; the ruler of the profected
 *   sign becomes the Lord of the Year. Attested in Vettius Valens
 *   (2nd c. CE) and Paulus Alexandrinus (4th c. CE); reconstructed for modern
 *   practice by Project Hindsight and taught extensively by Chris Brennan
 *   (Hellenistic Astrology: The Study of Fate and Fortune, 2017) and on The
 *   Astrology Podcast. HISTORICAL DOCTRINE.
 *
 * - TRANSITS to natal placements are the oldest continuously practiced
 *   technique in the tradition; the aspects used here are the five Ptolemaic
 *   configurations (conjunction, sextile, square, trine, opposition), which
 *   is what traditional practice recognizes. HISTORICAL DOCTRINE. The
 *   modern planets (Uranus, Neptune, Pluto) are labeled as modern additions
 *   wherever they appear, because they are.
 *
 * Every position here is computed from the Swiss Ephemeris — no
 * interpretation is invented in this module. Meaning is applied one layer up,
 * clearly labeled.
 */
import type { AspectType, Ayanamsa, Body, NodeType } from "./types";
import { bodyPosition, eclipsesBetween, norm360, utcToJulianDayUT } from "./ephemeris";
import { SIGN_NAMES } from "./constants";

/** Traditional (Hellenistic) domicile ruler of each sign, 0 = Aries. */
export const SIGN_RULER: readonly Body[] = [
  "mars", "venus", "mercury", "moon", "sun", "mercury",
  "venus", "mars", "jupiter", "saturn", "saturn", "jupiter",
] as const;

/** The seven visible planets of traditional practice. */
export const TRADITIONAL_PLANETS: readonly Body[] = [
  "sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn",
] as const;

/** Planets added after the telescope; flagged as modern wherever used. */
export const MODERN_PLANETS: readonly Body[] = ["uranus", "neptune", "pluto"] as const;

const ASPECT_ANGLE: Record<AspectType, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

export type NatalPoint = Body | "ascendant" | "midheaven";

export interface ProfectionYear {
  /** Completed years of life at the start of this profected year. */
  age: number;
  /** Whole-sign house activated, 1–12. */
  house: number;
  /** Profected sign index, 0 = Aries. */
  sign: number;
  signName: string;
  /** Domicile ruler of the profected sign: the Lord of the Year. */
  lordOfYear: Body;
  /** Where that lord sits in the natal chart, when the chart is supplied. */
  lordNatalSign?: number;
  lordNatalSignName?: string;
  lordNatalHouse?: number;
  /** The birthday-to-birthday window this profection governs (UTC ISO). */
  startUtc: string;
  endUtc: string;
}

export interface TransitEvent {
  kind: "aspect" | "station" | "lunation" | "ingress" | "eclipse" | "cazimi";
  /** Exact moment, UTC ISO (to the minute). */
  utc: string;
  transiting: Body;
  /** Set for kind === "aspect". */
  aspect?: AspectType;
  natalPoint?: NatalPoint;
  /** Whole-sign natal house the transiting body occupies at the event. */
  natalHouse?: number;
  /** Set for kind === "station": the state it turns into. */
  station?: "retrograde" | "direct";
  /** Set for kind === "lunation" and kind === "eclipse" (a solar eclipse is
   *  a new moon; a lunar eclipse is a full moon). */
  phase?: "new moon" | "full moon";
  /** Set for kind === "eclipse": the Swiss Ephemeris eclipse classification. */
  eclipseType?: "total" | "annular" | "partial" | "penumbral" | "hybrid";
  /** Set for kind === "cazimi" on Mercury/Venus: which conjunction this is.
   *  Inferior (retrograde, between Earth and Sun) or superior (far side). */
  conjunction?: "inferior" | "superior";
  /** Set for kind === "ingress": the sign entered. */
  sign?: number;
  signName?: string;
  /** True when a modern (post-telescopic) planet is involved. */
  modern: boolean;
}

export interface NatalSnapshot {
  /** Natal longitudes for every point we can aspect. */
  points: { point: NatalPoint; longitude: number }[];
  /** Ascendant sign, for whole-sign houses. */
  ascendantSign: number;
  /** Birth moment, UTC ISO. */
  utc: string;
}

export interface TransitScanOptions {
  bodies?: Body[];
  aspects?: AspectType[];
  /** Points in the natal chart to scan against. */
  natalPoints?: NatalPoint[];
  includeStations?: boolean;
  includeLunations?: boolean;
  includeIngresses?: boolean;
  includeEclipses?: boolean;
  includeCazimi?: boolean;
  /** Bodies checked for cazimi. Defaults to the classical five among
   *  `bodies`; set explicitly to decouple from the aspect-scan list. */
  cazimiBodies?: Body[];
  /** Ephemeris settings; defaults to tropical + true node. */
  sidereal?: boolean;
  ayanamsa?: Ayanamsa;
  nodeType?: NodeType;
  /** Safety cap on returned events. */
  maxEvents?: number;
}

const DAY_MS = 86_400_000;

function isoOf(ms: number): string {
  return new Date(Math.round(ms / 60_000) * 60_000).toISOString().replace(/\.\d{3}Z$/, "Z");
}

function lonAt(ms: number, body: Body, opts: Required<Pick<TransitScanOptions, "sidereal" | "ayanamsa" | "nodeType">>): number {
  const jd = utcToJulianDayUT(new Date(ms).toISOString());
  return bodyPosition(jd, body, {
    sidereal: opts.sidereal,
    ayanamsa: opts.ayanamsa,
    nodeType: opts.nodeType,
  }).longitude;
}

function speedAt(ms: number, body: Body, opts: Required<Pick<TransitScanOptions, "sidereal" | "ayanamsa" | "nodeType">>): number {
  const jd = utcToJulianDayUT(new Date(ms).toISOString());
  return bodyPosition(jd, body, {
    sidereal: opts.sidereal,
    ayanamsa: opts.ayanamsa,
    nodeType: opts.nodeType,
  }).speed;
}

/** Signed angular difference in (-180, 180]. */
function signedDelta(a: number, b: number): number {
  let d = norm360(a - b);
  if (d > 180) d -= 360;
  return d;
}

/** Whole-sign house (1–12) of a longitude, counting from the rising sign. */
export function wholeSignHouse(longitude: number, ascendantSign: number): number {
  const sign = Math.floor(norm360(longitude) / 30);
  return ((sign - ascendantSign + 12) % 12) + 1;
}

/**
 * The annual profection for a given date.
 *
 * The profected year runs birthday to birthday: age N activates the (N mod 12)
 * + 1 whole-sign house from the Ascendant, and that sign's domicile ruler is
 * the Lord of the Year (Valens; Paulus; see Brennan 2017, ch. on annual
 * profections).
 */
export function annualProfection(
  birthUtc: string,
  onUtc: string,
  ascendantSign: number,
  natal?: { point: NatalPoint; longitude: number }[]
): ProfectionYear {
  const birth = new Date(birthUtc);
  const on = new Date(onUtc);

  // Completed years, counted on the birthday in UTC.
  let age = on.getUTCFullYear() - birth.getUTCFullYear();
  const anniversaryThisYear = Date.UTC(
    on.getUTCFullYear(),
    birth.getUTCMonth(),
    birth.getUTCDate(),
    birth.getUTCHours(),
    birth.getUTCMinutes(),
    birth.getUTCSeconds()
  );
  if (on.getTime() < anniversaryThisYear) age -= 1;

  const startYear = on.getTime() < anniversaryThisYear ? on.getUTCFullYear() - 1 : on.getUTCFullYear();
  const startUtc = new Date(
    Date.UTC(
      startYear,
      birth.getUTCMonth(),
      birth.getUTCDate(),
      birth.getUTCHours(),
      birth.getUTCMinutes(),
      birth.getUTCSeconds()
    )
  );
  const endUtc = new Date(
    Date.UTC(
      startYear + 1,
      birth.getUTCMonth(),
      birth.getUTCDate(),
      birth.getUTCHours(),
      birth.getUTCMinutes(),
      birth.getUTCSeconds()
    )
  );

  const house = (((age % 12) + 12) % 12) + 1;
  const sign = (ascendantSign + house - 1) % 12;
  const lordOfYear = SIGN_RULER[sign];

  const lord = natal?.find((p) => p.point === lordOfYear);
  const lordNatalSign = lord ? Math.floor(norm360(lord.longitude) / 30) : undefined;

  return {
    age,
    house,
    sign,
    signName: SIGN_NAMES[sign],
    lordOfYear,
    lordNatalSign,
    lordNatalSignName: lordNatalSign !== undefined ? SIGN_NAMES[lordNatalSign] : undefined,
    lordNatalHouse: lord ? wholeSignHouse(lord.longitude, ascendantSign) : undefined,
    startUtc: startUtc.toISOString().replace(/\.\d{3}Z$/, "Z"),
    endUtc: endUtc.toISOString().replace(/\.\d{3}Z$/, "Z"),
  };
}

/** Twelve profections from a given age, for the year-ahead view. */
export function profectionSeries(
  birthUtc: string,
  fromUtc: string,
  ascendantSign: number,
  count: number,
  natal?: { point: NatalPoint; longitude: number }[]
): ProfectionYear[] {
  const out: ProfectionYear[] = [];
  let cursor = new Date(fromUtc);
  for (let i = 0; i < count; i++) {
    const p = annualProfection(birthUtc, cursor.toISOString(), ascendantSign, natal);
    out.push(p);
    cursor = new Date(new Date(p.endUtc).getTime() + DAY_MS);
  }
  return out;
}

/** Step size in days for scanning each body — fast bodies need finer steps. */
function stepDaysFor(body: Body): number {
  switch (body) {
    case "moon":
      return 0.1;
    case "mercury":
    case "venus":
    case "sun":
      return 0.5;
    case "mars":
      return 1;
    default:
      return 2;
  }
}

/**
 * Scan a date range for transit events against a natal chart.
 *
 * Aspects are found by sampling the signed difference from exactness and
 * bisecting every sign change, so each event carries a real timestamp rather
 * than a day-level guess.
 */
export function scanTransits(
  natal: NatalSnapshot,
  fromUtc: string,
  toUtc: string,
  options: TransitScanOptions = {}
): TransitEvent[] {
  const opts = {
    sidereal: options.sidereal ?? false,
    ayanamsa: options.ayanamsa ?? ("lahiri" as Ayanamsa),
    nodeType: options.nodeType ?? ("true" as NodeType),
  };
  const bodies = options.bodies ?? [
    "sun", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto",
  ];
  const aspects = options.aspects ?? (["conjunction", "sextile", "square", "trine", "opposition"] as AspectType[]);
  const natalPoints =
    options.natalPoints ??
    (["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "ascendant", "midheaven"] as NatalPoint[]);
  const maxEvents = options.maxEvents ?? 600;

  const start = new Date(fromUtc).getTime();
  const end = new Date(toUtc).getTime();
  if (!(end > start)) return [];

  const events: TransitEvent[] = [];
  const targets = natal.points.filter((p) => natalPoints.includes(p.point));

  // ——— eclipses: found by the Swiss Ephemeris itself, never estimated ———
  // Computed before lunations so that an ordinary new/full moon row is not
  // also emitted for a moment that is actually an eclipse.
  const eclipseMs: number[] = [];
  if (options.includeEclipses ?? true) {
    for (const ec of eclipsesBetween(fromUtc, toUtc)) {
      const ms = new Date(ec.utc).getTime();
      eclipseMs.push(ms);
      const moonLon = lonAt(ms, "moon", opts);
      events.push({
        kind: "eclipse",
        utc: ec.utc,
        transiting: ec.kind === "solar" ? "sun" : "moon",
        phase: ec.kind === "solar" ? "new moon" : "full moon",
        eclipseType: ec.type,
        sign: Math.floor(norm360(moonLon) / 30),
        signName: SIGN_NAMES[Math.floor(norm360(moonLon) / 30)],
        natalHouse: wholeSignHouse(moonLon, natal.ascendantSign),
        modern: false,
      });
    }
  }

  for (const body of bodies) {
    const modern = (MODERN_PLANETS as readonly string[]).includes(body);
    const stepMs = stepDaysFor(body) * DAY_MS;

    // ——— aspects to natal points ———
    for (const target of targets) {
      for (const aspect of aspects) {
        const wanted = ASPECT_ANGLE[aspect];
        let prevMs = start;
        let prevDelta = signedDelta(lonAt(prevMs, body, opts), target.longitude + wanted);
        for (let ms = start + stepMs; ms <= end; ms += stepMs) {
          const delta = signedDelta(lonAt(ms, body, opts), target.longitude + wanted);
          // A crossing of exactness: sign flip without wrapping the far side.
          if (prevDelta !== 0 && Math.sign(delta) !== Math.sign(prevDelta) && Math.abs(delta - prevDelta) < 180) {
            let lo = prevMs;
            let hi = ms;
            let loD = prevDelta;
            for (let i = 0; i < 40 && hi - lo > 30_000; i++) {
              const mid = (lo + hi) / 2;
              const midD = signedDelta(lonAt(mid, body, opts), target.longitude + wanted);
              if (Math.sign(midD) === Math.sign(loD)) {
                lo = mid;
                loD = midD;
              } else {
                hi = mid;
              }
            }
            const exact = (lo + hi) / 2;
            events.push({
              kind: "aspect",
              utc: isoOf(exact),
              transiting: body,
              aspect,
              natalPoint: target.point,
              natalHouse: wholeSignHouse(lonAt(exact, body, opts), natal.ascendantSign),
              modern,
            });
            if (events.length >= maxEvents) return sortEvents(events);
          }
          prevMs = ms;
          prevDelta = delta;
        }
      }
    }

    // ——— retrograde stations ———
    if ((options.includeStations ?? true) && body !== "sun" && body !== "moon") {
      let prevMs = start;
      let prevSpeed = speedAt(prevMs, body, opts);
      for (let ms = start + stepMs; ms <= end; ms += stepMs) {
        const sp = speedAt(ms, body, opts);
        if (Math.sign(sp) !== Math.sign(prevSpeed)) {
          let lo = prevMs;
          let hi = ms;
          let loS = prevSpeed;
          for (let i = 0; i < 40 && hi - lo > 30_000; i++) {
            const mid = (lo + hi) / 2;
            const midS = speedAt(mid, body, opts);
            if (Math.sign(midS) === Math.sign(loS)) {
              lo = mid;
              loS = midS;
            } else {
              hi = mid;
            }
          }
          const exact = (lo + hi) / 2;
          events.push({
            kind: "station",
            utc: isoOf(exact),
            transiting: body,
            station: sp < 0 ? "retrograde" : "direct",
            natalHouse: wholeSignHouse(lonAt(exact, body, opts), natal.ascendantSign),
            modern,
          });
          if (events.length >= maxEvents) return sortEvents(events);
        }
        prevMs = ms;
        prevSpeed = sp;
      }
    }
  }

  // ——— lunations (new and full moons), placed in the natal houses ———
  // Each phase gets its own continuous function crossing zero at exactness:
  // new moon where (moon - sun) crosses 0, full moon where (moon - sun - 180)
  // does. Measuring |elongation| against 180 would never change sign, so the
  // two are scanned separately rather than as one wrap-around case.
  if (options.includeLunations ?? true) {
    const stepMs = 0.25 * DAY_MS;
    const phases: { phase: "new moon" | "full moon"; offset: number }[] = [
      { phase: "new moon", offset: 0 },
      { phase: "full moon", offset: 180 },
    ];
    for (const { phase, offset } of phases) {
      const f = (t: number) => signedDelta(lonAt(t, "moon", opts), lonAt(t, "sun", opts) + offset);
      let prevMs = start;
      let prevD = f(prevMs);
      for (let ms = start + stepMs; ms <= end; ms += stepMs) {
        const d = f(ms);
        if (prevD !== 0 && Math.sign(d) !== Math.sign(prevD) && Math.abs(d - prevD) < 180) {
          let lo = prevMs;
          let hi = ms;
          let loD = prevD;
          for (let i = 0; i < 40 && hi - lo > 30_000; i++) {
            const mid = (lo + hi) / 2;
            const midD = f(mid);
            if (Math.sign(midD) === Math.sign(loD)) {
              lo = mid;
              loD = midD;
            } else {
              hi = mid;
            }
          }
          const exact = (lo + hi) / 2;
          // This lunation IS an eclipse: the eclipse row already covers it.
          if (eclipseMs.some((t) => Math.abs(t - exact) < DAY_MS * 0.5)) {
            prevMs = ms;
            prevD = d;
            continue;
          }
          const moonLon = lonAt(exact, "moon", opts);
          events.push({
            kind: "lunation",
            utc: isoOf(exact),
            transiting: "moon",
            phase,
            sign: Math.floor(norm360(moonLon) / 30),
            signName: SIGN_NAMES[Math.floor(norm360(moonLon) / 30)],
            natalHouse: wholeSignHouse(moonLon, natal.ascendantSign),
            modern: false,
          });
          if (events.length >= maxEvents) return sortEvents(events);
        }
        prevMs = ms;
        prevD = d;
      }
    }
  }

  // ——— cazimi: a planet in the heart of the Sun ———
  // The moment of exact conjunction with the Sun in ecliptic longitude —
  // the peak of cazimi in traditional doctrine (within 17 arc-minutes of
  // the Sun; the exact meeting is the heart of that window). Mercury and
  // Venus meet the Sun twice per cycle: retrograde (inferior) and direct
  // (superior); Mars outward meet it about once a synodic period.
  if (options.includeCazimi ?? true) {
    const classical: Body[] = ["mercury", "venus", "mars", "jupiter", "saturn"];
    const cazimiBodies = options.cazimiBodies ?? classical.filter((b) => bodies.includes(b));
    for (const body of cazimiBodies) {
      const stepMs = 0.5 * DAY_MS;
      let prevMs = start;
      let prevD = signedDelta(lonAt(prevMs, body, opts), lonAt(prevMs, "sun", opts));
      for (let ms = start + stepMs; ms <= end; ms += stepMs) {
        const d = signedDelta(lonAt(ms, body, opts), lonAt(ms, "sun", opts));
        if (prevD !== 0 && Math.sign(d) !== Math.sign(prevD) && Math.abs(d - prevD) < 180) {
          let lo = prevMs;
          let hi = ms;
          let loD = prevD;
          for (let i = 0; i < 40 && hi - lo > 30_000; i++) {
            const mid = (lo + hi) / 2;
            const midD = signedDelta(lonAt(mid, body, opts), lonAt(mid, "sun", opts));
            if (Math.sign(midD) === Math.sign(loD)) {
              lo = mid;
              loD = midD;
            } else {
              hi = mid;
            }
          }
          const exact = (lo + hi) / 2;
          const lon = lonAt(exact, body, opts);
          const inferior =
            (body === "mercury" || body === "venus") && speedAt(exact, body, opts) < 0;
          events.push({
            kind: "cazimi",
            utc: isoOf(exact),
            transiting: body,
            conjunction:
              body === "mercury" || body === "venus"
                ? inferior
                  ? "inferior"
                  : "superior"
                : undefined,
            sign: Math.floor(norm360(lon) / 30),
            signName: SIGN_NAMES[Math.floor(norm360(lon) / 30)],
            natalHouse: wholeSignHouse(lon, natal.ascendantSign),
            modern: false,
          });
          if (events.length >= maxEvents) return sortEvents(events);
        }
        prevMs = ms;
        prevD = d;
      }
    }
  }

  // ——— sign ingresses of the slower planets ———
  if (options.includeIngresses ?? true) {
    for (const body of bodies) {
      if (body === "sun" || body === "moon" || body === "mercury" || body === "venus") continue;
      const modern = (MODERN_PLANETS as readonly string[]).includes(body);
      const stepMs = stepDaysFor(body) * DAY_MS;
      let prevMs = start;
      let prevSign = Math.floor(norm360(lonAt(prevMs, body, opts)) / 30);
      for (let ms = start + stepMs; ms <= end; ms += stepMs) {
        const sign = Math.floor(norm360(lonAt(ms, body, opts)) / 30);
        if (sign !== prevSign) {
          let lo = prevMs;
          let hi = ms;
          for (let i = 0; i < 40 && hi - lo > 30_000; i++) {
            const mid = (lo + hi) / 2;
            if (Math.floor(norm360(lonAt(mid, body, opts)) / 30) === prevSign) lo = mid;
            else hi = mid;
          }
          const exact = hi;
          const enteredSign = Math.floor(norm360(lonAt(exact, body, opts)) / 30);
          events.push({
            kind: "ingress",
            utc: isoOf(exact),
            transiting: body,
            sign: enteredSign,
            signName: SIGN_NAMES[enteredSign],
            natalHouse: wholeSignHouse(lonAt(exact, body, opts), natal.ascendantSign),
            modern,
          });
          if (events.length >= maxEvents) return sortEvents(events);
          prevSign = sign;
        }
        prevMs = ms;
      }
    }
  }

  return sortEvents(events);
}

function sortEvents(events: TransitEvent[]): TransitEvent[] {
  return events.sort((a, b) => a.utc.localeCompare(b.utc));
}

/**
 * The world's sky, no natal chart required: eclipses, lunations, stations,
 * ingresses and cazimi between two instants. Used by the public forecast;
 * natal houses are meaningless here and therefore absent.
 */
export function scanSkyEvents(
  fromUtc: string,
  toUtc: string,
  options: Omit<TransitScanOptions, "natalPoints" | "aspects"> = {}
): TransitEvent[] {
  const dummy: NatalSnapshot = { points: [], ascendantSign: 0, utc: fromUtc };
  return scanTransits(dummy, fromUtc, toUtc, {
    ...options,
    natalPoints: [],
    aspects: [],
  }).map(({ natalHouse: _natalHouse, ...e }) => e);
}
