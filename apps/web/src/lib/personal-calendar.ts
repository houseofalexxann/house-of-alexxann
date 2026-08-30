/**
 * Assembles a member's personal timing calendar: the annual profection that
 * governs their year, plus the transits, lunations, stations and ingresses
 * ahead, each placed in the whole-sign house it touches.
 *
 * Positions come from the Swiss Ephemeris via @hoa/engine. Framing comes from
 * lib/transit-meanings, where every signification carries its provenance.
 */
import {
  annualProfection,
  computeChart,
  scanTransits,
  type NatalPoint,
  type NatalSnapshot,
  type ProfectionYear,
  type TransitEvent,
} from "@hoa/engine";
import type { BirthProfile } from "@prisma/client";
import {
  ASPECT_NATURE,
  HOUSE_TOPICS,
  PLANET_SIGNIFICATION,
  POINT_LABEL,
  provenanceOf,
  type Provenance,
} from "./transit-meanings";

export interface CalendarEntry extends TransitEvent {
  /** "Transiting Saturn squares your natal Sun" */
  title: string;
  /** The house topic this lands in, in plain language. */
  where: string;
  /** One reflective sentence. Never a prediction. */
  reflection: string;
  provenance: Provenance;
}

export interface PersonalCalendar {
  profection: ProfectionYear & { houseTopic: string; lordKeynote: string };
  entries: CalendarEntry[];
  computedFor: { name: string; birthUtc: string; ascendantSign: number };
}

function titleFor(e: TransitEvent): string {
  const planet = POINT_LABEL[e.transiting] ?? e.transiting;
  switch (e.kind) {
    case "aspect":
      return `Transiting ${planet} ${ASPECT_NATURE[e.aspect!].verb} your natal ${POINT_LABEL[e.natalPoint as string] ?? e.natalPoint}`;
    case "station":
      return `${planet} stations ${e.station}`;
    case "lunation":
      return `${e.phase === "new moon" ? "New Moon" : "Full Moon"} in ${e.signName}`;
    case "ingress":
      return `${planet} enters ${e.signName}`;
    case "eclipse":
      return `${e.phase === "new moon" ? "Solar" : "Lunar"} eclipse in ${e.signName} (${e.eclipseType})`;
    case "cazimi":
      return `${planet} cazimi — in the heart of the Sun`;
  }
}

function reflectionFor(e: TransitEvent): string {
  const house = e.natalHouse ? HOUSE_TOPICS[e.natalHouse] : undefined;
  const planetKey = PLANET_SIGNIFICATION[e.transiting]?.keynote ?? "";
  switch (e.kind) {
    case "aspect": {
      const nature = ASPECT_NATURE[e.aspect!].nature;
      return `Traditionally read as ${nature}. The themes in play are ${planetKey}${
        house ? `, arriving in ${house.name}: ${house.topics}` : ""
      }. One way to sit with it: notice what asks for your attention here, and decide what you want to do about it.`;
    }
    case "station":
      return e.station === "retrograde"
        ? `${POINT_LABEL[e.transiting]} turns retrograde${house ? ` in ${house.name}` : ""}. In traditional practice a retrograde planet is read as turned inward rather than broken; matters of ${planetKey} tend to want review rather than launch.`
        : `${POINT_LABEL[e.transiting]} turns direct${house ? ` in ${house.name}` : ""}. What had been under review in matters of ${planetKey} can move forward again.`;
    case "lunation":
      return e.phase === "new moon"
        ? `A new moon falls in ${house ? house.name : "your chart"}${house ? `: ${house.topics}` : ""}. The lunar cycle begins again here, which practitioners commonly treat as a good moment to start rather than to finish.`
        : `A full moon lights ${house ? house.name : "your chart"}${house ? `: ${house.topics}` : ""}. Oppositions make things visible; something in this area of life may simply become clearer.`;
    case "ingress":
      return `${POINT_LABEL[e.transiting]} changes signs, moving into ${house ? house.name : "a new house"}${
        house ? `: ${house.topics}` : ""
      }. Themes of ${planetKey} shift their address for a while.`;
    case "eclipse": {
      const which = e.phase === "new moon" ? "solar" : "lunar";
      const asLunation = e.phase === "new moon" ? "a new moon" : "a full moon";
      return `A ${which} eclipse is ${asLunation} amplified: the lights meet close to the Moon's nodes, and traditional astrologers gave these moments special weight${
        house ? `, here landing in ${house.name}: ${house.topics}` : ""
      }. The old advice is not fear but attention — eclipses mark chapters more than they cause events. Notice what surfaces; let it unfold before naming it.`;
    }
    case "cazimi":
      return `${POINT_LABEL[e.transiting]} sits in the heart of the Sun — cazimi, the exact meeting with the Sun's own degree. In traditional doctrine a planet cazimi is strengthened rather than burned: a brief, clear window for matters of ${planetKey}.${
        e.conjunction ? ` (This is the ${e.conjunction} conjunction${e.conjunction === "inferior" ? ", during the retrograde" : ""}.)` : ""
      }`;
  }
}

