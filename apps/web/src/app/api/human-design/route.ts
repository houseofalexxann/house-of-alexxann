import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { computeHumanDesign } from "@hoa/engine";
import { localBirthToUtc } from "@/lib/geocode";

const Input = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  timezone: z.string().max(64),
});

export async function POST(request: NextRequest) {
  const parsed = Input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Human Design needs an exact birth time." }, { status: 400 });
  }
  try {
    const resolved = localBirthToUtc({
      date: parsed.data.date,
      time: parsed.data.time,
      timeKnown: true,
      timezone: parsed.data.timezone,
    });
    return NextResponse.json({ result: computeHumanDesign({ utc: resolved.utc }) });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Calculation failed." },
      { status: 422 }
    );
  }
}
