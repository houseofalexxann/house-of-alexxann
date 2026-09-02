import Link from "next/link";
import { SERVICES, formatPrice } from "@/lib/services";
import { SkyFilm } from "@/components/home/SkyFilm";
import { SkyTonight } from "@/components/home/SkyTonight";
import { RegionDoors } from "@/components/home/RegionDoors";

/** The sky strip is computed at render; regenerate hourly, not per request. */
export const revalidate = 3600;

export default function HomePage() {
  return (
    <div>
      {/* The opening film — scroll the sky */}
      <SkyFilm />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <hr className="gold-rule" />

      {/* The sky, for real */}
      <SkyTonight />

      <hr className="gold-rule" />

      {/* One House, every door — as celestial regions */}
      <RegionDoors />

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
    </div>
  );
}
