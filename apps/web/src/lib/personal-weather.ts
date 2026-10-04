/**
 * The same sky, landed in one person's chart.
 *
 * Today: where the Moon sits in their whole-sign houses, and every transiting
 * planet within the customary transit orbs of a natal point right now. The
 * week: the exact hits ahead, dated. Positions are the Swiss Ephemeris's;
 * framing comes from lib/transit-meanings with its provenance intact.
 */
import {
  computeChart,
  scanTransits,
  transitAspects,
  wholeSignHouse,
  TRANSIT_ORBS,
  type NatalPoint,
  type NatalSnapshot,
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
import { reflectionFor, titleFor, whereFor } from "./personal-calendar";

export interface PersonalContact {
  title: string;
  where: string;
  reflection: string;
  provenance: Provenance;
  orb: number;
  applying: boolean | null;
  transiting: string;
  natal: string;
  aspect: string;
}

export interface PersonalToday {
  moonHouse: number;
  moonHouseName: string;
  moonHouseTopics: string;
  contacts: PersonalContact[];
}

export interface PersonalWeekEvent {
  utc: string;
  title: string;
  where: string;
  reflection: string;
  kind: TransitEvent["kind"];
}

type Profile = Pick<BirthProfile, "utc" | "latitude" | "longitude">;

export function natalSnapshotOf(profile: Profile): NatalSnapshot {
  const birthUtc = new Date(profile.utc).toISOString();
  const natal = computeChart({
    system: "western",
    utc: birthUtc,
    latitude: profile.latitude,
    longitude: profile.longitude,
    houseSystem: "whole-sign",
  });
  const ascendantSign = natal.angles?.ascendantSign ?? 0;
  return {
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
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

export function personalToday(profile: Profile, nowUtc: string): PersonalToday {
  const snapshot = natalSnapshotOf(profile);
  const sky = computeChart({
    system: "western",
    utc: nowUtc,
    latitude: 0,
    longitude: 0,
    timeKnown: false,
  });

  const moon = sky.planets.find((p) => p.body === "moon")!;
  const moonHouse = wholeSignHouse(moon.longitude, snapshot.ascendantSign);
  const house = HOUSE_TOPICS[moonHouse];

  // The Moon is read separately above; the rest of the sky against the chart.
  const transiting = sky.planets.filter(
    (p) => p.body !== "moon" && p.body !== "rahu" && p.body !== "ketu"
  );
  const natalPoints = snapshot.points.filter((n) => n.point !== "rahu" && n.point !== "ketu");

  const contacts: PersonalContact[] = transitAspects(transiting, natalPoints, TRANSIT_ORBS)
    .slice(0, 8)
    .map((a) => {
      const t = sky.planets.find((p) => p.body === a.transiting)!;
      const natalHouse = wholeSignHouse(t.longitude, snapshot.ascendantSign);
      const h = HOUSE_TOPICS[natalHouse];
      const nature = ASPECT_NATURE[a.type].nature;
      const keynote = PLANET_SIGNIFICATION[a.transiting]?.keynote ?? "";
      return {
        title: `Transiting ${POINT_LABEL[a.transiting]} ${ASPECT_NATURE[a.type].verb} your natal ${POINT_LABEL[a.natal] ?? a.natal}`,
        where: `${ordinal(natalHouse)} house, ${h.name}`,
        reflection: `Traditionally read as ${nature}. The themes in play are ${keynote}, moving through ${h.name}: ${h.topics}.`,
        provenance: provenanceOf(a.transiting, a.natal),
        orb: a.orb,
        applying: a.applying,
        transiting: a.transiting,
        natal: a.natal,
        aspect: a.type,
      };
    });

  return {
    moonHouse,
    moonHouseName: house.name,
    moonHouseTopics: house.topics,
    contacts,
  };
}

export function personalWeek(profile: Profile, fromUtc: string, days = 7): PersonalWeekEvent[] {
  const snapshot = natalSnapshotOf(profile);
  const toUtc = new Date(new Date(fromUtc).getTime() + days * 86_400_000).toISOString();
  const events = scanTransits(snapshot, fromUtc, toUtc, {
    bodies: ["sun", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"],
    natalPoints: ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "ascendant", "midheaven"],
    includeIngresses: false,
    includeCazimi: false,
    maxEvents: 40,
  });
  return events.map((e) => ({
    utc: e.utc,
    title: titleFor(e),
    where: whereFor(e),
    reflection: reflectionFor(e),
    kind: e.kind,
  }));
}
