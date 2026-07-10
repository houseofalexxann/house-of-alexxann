import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeChart } from "@hoa/engine";
import { localBirthToUtc } from "@/lib/geocode";

const ChartRequest = z.object({
  name: z.string().max(120).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = ChartRequest.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid chart request.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const input = parsed.data;

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
    });

    return NextResponse.json({
      chart,
      resolved,
      meta: {
        name: input.name ?? null,
        placeLabel: input.place.label,
        localDate: input.date,
        localTime: input.timeKnown ? input.time : null,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chart computation failed.";
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
