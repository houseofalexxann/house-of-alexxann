import Link from "next/link";
import { SERVICES, formatPrice } from "@/lib/services";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="relative flex flex-col items-center pb-20 pt-24 text-center sm:pt-32">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-rose-600">
          Western · Vedic · Modern &amp; Mystical
        </p>
        <h1 className="max-w-3xl text-5xl leading-tight text-ink-900 sm:text-6xl">
          The sky you were born under
          <span className="block italic text-rose-500">still remembers you.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-700">
          Cast your natal chart free — Western or Vedic, computed with
          professional-grade precision — then sit with Alexandria for a reading
          that makes it yours.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/studio" className="btn-gold">
            ✦ Cast your chart — free
          </Link>
          <Link href="/services" className="btn-ghost">
            Book a reading
          </Link>
        </div>

        {/* Decorative zodiac ring */}
        <svg
          aria-hidden
          viewBox="0 0 200 200"
          className="pointer-events-none absolute -z-10 h-[560px] w-[560px] opacity-[0.16]"
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        >
          <circle cx="100" cy="100" r="98" fill="none" stroke="#d4638f" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="78" fill="none" stroke="#d4638f" strokeWidth="0.3" />
          <circle cx="100" cy="100" r="58" fill="none" stroke="#9f8ad0" strokeWidth="0.3" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={100 + 78 * Math.cos(a)}
                y1={100 + 78 * Math.sin(a)}
                x2={100 + 98 * Math.cos(a)}
                y2={100 + 98 * Math.sin(a)}
                stroke="#d4638f"
                strokeWidth="0.4"
              />
            );
          })}
        </svg>
      </section>

      <hr className="gold-rule" />

      {/* One-stop shop: every room of the House */}
      <section className="py-20">
        <h2 className="text-center text-3xl text-ink-900 sm:text-4xl">
          One House. Every door.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center leading-relaxed text-ink-500">
          Western and Vedic astrology, Human Design, tarot, the daily sky, and
          a library that explains it all — computed with professional
          precision, written like a friend who tells the truth. This is your
          one-stop sanctuary for self-knowledge.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["/western", "\u2648\ufe0e", "Western astrology", "Your tropical natal chart — wheel, houses, aspects, the deeper dignities. Free, always."],
            ["/vedic", "\u263d\ufe0e", "Vedic · Jyotish", "The sidereal sky: nakshatras with padas & lords, Rasi & Navamsa, your dasha timeline."],
            ["/human-design", "\u25ec", "Human Design", "Type, strategy, authority & profile free — the full bodygraph for Icons."],
            ["/tarot", "\u2736", "Tarot", "Seventy-eight doors, tied to the decans of your chart. The room is being furnished."],
            ["/transits", "\u2609\ufe0e", "The sky now", "Today's astro weather free — the 7-day forecast for Icons."],
            ["/blog", "\u270e", "The daily sky", "Astro weather, history and lore — posted from the House."],
            ["/codex", "\u274b", "Learn", "Every glyph, every term, decans, bounds, zodiacal releasing — the open notebook."],
            ["/services", "\u2726", "Readings", "Sit with Alexandria — natal, Vedic, transits, solar return. Sliding scale, every way to pay."],
          ].map(([href, glyph, title, blurb]) => (
            <Link key={href as string} href={href as string} className="card group p-5 transition-shadow hover:shadow-lg">
              <span aria-hidden className="astro-glyph inline-block text-2xl text-rose-500 transition-transform group-hover:scale-110">
                {glyph}
              </span>
              <h3 className="mt-2 font-heading text-xl text-ink-900">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-500">{blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      <hr className="gold-rule" />

      {/* Offerings */}
      <section className="py-20">
        <h2 className="text-center text-3xl text-ink-900 sm:text-4xl">Readings</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-ink-500">
          Three ways to sit with your chart — live on video, by phone, or in
          person.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {SERVICES.map((s) => (
            <article key={s.slug} className="card flex flex-col p-6">
              <h3 className="text-2xl text-rose-500">{s.title}</h3>
              <p className="mt-1 text-sm italic text-ink-500">{s.tagline}</p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-ink-700">
                {s.description}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-pearl-400/60 pt-4">
                <span className="text-sm text-ink-500">
                  {s.durationMinutes} min ·{" "}
                  <span className="text-ink-900">{formatPrice(s.priceCents)}</span>
                </span>
                <Link
                  href={`/services/${s.slug}`}
                  className="text-sm font-medium text-rose-600 hover:text-rose-500"
                >
                  Details →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Chart Studio strip */}
      <section className="card my-8 flex flex-col items-center gap-6 p-10 text-center md:flex-row md:text-left">
        <div className="flex-1">
          <h2 className="text-3xl text-ink-900">The Chart Studio is open — and free.</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-ink-700">
            Enter a birth date, time and place; get a full chart wheel, exact
            degrees, aspects and plain-spoken interpretations. Flip between the
            Western and Vedic skies — including your nakshatra, dasha timeline
            and navamsa. No account, no paywall.
          </p>
        </div>
        <Link href="/studio" className="btn-gold shrink-0">
          Open the Studio
        </Link>
      </section>

      {/* Testimonials placeholder (PRD §6.6) */}
      <section className="py-20">
        <h2 className="text-center text-3xl text-ink-900">Kind words</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <figure key={i} className="card p-6">
              <div aria-hidden className="text-rose-600">✦ ✦ ✦ ✦ ✦</div>
              <blockquote className="mt-4 text-sm italic leading-relaxed text-ink-500">
                Client testimonials will live here — this space is reserved for
                the first voices of the House.
              </blockquote>
              <figcaption className="mt-4 text-xs uppercase tracking-widest text-ink-400">
                Coming soon
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
