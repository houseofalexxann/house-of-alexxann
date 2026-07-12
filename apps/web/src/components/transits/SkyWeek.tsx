"use client";

import { useEffect, useState } from "react";
import { PremiumGate } from "@/components/PremiumGate";

interface Day {
  date: string;
  weekday: string;
  moon: string;
  phase: string;
  events: string[];
}

const MOON_GLYPHS: Record<string, string> = {
  "New Moon": "🌑", "Waxing Crescent": "🌒", "First Quarter": "🌓",
  "Waxing Gibbous": "🌔", "Full Moon": "🌕",
  "Waning Gibbous (Disseminating)": "🌖", "Last Quarter": "🌗",
  "Waning Crescent (Balsamic)": "🌘",
};

function DayRow({ d }: { d: Day }) {
  return (
    <li className="flex items-start gap-4 border-b border-pearl-300/60 py-3 last:border-0">
      <span className="w-24 shrink-0 font-semibold text-ink-900">{d.weekday}</span>
      <span aria-hidden className="shrink-0 text-lg">{MOON_GLYPHS[d.phase] ?? "☽"}</span>
      <span className="text-sm leading-relaxed text-ink-700">
        Moon in <span className="text-rose-600">{d.moon}</span>
        {d.events.length > 0 && <> — {d.events.join(" · ")}</>}
      </span>
    </li>
  );
}

export function SkyWeek() {
  const [days, setDays] = useState<Day[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/sky-week")
      .then((r) => r.json())
      .then((d) => setDays(d.days))
      .catch(() => setError(true));
  }, []);

  if (error) return <p className="text-sm text-ink-500">The sky is shy right now — try a refresh.</p>;
  if (!days) return <p className="text-sm text-ink-500">Reading the week&#39;s sky…</p>;

  return (
    <div className="card p-6">
      <h2 className="text-center font-heading text-2xl text-ink-900">Your 7-day sky</h2>
      <hr className="gold-rule mx-auto mt-3 w-32" />
      {/* Today is free for every doll. */}
      <ul className="mt-4">
        <DayRow d={days[0]} />
      </ul>
      {/* The rest of the week waits behind the veil. */}
      <PremiumGate title="The rest of the week is for Venusian Dolls" preview={false}>
        <ul>
          {days.slice(1).map((d) => (
            <DayRow key={d.date} d={d} />
          ))}
        </ul>
      </PremiumGate>
      <p className="mt-4 text-center text-xs text-ink-400">
        The world&#39;s sky — personal transits to <em>your</em> chart arrive
        with saved birth profiles.
      </p>
    </div>
  );
}
