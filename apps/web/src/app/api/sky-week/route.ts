import { NextResponse } from "next/server";
import { DateTime } from "luxon";
import { computeChart, moonPhase, SIGN_NAMES } from "@hoa/engine";

/**
 * The week's sky, CHANI-forecast style: for each of the next 7 days — the
 * Moon's sign & phase, planetary sign ingresses, retrograde stations, and
 * exact transiting aspects (orb < 1°). Global astro weather (personal
 * transits-to-natal join once saved birth profiles land).
 */
export const dynamic = "force-dynamic";

const ASPECT_WORDS: Record<string, string> = {
  conjunction: "meets",
  sextile: "offers to",
  square: "grinds against",
  trine: "flows with",
  opposition: "faces",
};

const NAMES: Record<string, string> = {
  sun: "the Sun", moon: "the Moon", mercury: "Mercury", venus: "Venus",
  mars: "Mars", jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus",
  neptune: "Neptune", pluto: "Pluto", rahu: "the North Node", ketu: "the South Node",
};

function chartAt(iso: string) {
  return computeChart({ utc: iso, latitude: 0, longitude: 0, system: "western", timeKnown: false });
}

export async function GET() {
  const days: {
    date: string;
    weekday: string;
    moon: string;
    phase: string;
    events: string[];
  }[] = [];

  let prev = chartAt(DateTime.utc().minus({ days: 1 }).startOf("day").plus({ hours: 12 }).toISO({ suppressMilliseconds: true })!);

  for (let d = 0; d < 7; d++) {
    const dt = DateTime.utc().plus({ days: d }).startOf("day").plus({ hours: 12 });
    const chart = chartAt(dt.toISO({ suppressMilliseconds: true })!);
    const events: string[] = [];

    // Sign ingresses & stations vs yesterday.
    for (const p of chart.planets) {
      if (p.body === "moon" || p.body === "ketu") continue;
      const was = prev.planets.find((q) => q.body === p.body)!;
      if (was.sign !== p.sign) {
        events.push(`${NAMES[p.body]} enters ${SIGN_NAMES[p.sign]}`);
      }
      if (was.retrograde !== p.retrograde) {
        events.push(`${NAMES[p.body]} stations ${p.retrograde ? "retrograde" : "direct"}`);
      }
    }

    // Exact transiting aspects (orb < 1°), Moon excluded to keep signal high.
    for (const a of chart.aspects) {
      if (a.orb < 1 && a.a !== "moon" && a.b !== "moon" && a.a !== "ketu" && a.b !== "ketu") {
        events.push(`${NAMES[a.a]} ${ASPECT_WORDS[a.type]} ${NAMES[a.b]}`);
      }
    }

    const moon = chart.planets.find((p) => p.body === "moon")!;
    const sun = chart.planets.find((p) => p.body === "sun")!;
    const phase = moonPhase(sun.longitude, moon.longitude);
    // New/Full Moon callouts.
    if (phase.phase === "New Moon") events.unshift(`New Moon in ${SIGN_NAMES[moon.sign]}`);
    if (phase.phase === "Full Moon") events.unshift(`Full Moon in ${SIGN_NAMES[moon.sign]}`);

    days.push({
      date: dt.toFormat("yyyy-MM-dd"),
      weekday: d === 0 ? "Today" : dt.toFormat("cccc"),
      moon: SIGN_NAMES[moon.sign],
      phase: phase.phase,
      events,
    });
    prev = chart;
  }

  return NextResponse.json({ days });
}
