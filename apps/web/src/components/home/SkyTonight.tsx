import Link from "next/link";
import { computeChart, scanSkyEvents, SIGN_NAMES } from "@hoa/engine";
import { PLANET_GLYPHS, SIGN_GLYPHS } from "@/components/chart/glyphs";
import { MoonPhaseIcon } from "@/components/transits/MoonPhaseIcon";

/**
 * The sky tonight, for real: current planetary positions and the next major
 * moments, computed by the engine at render time (the page regenerates
 * hourly). Nothing here is decorative astronomy — every degree is the Swiss
 * Ephemeris's, which is the only reason this strip is allowed to exist on
 * the homepage (design doc, Scene 4: never imply accuracy we don't have).
 */
const SHOWN = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"] as const;
const NAMES: Record<string, string> = {
  sun: "Sun", moon: "Moon", mercury: "Mercury", venus: "Venus", mars: "Mars",
  jupiter: "Jupiter", saturn: "Saturn", uranus: "Uranus", neptune: "Neptune", pluto: "Pluto",
};

function fmt(utc: string): string {
  return new Date(utc).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function SkyTonight() {
  const now = new Date();
  const nowIso = now.toISOString().replace(/\.\d{3}Z$/, "Z");
  const chart = computeChart({
    system: "western",
    utc: nowIso,
    latitude: 0,
    longitude: 0,
    timeKnown: false,
  });
  const positions = SHOWN.map((b) => chart.planets.find((p) => p.body === b)!).filter(Boolean);
  const moon = positions.find((p) => p.body === "moon")!;
  const phase = chart.traditional?.moonPhase?.phase ?? "";

  const events = scanSkyEvents(
    nowIso,
    new Date(now.getTime() + 45 * 86_400_000).toISOString().replace(/\.\d{3}Z$/, "Z"),
    { bodies: ["mercury", "venus", "mars", "jupiter", "saturn"], includeIngresses: false, maxEvents: 20 }
  );
  const eclipse = events.find((e) => e.kind === "eclipse");
  const next = (eclipse ? [eclipse, ...events.filter((e) => e !== eclipse)] : events).slice(0, 3);

  return (
    <section className="py-16">
      <div className="mx-auto max-w-4xl">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.35em] text-lilac-600">
          ◐ The sky tonight
        </p>
        <h2 className="mt-2 text-center text-3xl text-ink-900 sm:text-4xl">
          Where the planets are, right now
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-ink-500">
          Computed live from the Swiss Ephemeris, refreshed every hour.
        </p>

        {/* The planets, in a row of small lit chips */}
        <ul className="mt-8 flex flex-wrap justify-center gap-2.5">
          {positions.map((p) => (
            <li
              key={p.body}
              className="flex items-center gap-2 rounded-full border border-pearl-300/70 bg-pearl-200/50 px-3.5 py-2 backdrop-blur-sm"
              title={`${NAMES[p.body]} at ${p.formatted} ${SIGN_NAMES[p.sign]}${p.retrograde ? ", retrograde" : ""}`}
            >
              {p.body === "moon" ? (
                <MoonPhaseIcon phase={phase} size={18} />
              ) : (
                <span aria-hidden className="astro-glyph text-lg text-rose-400">
                  {PLANET_GLYPHS[p.body]}
                </span>
              )}
              <span className="text-sm text-ink-900">
                {NAMES[p.body]}
              </span>
              <span aria-hidden className="astro-glyph text-base text-lilac-500">
                {SIGN_GLYPHS[p.sign]}
              </span>
              <span className="text-xs tabular-nums text-ink-500">
                {Math.floor(p.degreeInSign)}° {SIGN_NAMES[p.sign]}
              </span>
              {p.retrograde && (
                <span className="rounded-full border border-lilac-500/50 px-1.5 text-[10px] font-semibold text-lilac-500" title="retrograde">
                  ℞
                </span>
              )}
              <span className="sr-only">
                {NAMES[p.body]} at {p.formatted} {SIGN_NAMES[p.sign]}
                {p.retrograde ? ", retrograde" : ""}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-center text-xs text-ink-400">
          Moon: {phase} in {SIGN_NAMES[moon.sign]}
        </p>

        {/* Next moments */}
        {next.length > 0 && (
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {next.map((e, i) => {
              const isEclipse = e.kind === "eclipse";
              const name = NAMES[e.transiting] ?? e.transiting;
              const title =
                e.kind === "eclipse"
                  ? `${e.phase === "new moon" ? "Solar" : "Lunar"} eclipse in ${e.signName}`
                  : e.kind === "lunation"
                    ? `${e.phase === "new moon" ? "New Moon" : "Full Moon"} in ${e.signName}`
                    : e.kind === "station"
                      ? `${name} stations ${e.station}`
                      : e.kind === "cazimi"
                        ? `${name} cazimi`
                        : `${name} enters ${e.signName}`;
              return (
                <Link
                  key={`${e.utc}-${i}`}
                  href="/transits"
                  className={`card group p-4 ${isEclipse ? "border-rose-400/70 shadow-[0_0_34px_-14px_rgba(245,169,184,0.75)]" : ""}`}
                >
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-400">
                    {i === 0 ? "Next up" : "Then"} · {fmt(e.utc)}
                  </p>
                  <p className="mt-1.5 flex items-center gap-2 font-medium text-ink-900">
                    {e.kind === "eclipse" || e.kind === "lunation" ? (
                      <MoonPhaseIcon phase={e.phase === "new moon" ? "new moon" : "full moon"} size={18} />
                    ) : (
                      <span aria-hidden className="astro-glyph text-rose-400">
                        {e.kind === "cazimi" ? "☉︎" : PLANET_GLYPHS[e.transiting]}
                      </span>
                    )}
                    {title}
                  </p>
                  {isEclipse && (
                    <p className="mt-1 text-xs uppercase tracking-wider text-rose-400">
                      {e.eclipseType} eclipse
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        <p className="mt-6 text-center">
          <Link href="/transits" className="btn-ghost text-sm">
            Read today&#39;s sky →
          </Link>
        </p>
      </div>
    </section>
  );
}
