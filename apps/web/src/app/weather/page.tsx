import type { Metadata } from "next";
import Link from "next/link";
import { DateTime } from "luxon";
import { skyWeatherAt, weekWeather } from "@hoa/engine";
import { prisma } from "@/lib/db";
import { sessionUser } from "@/lib/user-auth";
import { isAdmin } from "@/lib/admin-auth";
import { formatMembershipPrice, isActiveMember, TIER_NAMES } from "@/lib/membership";
import { getSettings } from "@/lib/settings";
import {
  CONDITION_COPY,
  WEATHER_NOT_FATE,
  bodyName,
  describeAspect,
  describeHighlight,
  shortDate,
  weekdayLabel,
} from "@/lib/weather-meanings";
import { personalToday, personalWeek } from "@/lib/personal-weather";
import { WeatherMeter, WeatherSky } from "@/components/weather/WeatherSky";
import { WeekStrip, type StripDay } from "@/components/weather/WeekStrip";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Astro weather: today's sky as a forecast, and the week ahead",
  description:
    "The sky read as weather: today's conditions from the exact contacts between the planets, the Moon at its real phase, and a seven-day forecast, computed with the Swiss Ephemeris. Members see it landed in their own chart.",
};

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function WeatherPage() {
  const now = new Date();
  const nowIso = now.toISOString().replace(/\.\d{3}Z$/, "Z");
  const today = skyWeatherAt(nowIso);
  const week = weekWeather(nowIso, 7);
  const copy = CONDITION_COPY[today.conditions];

  const [user, adminSession, settings] = await Promise.all([sessionUser(), isAdmin(), getSettings()]);
  const member = isActiveMember(user) || adminSession;
  const priceLabel = formatMembershipPrice(settings.membershipPriceCents);
  const profile =
    member && user
      ? await prisma.birthProfile.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
      : null;
  const personal = profile
    ? { today: personalToday(profile, nowIso), week: personalWeek(profile, nowIso) }
    : null;
  const zone = profile?.timezone || "UTC";

  const strip: StripDay[] = week.map((d, i) => {
    const c = CONDITION_COPY[d.conditions];
    return {
      date: d.date,
      label: weekdayLabel(d.date, i),
      short: shortDate(d.date),
      phase: d.moon.phase,
      moonSign: d.moon.sign,
      moonSignName: d.moon.signName,
      conditionLabel: c.label,
      tagline: c.tagline,
      accent: c.tone.accent,
      glow: c.tone.glow,
      highlights: d.highlights.map(describeHighlight),
      charge: d.charge,
      activity: d.activity,
    };
  });

  const todayHighlights = week[0]?.highlights.map(describeHighlight) ?? [];
  const retro = today.retrogrades.map((b) => cap(bodyName(b)));

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-10 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-lilac-600">
          ☽ The Weather Glass
        </p>
        <h1 className="text-4xl text-ink-900 sm:text-5xl">Today&#39;s sky, read as weather</h1>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink-500">
          Not a prediction. A forecast of conditions: how much of today&#39;s sky is
          in exact contact, whether that contact is ease or tension, and what
          the Moon is doing about it.
        </p>
      </header>

      {/* TODAY: the dome and the reading */}
      <section className="grid gap-6 lg:grid-cols-5" aria-labelledby="today-h">
        <div className="lg:col-span-3">
          <WeatherSky sky={today} tone={copy.tone.glow} accent={copy.tone.accent} />
        </div>
        <div className="card p-6 lg:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: copy.tone.accent }}>
            Conditions
          </p>
          <h2 id="today-h" className="mt-2 font-heading text-4xl text-ink-900">
            {copy.label}
          </h2>
          <p className="mt-1 font-heading text-lg italic text-ink-700">{copy.tagline}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-500">{copy.reflection}</p>
          <WeatherMeter charge={today.charge} ease={today.ease} activity={today.activity} />

          {today.aspects.length > 0 && (
            <div className="mt-5 border-t border-pearl-300/50 pt-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-500">
                Loudest contacts
              </p>
              <ul className="mt-2 space-y-1 text-sm text-ink-700">
                {today.aspects.slice(0, 4).map((a) => (
                  <li key={`${a.a}-${a.b}-${a.type}`} className="flex items-baseline justify-between gap-3">
                    <span>{describeAspect(a)}</span>
                    <span className="shrink-0 text-[11px] tabular-nums text-ink-400">
                      {a.orb.toFixed(1)}°{a.applying ? ", applying" : a.applying === false ? ", separating" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(todayHighlights.length > 0 || retro.length > 0) && (
            <div className="mt-5 border-t border-pearl-300/50 pt-4 text-sm text-ink-700">
              {todayHighlights.length > 0 && (
                <p>
                  <span className="text-ink-500">Today: </span>
                  {todayHighlights.join(" · ")}
                </p>
              )}
              {retro.length > 0 && (
                <p className="mt-1">
                  <span className="text-ink-500">Retrograde: </span>
                  {retro.join(", ")}
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* LANDED IN YOUR CHART */}
      <section className="mt-12" aria-labelledby="personal-h">
        <h2 id="personal-h" className="text-center font-heading text-3xl text-ink-900">
          The same sky, landed in your chart
        </h2>
        <hr className="gold-rule mx-auto my-6 w-32" />

        {!user && !adminSession ? (
          <div className="card p-8 text-center">
            <p className="text-ink-700">
              Your weather is read against your own birth chart, so the House needs to know who you are.{" "}
              <Link href="/login" className="text-rose-500 hover:underline">Sign in</Link> or{" "}
              <Link href="/signup" className="text-rose-500 hover:underline">create a free account</Link>.
            </p>
          </div>
        ) : !member ? (
          <div className="card p-8 text-center">
            <p className="font-heading text-2xl text-ink-900">
              Your weather is a {TIER_NAMES.member} room.
            </p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-500">
              It reads today&#39;s sky against your placements: which of your houses
              the Moon is moving through, every transiting planet in orb of your
              natal points right now, and the exact hits ahead this week, dated
              in your own timezone.
            </p>
            <Link href="/join" className="btn-gold mt-6 inline-flex text-sm">
              Become a {TIER_NAMES.member} for {priceLabel} a month
            </Link>
          </div>
        ) : !personal ? (
          <div className="card p-8 text-center">
            <p className="font-heading text-2xl text-ink-900">One thing first: your birth details.</p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-500">
              Cast your chart in the Studio and save it to your account. The
              weather reads the sky against that chart, so it needs the chart
              before it can say anything true.
            </p>
            <Link href="/western" className="btn-gold mt-6 inline-flex text-sm">
              Cast and save my chart
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card border-rose-300/60 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">Today, for you</p>
              <h3 className="mt-2 font-heading text-2xl text-ink-900">
                The Moon is in your {personal.today.moonHouse}
                <sup>{ordinalSuffix(personal.today.moonHouse)}</sup> house
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">
                {cap(personal.today.moonHouseName)}: {personal.today.moonHouseTopics}. The Moon
                spends about two and a half days here, colouring the mood of
                these matters rather than deciding them.
              </p>
              {personal.today.contacts.length === 0 ? (
                <p className="mt-4 text-sm text-ink-500">
                  No transiting planet is within orb of your natal points right
                  now. A quiet day in your chart, whatever the world&#39;s sky is doing.
                </p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {personal.today.contacts.map((c) => (
                    <li key={`${c.transiting}-${c.natal}-${c.aspect}`} className="border-t border-pearl-300/50 pt-3">
                      <p className="text-sm font-semibold text-ink-900">{c.title}</p>
                      <p className="text-[11px] text-ink-400">
                        {c.where} · {c.orb.toFixed(1)}° {c.applying ? "and tightening" : c.applying === false ? "and easing" : ""}
                        {c.provenance === "modern-practice" ? " · modern practice" : ""}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-500">{c.reflection}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="card p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-lilac-600">This week, for you</p>
              <h3 className="mt-2 font-heading text-2xl text-ink-900">Exact hits ahead</h3>
              {personal.week.length === 0 ? (
                <p className="mt-3 text-sm text-ink-500">
                  Nothing goes exact to your natal points in the next seven days.
                </p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {personal.week.map((e) => (
                    <li key={`${e.utc}-${e.title}`} className="border-t border-pearl-300/50 pt-3">
                      <p className="text-[11px] uppercase tracking-[0.15em] text-ink-400">
                        {DateTime.fromISO(e.utc, { zone: "utc" }).setZone(zone).toFormat("ccc, LLL d, h:mm a")}
                      </p>
                      <p className="text-sm font-semibold text-ink-900">{e.title}</p>
                      {e.where && <p className="text-[11px] text-ink-400">{e.where}</p>}
                    </li>
                  ))}
                </ul>
              )}
              <Link href="/calendar" className="mt-5 inline-flex text-sm text-rose-500 hover:underline">
                The whole year, in your calendar
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* THE WEEK */}
      <section className="mt-12" aria-labelledby="week-h">
        <h2 id="week-h" className="text-center font-heading text-3xl text-ink-900">
          The week ahead, day by day
        </h2>
        <p className="mt-2 text-center text-sm text-ink-500">
          Each day read at noon UTC. Conditions name the sky, not your day.
        </p>
        <hr className="gold-rule mx-auto my-6 w-32" />
        <WeekStrip days={strip} />
      </section>

      <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-ink-400">
        {WEATHER_NOT_FATE} For the dated major events,{" "}
        <Link href="/transits" className="text-rose-500 hover:underline">the sky now</Link>.
      </p>
    </div>
  );
}

function ordinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] ?? s[v] ?? s[0];
}
