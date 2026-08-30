"use client";

import { useEffect, useState } from "react";
import { PremiumGate } from "@/components/PremiumGate";
import { MoonPhaseIcon } from "./MoonPhaseIcon";

interface Day {
  date: string;
  weekday: string;
  moon: string;
  phase: string;
  events: string[];
}

function DayRow({ d }: { d: Day }) {
  return (
    <li className="flex items-start gap-4 border-b border-pearl-300/60 py-3 last:border-0">
      <span className="w-24 shrink-0 font-semibold text-ink-900">{d.weekday}</span>
      <span className="mt-0.5 shrink-0"><MoonPhaseIcon phase={d.phase} /></span>
      <span className="text-sm leading-relaxed text-ink-700">
        Moon in <span className="text-rose-600">{d.moon}</span>
        {d.events.length > 0 && <> — {d.events.join(" · ")}</>}
      </span>
    </li>
  );
}

export function SkyWeek() {
  const [days, setDays] = useState<Day[] | null>(null);
  const [background, setBackground] = useState<string[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/sky-week")
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((d) => {
        if (!Array.isArray(d.days)) throw new Error("bad payload");
        setDays(d.days);
        setBackground(Array.isArray(d.background) ? d.background : []);
      })
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
      {background.length > 0 && (
        <p className="mt-4 rounded-lg border border-pearl-300/60 bg-pearl-200/40 px-3 py-2 text-center text-xs leading-relaxed text-ink-500">
          All week: {background.join(" · ")}
        </p>
      )}
      <p className="mt-4 text-center text-xs text-ink-400">
        The world&#39;s sky — for these moments landed in <em>your</em> chart,
        see your personal calendar.
      </p>
    </div>
  );
}
