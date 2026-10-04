"use client";

import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { PremiumGate } from "@/components/PremiumGate";
import { MoonPhaseIcon } from "@/components/transits/MoonPhaseIcon";
import { SIGN_GLYPHS } from "@/components/chart/glyphs";

export interface StripDay {
  date: string;
  label: string;
  short: string;
  phase: string;
  moonSign: number;
  moonSignName: string;
  conditionLabel: string;
  tagline: string;
  accent: string;
  glow: string;
  highlights: string[];
  charge: number;
  activity: number;
}

function DayCard({ d, index, animate }: { d: StripDay; index: number; animate: boolean }) {
  return (
    <li
      className={`${animate ? "wx-rise" : ""} card flex h-full flex-col p-4`}
      style={{
        animationDelay: `${index * 90}ms`,
        boxShadow: `inset 0 1px 0 rgba(${d.glow}, 0.35)`,
      }}
    >
      <div className="flex items-baseline justify-between">
        <span className="font-semibold text-ink-900">{d.label}</span>
        <span className="text-[11px] text-ink-400">{d.short}</span>
      </div>
      <div className="mt-3 flex items-center gap-2.5">
        <MoonPhaseIcon phase={d.phase} size={26} />
        <span className="flex items-center gap-1 text-sm text-ink-700">
          <span aria-hidden className="astro-glyph text-base text-lilac-500">
            {SIGN_GLYPHS[d.moonSign]}
          </span>
          Moon in <span className="text-rose-500">{d.moonSignName}</span>
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span
          aria-hidden
          className="h-2 w-2 rounded-full"
          style={{ background: d.accent, boxShadow: `0 0 8px rgba(${d.glow}, 0.8)` }}
        />
        <span className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: d.accent }}>
          {d.conditionLabel}
        </span>
      </div>
      <p className="mt-1 text-xs text-ink-500">{d.tagline}</p>
      {d.highlights.length > 0 && (
        <ul className="mt-3 space-y-1 border-t border-pearl-300/50 pt-2 text-xs leading-relaxed text-ink-700">
          {d.highlights.slice(0, 3).map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Seven days, each a small weather card. Today is open to every doll; the
 * rest of the week sits behind the veil, visible as a soft preview so people
 * know exactly what membership holds.
 */
export function WeekStrip({ days }: { days: StripDay[] }) {
  const reduced = usePrefersReducedMotion();
  const animate = reduced === false;
  const [today, ...rest] = days;
  if (!today) return null;

  return (
    <div className={`grid gap-4 lg:grid-cols-7 ${animate ? "wx-animate" : ""}`}>
      <ul className="contents">
        <DayCard d={today} index={0} animate={animate} />
      </ul>
      <div className="lg:col-span-6">
        <PremiumGate title="The rest of the week is for Venusian Dolls">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {rest.map((d, i) => (
              <DayCard key={d.date} d={d} index={i + 1} animate={animate} />
            ))}
          </ul>
        </PremiumGate>
      </div>
    </div>
  );
}
