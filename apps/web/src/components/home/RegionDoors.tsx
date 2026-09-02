import Link from "next/link";
import { CELESTIAL_MAP } from "@/lib/celestial-map";

/**
 * One House, every door — as distinct celestial regions rather than a grid
 * of identical cards (design doc, Scene 3). Each door carries its region's
 * own light: the Solar Constellation is gold-rose, the Lunar Mansions
 * indigo, the Geometric Body crystalline, the Arcana a violet nebula. The
 * names, routes and blurbs come from the celestial map, so the homepage and
 * the atlas can never disagree.
 */
const ATMOSPHERE: Record<string, { glow: string; accent: string }> = {
  "/studio": { glow: "245,169,184", accent: "#f5a9b8" },
  "/western": { glow: "236,190,120", accent: "#ecbe78" },
  "/vedic": { glow: "125,145,255", accent: "#a7b4ff" },
  "/human-design": { glow: "184,166,220", accent: "#cdbfe8" },
  "/tarot": { glow: "205,125,225", accent: "#dea3ea" },
  "/transits": { glow: "91,206,250", accent: "#8ed7f8" },
  "/blog": { glow: "246,233,216", accent: "#f6e9d8" },
  "/codex": { glow: "165,140,230", accent: "#c3adf0" },
  "/services": { glow: "245,169,184", accent: "#f8bcc9" },
};

export function RegionDoors() {
  const doors = CELESTIAL_MAP.filter((r) => r.href in ATMOSPHERE);
  return (
    <section className="py-20">
      <h2 className="text-center text-3xl text-ink-900 sm:text-4xl">One House. Every door.</h2>
      <p className="mx-auto mt-3 max-w-2xl text-center leading-relaxed text-ink-500">
        Western and Vedic astrology, Human Design, tarot, the living sky, and a
        library that explains it all — computed with the Swiss Ephemeris and
        written like a friend who tells the truth.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doors.map((r) => {
          const a = ATMOSPHERE[r.href];
          return (
            <Link
              key={r.href}
              href={r.href}
              className="group relative overflow-hidden rounded-2xl border border-pearl-300/70 bg-pearl-200/40 p-6 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-pearl-400"
              style={{
                boxShadow: `0 0 0 1px rgba(255,255,255,0.04) inset, 0 20px 40px -28px rgba(0,0,0,0.8)`,
              }}
            >
              {/* The region's own light */}
              <span
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-60 blur-2xl transition-opacity group-hover:opacity-90"
                style={{ background: `radial-gradient(circle, rgba(${a.glow},0.35), transparent 65%)` }}
              />
              <span
                aria-hidden
                className="astro-glyph relative block text-3xl transition-transform group-hover:scale-110"
                style={{ color: a.accent, textShadow: `0 0 18px rgba(${a.glow},0.55)` }}
              >
                {r.glyph}
              </span>
              <p className="relative mt-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-400">
                {r.name}
              </p>
              <h3 className="relative mt-1 font-heading text-2xl text-ink-900">{r.plain}</h3>
              <p className="relative mt-1.5 text-sm leading-relaxed text-ink-500">{r.blurb}</p>
              <p className="relative mt-4 text-sm font-medium" style={{ color: a.accent }}>
                Enter <span aria-hidden>→</span>
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
