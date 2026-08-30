"use client";

/**
 * Dates worth circling: the sky's headline moments for the next two months —
 * eclipses burning brightest, then lunations, stations, cazimis, and the
 * slow ingresses. World astronomy, free for every visitor; the personal
 * version of these moments lives in the member calendar.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { MoonPhaseIcon } from "./MoonPhaseIcon";

interface SkyEvent {
  kind: "eclipse" | "lunation" | "station" | "ingress" | "cazimi" | "aspect";
  utc: string;
  transiting: string;
  station?: "retrograde" | "direct";
  phase?: "new moon" | "full moon";
  eclipseType?: string;
  conjunction?: "inferior" | "superior";
  sign?: number;
  signName?: string;
  modern: boolean;
}

const PLANET: Record<string, string> = {
  sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars",
  jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus", neptune: "Neptune", pluto: "Pluto",
};

const PLANET_GLYPH: Record<string, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
};

function fmtDate(utc: string): string {
  return new Date(utc).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function describe(e: SkyEvent): { title: string; note: string; badge?: string } {
  const name = PLANET[e.transiting] ?? e.transiting;
  switch (e.kind) {
    case "eclipse": {
      const solar = e.phase === "new moon";
      return {
        title: `${solar ? "Solar" : "Lunar"} eclipse in ${e.signName}`,
        note: solar
          ? "A new moon amplified — the lights meet by the Moon's nodes."
          : "A full moon amplified — the Earth's shadow crosses the Moon.",
        badge: `${e.eclipseType} ${solar ? "solar" : "lunar"} eclipse`,
      };
    }
    case "lunation":
      return e.phase === "new moon"
        ? { title: `New Moon in ${e.signName}`, note: "The cycle begins again — a moment for starting, not finishing." }
        : { title: `Full Moon in ${e.signName}`, note: "The month's culmination — things become visible." };
    case "station":
      return e.station === "retrograde"
        ? { title: `${name} stations retrograde`, note: "Traditionally read as a turn inward: review before relaunch.", badge: "retrograde begins" }
        : { title: `${name} stations direct`, note: "The review ends; held matters can move again.", badge: "retrograde ends" };
    case "cazimi":
      return {
        title: `${name} cazimi`,
        note: `In the heart of the Sun — the exact meeting${e.conjunction ? ` (${e.conjunction} conjunction)` : ""}. Doctrine reads a planet here as briefly strengthened, not burned.`,
        badge: "cazimi",
      };
    case "ingress":
      return { title: `${name} enters ${e.signName}`, note: "A slow planet changes signs — the background weather shifts." };
    default:
      return { title: `${name}`, note: "" };
  }
}

/** Visual weight per kind: eclipses shout, ingresses whisper. */
function styleFor(e: SkyEvent): string {
  switch (e.kind) {
    case "eclipse":
      return "border-rose-400/70 bg-rose-400/10 shadow-[0_0_30px_-12px_rgba(245,169,184,0.65)]";
    case "lunation":
      return "border-pearl-400/60 bg-pearl-200/50";
    case "station":
      return "border-lilac-500/40 bg-lilac-500/5";
    case "cazimi":
      return "border-amber-300/40 bg-amber-200/5";
    default:
      return "border-pearl-300/60 bg-pearl-200/30";
  }
}

export function MajorEvents() {
  const [events, setEvents] = useState<SkyEvent[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/sky-events")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => setEvents(d.events))
      .catch(() => setError(true));
  }, []);

  if (error)
    return (
      <p className="text-center text-sm text-ink-500">
        The ephemeris is catching its breath — refresh in a moment.
      </p>
    );
  if (!events)
    return <p className="text-center text-sm text-ink-500">Consulting the ephemeris…</p>;

  const majors = events.filter((e) => e.kind !== "ingress" || !e.modern);

  return (
    <div>
      <ol className="space-y-3">
        {majors.map((e, i) => {
          const d = describe(e);
          return (
            <li
              key={`${e.utc}-${i}`}
              className={`rounded-2xl border p-4 backdrop-blur-sm transition-shadow ${styleFor(e)}`}
            >
              <div className="flex items-start gap-3.5">
                <span className="mt-0.5 w-14 shrink-0 text-right text-sm font-semibold tabular-nums text-ink-500">
                  {fmtDate(e.utc)}
                </span>
                {e.kind === "eclipse" || e.kind === "lunation" ? (
                  <MoonPhaseIcon phase={e.phase === "new moon" ? "new moon" : "full moon"} />
                ) : (
                  <span aria-hidden className="astro-glyph w-[22px] text-center text-lg text-rose-400">
                    {e.kind === "cazimi" ? "☉" : PLANET_GLYPH[e.transiting] ?? "✦"}
                  </span>
                )}
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-ink-900">{d.title}</span>
                    {d.badge && (
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          e.kind === "eclipse"
                            ? "border-rose-400/60 text-rose-400"
                            : "border-pearl-400/60 text-ink-500"
                        }`}
                      >
                        {d.badge}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-ink-500">{d.note}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-5 text-center text-xs leading-relaxed text-ink-400">
        Every moment computed with the Swiss Ephemeris; eclipses come from its
        eclipse search, never estimated. To see where these land in{" "}
        <em>your</em> chart,{" "}
        <Link href="/calendar" className="text-rose-400 hover:underline">
          open your personal calendar
        </Link>
        .
      </p>
    </div>
  );
}