function whereFor(e: TransitEvent): string {
  if (!e.natalHouse) return "";
  const h = HOUSE_TOPICS[e.natalHouse];
  return `${ordinal(e.natalHouse)} house, ${h.name}`;
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

export function buildPersonalCalendar(
  profile: Pick<BirthProfile, "name" | "utc" | "latitude" | "longitude">,
  fromUtc: string,
  toUtc: string,
  opts: { maxEvents?: number } = {}
): PersonalCalendar {
  const birthUtc = new Date(profile.utc).toISOString();
  const natal = computeChart({
    system: "western",
    utc: birthUtc,
    latitude: profile.latitude,
    longitude: profile.longitude,
    houseSystem: "whole-sign",
  });

  const ascendantSign = natal.angles?.ascendantSign ?? 0;
  const snapshot: NatalSnapshot = {
    utc: birthUtc,
    ascendantSign,
    points: [
      ...natal.planets.map((p) => ({ point: p.body as NatalPoint, longitude: p.longitude })),
      ...(natal.angles
        ? [
            { point: "ascendant" as NatalPoint, longitude: natal.angles.ascendant },
            { point: "midheaven" as NatalPoint, longitude: natal.angles.midheaven },
          ]
        : []),
    ],
  };

  const raw = scanTransits(snapshot, fromUtc, toUtc, {
    bodies: ["sun", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"],
    natalPoints: ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "ascendant", "midheaven"],
    // Mercury/Venus aspects would flood a year view, but their cazimis are
    // headline moments — scan those independently of the aspect list.
    cazimiBodies: ["mercury", "venus", "mars", "jupiter", "saturn"],
    maxEvents: opts.maxEvents ?? 300,
  });

  const profection = annualProfection(birthUtc, fromUtc, ascendantSign, snapshot.points);

  return {
    profection: {
      ...profection,
      houseTopic: HOUSE_TOPICS[profection.house].topics,
      lordKeynote: PLANET_SIGNIFICATION[profection.lordOfYear].keynote,
    },
    entries: raw.map((e) => ({
      ...e,
      title: titleFor(e),
      where: whereFor(e),
      reflection: reflectionFor(e),
      provenance: provenanceOf(e.transiting, e.natalPoint as string | undefined),
    })),
    computedFor: { name: profile.name, birthUtc, ascendantSign },
  };
}

/** RFC 5545 feed of the calendar, subscribable in any calendar app. */
export function toICalendar(cal: PersonalCalendar, feedName: string): string {
  const esc = (s: string) => s.replace(/([,;\\])/g, "\\$1").replace(/\n/g, "\\n");
  const stamp = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//House of Alexxann//Personal Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${esc(feedName)}`,
    "X-WR-TIMEZONE:UTC",
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
  ];

  // The profection year itself, as an all-day span.
  const day = (iso: string) => iso.slice(0, 10).replace(/-/g, "");
  lines.push(
    "BEGIN:VEVENT",
    `UID:profection-${cal.profection.age}@houseofalexxann.com`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART;VALUE=DATE:${day(cal.profection.startUtc)}`,
    `DTEND;VALUE=DATE:${day(cal.profection.endUtc)}`,
    `SUMMARY:${esc(`✦ Profected year ${cal.profection.age}: ${ordinal(cal.profection.house)} house (${cal.profection.signName}), Lord of the Year ${POINT_LABEL[cal.profection.lordOfYear]}`)}`,
    `DESCRIPTION:${esc(
      `Annual profection, a Hellenistic time-lord technique (Valens; Paulus; see Chris Brennan, Hellenistic Astrology, 2017). This year activates your ${ordinal(cal.profection.house)} house: ${cal.profection.houseTopic}. Its ruler, ${POINT_LABEL[cal.profection.lordOfYear]}, becomes Lord of the Year, so themes of ${cal.profection.lordKeynote} carry extra weight.`
    )}`,
    "TRANSP:TRANSPARENT",
    "END:VEVENT"
  );

  cal.entries.forEach((e, i) => {
    const start = stamp(e.utc);
    const end = stamp(new Date(new Date(e.utc).getTime() + 60 * 60 * 1000).toISOString());
    lines.push(
      "BEGIN:VEVENT",
      `UID:hoa-${i}-${start}@houseofalexxann.com`,
      `DTSTAMP:${stamp(new Date().toISOString())}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:${esc(`${e.title}${e.where ? ` (${e.where})` : ""}`)}`,
      `DESCRIPTION:${esc(
        `${e.reflection}${
          e.provenance === "modern-practice"
            ? " — Note: this reading draws on modern practice rather than the classical tradition."
            : ""
        }`
      )}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  // RFC 5545 wants CRLF line endings.
  return lines.join("\r\n") + "\r\n";
}
