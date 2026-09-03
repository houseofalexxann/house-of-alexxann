import Link from "next/link";
import { CELESTIAL_MAP } from "@/lib/celestial-map";

/**
 * One House, every door, as distinct celestial regions rather than a grid of
 * identical cards (design doc, Scene 3). Each door carries its region's own
 * light, read from the celestial map so the homepage, the atlas and the
 * atmosphere behind each section can never disagree. My Orbit is a member's
 * room, reached from the header once signed in, so it is not a front door.
 */
export function RegionDoors() {
  const doors = CELESTIAL_MAP.filter((r) => r.href !== "/calendar");
  return (
    <section className="py-20">
      <h2 className="text-center text-3xl text-ink-900 sm:text-4xl">One House. Every door.</h2>
      <p className="mx-auto mt-3 max-w-2xl text-center leading-relaxed text-ink-500">
        Western and Vedic astrology, Human Design, tarot, the living sky, and a
        library that explains it all, computed with the Swiss Ephemeris and
        written like a friend who tells the truth.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {doors.map((r) => {
          const a = r.tone;
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
