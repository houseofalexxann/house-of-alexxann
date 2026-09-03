import type { Metadata } from "next";
import Link from "next/link";
import { SkyWeek } from "@/components/transits/SkyWeek";
import { MajorEvents } from "@/components/transits/MajorEvents";

export const metadata: Metadata = {
  title: "The sky now: transits, eclipses & the week ahead",
  description:
    "The living sky: eclipses, new and full moons, retrograde stations and cazimis for the weeks ahead, plus a 7-day forecast, computed with the Swiss Ephemeris.",
};

export default function TransitsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-12 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-lilac-600">
          ◐ The Living Orbit
        </p>
        <h1 className="text-4xl text-ink-900 sm:text-5xl">The sky, right now</h1>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink-500">
          The moments worth circling: eclipses, lunations, stations and
          cazimis. Then the week ahead, day by day. All of it computed, none
          of it guessed.
        </p>
      </header>

      {/* Dates worth circling */}
      <section>
        <h2 className="text-center font-heading text-3xl text-ink-900">
          Dates worth circling
        </h2>
        <p className="mt-2 text-center text-sm text-ink-500">
          The next two months of major sky events.
        </p>
        <hr className="gold-rule mx-auto my-6 w-32" />
        <MajorEvents />
      </section>

      {/* The week, day by day */}
      <section className="mt-16">
        <h2 className="mb-6 text-center font-heading text-3xl text-ink-900">
          The week, day by day
        </h2>
        <SkyWeek />
      </section>

      {/* Where this lands for YOU */}
      <section className="card mt-12 border-rose-300/60 p-8 text-center">
        <h2 className="font-heading text-2xl text-ink-900">
          The same sky, landed in your chart
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-500">
          These are the world&#39;s events. The personal calendar reads them
          against your own placements: which houses the eclipses light, when
          the big transits touch your natal planets, and the profected year
          you are actually in.
        </p>
        <Link href="/calendar" className="btn-gold mt-5 inline-flex text-sm">
          Open my calendar
        </Link>
      </section>
    </div>
  );
}
