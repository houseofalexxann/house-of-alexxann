import type { Metadata } from "next";
import Link from "next/link";
import { SERVICES, FORMAT_LABELS, formatPrice } from "@/lib/services";

export const metadata: Metadata = {
  title: "Readings & Pricing",
  description:
    "Natal, transit and Vedic readings with Alexandria — live on video, by phone, or in person. Durations, pricing and what each session covers.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6">
      {/* Intro */}
      <header className="mx-auto max-w-2xl text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-gold-400">
          Readings &amp; Pricing
        </p>
        <h1 className="text-4xl text-moon-100 sm:text-5xl">
          Sit with your chart.
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-moon-300">
          Every reading begins the same way: your chart, cast to the minute and
          the meridian, and an hour or more of undivided attention. Choose the
          sky you want to look through — the map you were born with, the season
          ahead, or the Vedic view of time itself.
        </p>
      </header>

      <hr className="gold-rule mt-16" />

      {/* Services */}
      <section className="mt-16 space-y-8">
        {SERVICES.map((s) => (
          <article
            key={s.slug}
            className="card flex flex-col gap-8 p-8 sm:p-10 md:flex-row"
          >
            {/* What the reading is */}
            <div className="flex-1">
              <h2 className="text-3xl text-gold-300">
                <Link href={`/services/${s.slug}`} className="hover:text-gold-400">
                  {s.title}
                </Link>
              </h2>
              <p className="mt-1 italic text-moon-400">{s.tagline}</p>
              <p className="mt-5 leading-relaxed text-moon-300">
                {s.description}
              </p>
              <ul className="mt-6 space-y-2.5">
                {s.bullets.map((b) => (
                  <li key={b} className="flex gap-3 text-sm leading-relaxed text-moon-300">
                    <span aria-hidden className="mt-0.5 text-gold-400">
                      ✦
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>

            {/* How to book it */}
            <div className="flex shrink-0 flex-col justify-between gap-6 border-t border-night-600/60 pt-6 md:w-56 md:border-l md:border-t-0 md:pl-8 md:pt-0">
              <div>
                <p className="text-3xl text-moon-100">
                  {formatPrice(s.priceCents)}
                </p>
                <p className="mt-1 text-sm text-moon-400">
                  {s.durationMinutes} minutes
                </p>
                <ul className="mt-5 space-y-1.5">
                  {s.formats.map((f) => (
                    <li key={f} className="text-sm text-moon-400">
                      {FORMAT_LABELS[f]}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-3">
                <Link href={`/book/${s.slug}`} className="btn-gold text-center">
                  Book
                </Link>
                <Link
                  href={`/services/${s.slug}`}
                  className="text-center text-sm font-medium text-gold-400 hover:text-gold-300"
                >
                  Full details →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* Studio aside */}
      <p className="mt-16 text-center text-sm text-moon-400">
        Not ready for a reading?{" "}
        <Link href="/studio" className="font-medium text-gold-400 hover:text-gold-300">
          Cast your chart free in the Studio
        </Link>{" "}
        — it&apos;s the same engine Alexandria reads from.
      </p>
    </div>
  );
}
