import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  computeChart,
  fixedStarPositions,
  houseOf,
  starConjunctions,
  transitAspects,
  type StarPointRef,
  type NatalPointRef,
} from "@hoa/engine";
import { localBirthToUtc } from "@/lib/geocode";
import { sessionUser } from "@/lib/user-auth";
import { isAdmin } from "@/lib/admin-auth";
import { isActiveMember, TIER_NAMES } from "@/lib/membership";

/** A calendar date inside the years the bundled ephemeris covers. */
const DateString = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine(
    (d) => {
      const year = Number(d.slice(0, 4));
      return year >= 1800 && year <= 2399;
    },
    { message: "Dates between the years 1800 and 2399 are supported." }
  );

const ChartRequest = z.object({
  name: z.string().max(120).optional(),
  date: DateString,
  time: z.string().regex(/^\d{2}:\d{2}$/).default("12:00"),
  timeKnown: z.boolean().default(true),
  place: z.object({
    label: z.string().max(200),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    timezone: z.string().max(64),
  }),
  system: z.enum(["western", "vedic"]),
  houseSystem: z
    .enum(["placidus", "whole-sign", "koch", "equal", "porphyry", "regiomontanus", "campanus"])
    .optional(),
  ayanamsa: z.enum(["lahiri", "raman", "krishnamurti", "fagan-bradley"]).optional(),
  /** Western additions, members only. */
  extras: z.array(z.enum(["chiron", "ceres", "pallas", "juno", "vesta", "lilith"])).max(6).optional(),
  fixedStars: z.boolean().optional(),
  /** A transit moment, given in the birthplace's own timezone. */
  transit: z
    .object({
      date: DateString,
      time: z.string().regex(/^\d{2}:\d{2}$/),
    })
    .optional(),
});

/** Messages written for people may pass through; engine internals may not. */
function safeMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : "";
  const forPeople = /^(Invalid|Birth|Dates between|The asteroid|Latitude out of range|Longitude out of range)/.test(raw);
  if (!forPeople) console.error("[api/chart]", raw);
  return forPeople ? raw : "The chart could not be computed for that date and place.";
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = ChartRequest.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    const explained = first && /supported/.test(first.message) ? first.message : "Invalid chart request.";
    return NextResponse.json(
      { error: explained, details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;
  const western = input.system === "western";
  const wantsExtras = western && (Boolean(input.extras?.length) || Boolean(input.fixedStars) || Boolean(input.transit));

  // Asteroids, fixed stars and transits live behind the veil.
  if (wantsExtras) {
    const [user, admin] = await Promise.all([sessionUser(), isAdmin()]);
    if (!(admin || isActiveMember(user))) {
      return NextResponse.json(
        { error: `Asteroids, fixed stars and transits are a ${TIER_NAMES.member} room. Sign in as a member to add them.` },
        { status: 403 }
      );
    }
  }

  try {
    const resolved = localBirthToUtc({
      date: input.date,
      time: input.time,
      timeKnown: input.timeKnown,
      timezone: input.place.timezone,
    });

    const chart = computeChart({
      utc: resolved.utc,
      latitude: input.place.latitude,
      longitude: input.place.longitude,
      system: input.system,
      houseSystem: input.houseSystem,
      ayanamsa: input.ayanamsa,
      timeKnown: input.timeKnown,
      extras: western ? input.extras : undefined,
    });

    const natalPoints: NatalPointRef[] = [
      ...chart.planets.map((p) => ({ point: p.body, longitude: p.longitude })),
      ...(chart.angles
        ? [
            { point: "ascendant" as const, longitude: chart.angles.ascendant },
            { point: "midheaven" as const, longitude: chart.angles.midheaven },
          ]
        : []),
    ];

    let fixedStars: null | { stars: ReturnType<typeof fixedStarPositions>; conjunctions: ReturnType<typeof starConjunctions> } = null;
    if (western && input.fixedStars) {
      const stars = fixedStarPositions(chart.julianDayUT);
      const starPoints: StarPointRef[] = [
        ...natalPoints,
        ...(chart.extras ?? []).map((e) => ({ point: e.body, longitude: e.longitude })),
      ];
      fixedStars = { stars, conjunctions: starConjunctions(stars, starPoints) };
    }

    let transits: null | {
      utc: string;
      localDate: string;
      localTime: string;
      /** The wall-clock time actually used, and any note about it (DST gaps). */
      localUsed: string;
      warnings: string[];
      planets: ReturnType<typeof computeChart>["planets"];
      aspects: ReturnType<typeof transitAspects>;
    } = null;
    if (western && input.transit) {
      const when = localBirthToUtc({
        date: input.transit.date,
        time: input.transit.time,
        timeKnown: true,
        timezone: input.place.timezone,
      });
      const sky = computeChart({
        utc: when.utc,
        latitude: input.place.latitude,
        longitude: input.place.longitude,
        system: "western",
        houseSystem: input.houseSystem,
        timeKnown: true,
      });
      // Transiting planets are read in the natal houses, not their own.
      const planets = sky.planets.map((p) => ({
        ...p,
        house: chart.houseCusps ? houseOf(p.longitude, chart.houseCusps) : null,
      }));
      transits = {
        utc: when.utc,
        localDate: input.transit.date,
        localTime: input.transit.time,
        localUsed: when.localUsed,
        warnings: when.warnings,
        planets,
        aspects: transitAspects(planets, natalPoints),
      };
    }

    return NextResponse.json({
      chart,
      fixedStars,
      transits,
      resolved,
      meta: {
        name: input.name ?? null,
        placeLabel: input.place.label,
        localDate: input.date,
        localTime: input.timeKnown ? input.time : null,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: safeMessage(err) }, { status: 422 });
  }
}
