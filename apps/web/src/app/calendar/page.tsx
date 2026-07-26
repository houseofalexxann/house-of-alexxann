import type { Metadata } from "next";
import Link from "next/link";
import { DateTime } from "luxon";
import { prisma } from "@/lib/db";
import { sessionUser } from "@/lib/user-auth";
import { isAdmin } from "@/lib/admin-auth";
import { isActiveMember, TIER_NAMES } from "@/lib/membership";
import { calendarToken } from "@/lib/calendar-token";
import { buildPersonalCalendar } from "@/lib/personal-calendar";
import { POINT_LABEL } from "@/lib/transit-meanings";
import { baseUrl } from "@/lib/bookings";
import { CalendarFeed } from "@/components/calendar/CalendarFeed";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your calendar",
  description:
    "Your personal timing calendar: the annual profection governing your year, and the transits ahead read against your own natal chart.",
};

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

export default async function CalendarPage() {
  const [user, adminSession] = await Promise.all([sessionUser(), isAdmin()]);
  const member = isActiveMember(user) || adminSession;

  if (!user && !adminSession) {
    return (
      <Shell>
        <p className="text-ink-700">
          Your calendar is built from your own chart, so the House needs to
          know who you are.{" "}
          <Link href="/login" className="text-rose-600 hover:underline">
            Sign in
          </Link>{" "}
          or{" "}
          <Link href="/signup" className="text-rose-600 hover:underline">
            create a free account
          </Link>
          .
        </p>
      </Shell>
    );
  }

  if (!member) {
    return (
      <Shell>
        <div className="card p-8 text-center">
          <p className="font-heading text-2xl text-ink-900">
            The personal calendar is a {TIER_NAMES.member} room.
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-500">
            It reads the sky ahead against your own birth chart: the annual
            profection governing your year, every transit to your natal
            placements with its exact date, lunations placed in your houses,
            and a feed you can subscribe to in any calendar app.
          </p>
          <Link href="/join" className="btn-gold mt-6 inline-flex text-sm">
            Become a {TIER_NAMES.member} — $5/month
          </Link>
        </div>
      </Shell>
    );
  }

  const profile = user
    ? await prisma.birthProfile.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      })
    : null;

  if (!profile) {
    return (
      <Shell>
        <div className="card p-8 text-center">
          <p className="font-heading text-2xl text-ink-900">
            One thing first: your birth details.
          </p>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-500">
            Cast your chart in the Studio and save it to your account. The
            calendar reads the sky against that chart, so it needs the chart
            before it can say anything true.
          </p>
          <Link href="/western" className="btn-gold mt-6 inline-flex text-sm">
            Cast and save my chart
          </Link>
        </div>
      </Shell>
    );
  }

  const now = new Date();
  const cal = buildPersonalCalendar(
    profile,
    now.toISOString(),
    new Date(now.getTime() + 365 * 86_400_000).toISOString(),
    { maxEvents: 220 }
  );

  // Group by month in the profile's own timezone, so dates read locally.
  const zone = profile.timezone || "UTC";
  const byMonth = new Map<string, typeof cal.entries>();
  for (const e of cal.entries) {
    const key = DateTime.fromISO(e.utc, { zone: "utc" }).setZone(zone).toFormat("LLLL yyyy");
    const list = byMonth.get(key) ?? [];
    list.push(e);
    byMonth.set(key, list);
  }

  const feedUrl = user ? `${baseUrl()}/api/calendar/${calendarToken(user.id)}` : "";
  const p = cal.profection;

  return (
    <Shell>
      {/* The year you are in */}
      <section className="card border-rose-300/60 p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
          Your profected year
        </p>
        <h2 className="mt-2 font-heading text-3xl text-ink-900">
          Age {p.age}: the {ordinal(p.house)} house wakes up
        </h2>
        <p className="mt-3 leading-relaxed text-ink-700">
          From {DateTime.fromISO(p.startUtc).setZone(zone).toFormat("LLLL d, yyyy")} to{" "}
          {DateTime.fromISO(p.endUtc).setZone(zone).toFormat("LLLL d, yyyy")}, your year
          profects to <strong className="text-ink-900">{p.signName}</strong>, your{" "}
          {ordinal(p.house)} house: {p.houseTopic}.
        </p>
        <p className="mt-3 leading-relaxed text-ink-700">
          That makes{" "}
          <strong className="text-ink-900">{POINT_LABEL[p.lordOfYear]}</strong> your
          Lord of the Year, so themes of {p.lordKeynote} carry extra weight until your
          next birthday.
          {p.lordNatalHouse && (
            <>
              {" "}
              In your birth chart {POINT_LABEL[p.lordOfYear]} sits in{" "}
              {p.lordNatalSignName}, in your {ordinal(p.lordNatalHouse)} house, which is
              where much of the year tends to point.
            </>
          )}
        </p>
        <p className="mt-4 rounded-lg border border-pearl-300 bg-white/60 p-3 text-xs leading-relaxed text-ink-500">
          <strong className="text-ink-700">Where this comes from:</strong> annual
          profection is a Hellenistic time-lord technique preserved in Vettius Valens
          and Paulus Alexandrinus, recovered by Project Hindsight and taught in detail
          by Chris Brennan (<em>Hellenistic Astrology: The Study of Fate and Fortune</em>,
          2017) and on The Astrology Podcast. Historical doctrine, offered for
          reflection rather than prediction.
        </p>
      </section>

      {/* Subscribe */}
      <CalendarFeed url={feedUrl} />

      {/* The year ahead */}
      <section className="mt-12">
        <h2 className="font-heading text-3xl text-ink-900">The year ahead</h2>
        <p className="mt-2 text-sm text-ink-500">
          {cal.entries.length} moments computed from your chart, in {zone.replace("_", " ")}.
          Times are exact to the minute.
        </p>

        <div className="mt-8 space-y-10">
          {[...byMonth.entries()].map(([month, entries]) => (
            <div key={month}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-rose-500">
                {month}
              </h3>
              <ul className="mt-4 space-y-3">
                {entries.map((e, i) => (
                  <li key={`${e.utc}-${i}`} className="card p-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="font-medium text-ink-900">{e.title}</p>
                      <p className="text-xs tabular-nums text-ink-400">
                        {DateTime.fromISO(e.utc, { zone: "utc" })
                          .setZone(zone)
                          .toFormat("ccc LLL d, h:mm a")}
                      </p>
                    </div>
                    {e.where && (
                      <p className="mt-1 text-xs uppercase tracking-wide text-lilac-600">
                        {e.where}
                      </p>
                    )}
                    <p className="mt-2 text-sm leading-relaxed text-ink-700">{e.reflection}</p>
                    {e.provenance === "modern-practice" && (
                      <p className="mt-2 text-xs italic text-ink-400">
                        Modern practice: Uranus, Neptune and Pluto have no classical
                        significations, so this reading comes from twentieth-century
                        astrology rather than the older tradition.
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-12 rounded-xl border border-pearl-300 bg-white/60 p-4 text-xs leading-relaxed text-ink-500">
        Every position here is computed with the Swiss Ephemeris from your exact birth
        data. The interpretations are traditional significations applied to those
        positions, offered as reflection and never as prediction or as medical, legal,
        or financial advice. Charts describe weather, not verdicts.
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-10 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
          Your calendar
        </p>
        <h1 className="text-4xl text-ink-900">The sky, keyed to your chart</h1>
        <p className="mx-auto mt-3 max-w-xl leading-relaxed text-ink-500">
          Not the general weather. Yours: the year you are actually in, and the
          moments the sky makes contact with your own placements.
        </p>
      </header>
      {children}
    </div>
  );
}
