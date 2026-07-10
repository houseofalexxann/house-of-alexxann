import Link from "next/link";
import { SERVICES, formatPrice } from "@/lib/services";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="relative flex flex-col items-center pb-20 pt-24 text-center sm:pt-32">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-gold-400">
          Western · Vedic · Modern &amp; Mystical
        </p>
        <h1 className="max-w-3xl text-5xl leading-tight text-moon-100 sm:text-6xl">
          The sky you were born under
          <span className="block italic text-gold-300">still remembers you.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-moon-300">
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
          className="pointer-events-none absolute -z-10 h-[560px] w-[560px] opacity-[0.07]"
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
        >
          <circle cx="100" cy="100" r="98" fill="none" stroke="#e3c578" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="78" fill="none" stroke="#e3c578" strokeWidth="0.3" />
          <circle cx="100" cy="100" r="58" fill="none" stroke="#8b97f8" strokeWidth="0.3" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={100 + 78 * Math.cos(a)}
                y1={100 + 78 * Math.sin(a)}
                x2={100 + 98 * Math.cos(a)}
                y2={100 + 98 * Math.sin(a)}
                stroke="#e3c578"
                strokeWidth="0.4"
              />
            );
          })}
        </svg>
      </section>

      <hr className="gold-rule" />

      {/* Offerings */}
      <section className="py-20">
        <h2 className="text-center text-3xl text-moon-100 sm:text-4xl">Readings</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-moon-400">
          Three ways to sit with your chart — live on video, by phone, or in
          person.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {SERVICES.map((s) => (
            <article key={s.slug} className="card flex flex-col p-6">
              <h3 className="text-2xl text-gold-300">{s.title}</h3>
              <p className="mt-1 text-sm italic text-moon-400">{s.tagline}</p>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-moon-300">
                {s.description}
              </p>
              <div className="mt-6 flex items-center justify-between border-t border-night-600/60 pt-4">
                <span className="text-sm text-moon-400">
                  {s.durationMinutes} min ·{" "}
                  <span className="text-moon-100">{formatPrice(s.priceCents)}</span>
                </span>
                <Link
                  href={`/services/${s.slug}`}
                  className="text-sm font-medium text-gold-400 hover:text-gold-300"
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
          <h2 className="text-3xl text-moon-100">The Chart Studio is open — and free.</h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-moon-300">
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
        <h2 className="text-center text-3xl text-moon-100">Kind words</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <figure key={i} className="card p-6">
              <div aria-hidden className="text-gold-400">✦ ✦ ✦ ✦ ✦</div>
              <blockquote className="mt-4 text-sm italic leading-relaxed text-moon-400">
                Client testimonials will live here — this space is reserved for
                the first voices of the House.
              </blockquote>
              <figcaption className="mt-4 text-xs uppercase tracking-widest text-moon-500">
                Coming soon
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
