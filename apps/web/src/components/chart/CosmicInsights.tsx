"use client";

/**
 * Cosmic insights: the first things a reader would pull from this chart,
 * computed from the cast and laid out as small lit cards.
 */
import { useState } from "react";
import type { ChartResult } from "@hoa/engine";
import { computeInsights } from "@/lib/chart-insights";

export function CosmicInsights({ chart }: { chart: ChartResult }) {
  // Read the clock once per mount so render stays pure (the dasha needs it).
  const [now] = useState(() => Date.now());
  const insights = computeInsights(chart, now);

  return (
    <div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {insights.map((it) => (
          <li
            key={it.id}
            className="relative overflow-hidden rounded-xl border border-pearl-300/70 bg-pearl-200/40 p-4"
          >
            <span
              aria-hidden
              className="astro-glyph absolute right-3 top-2 text-2xl text-rose-400/60"
            >
              {it.mark}
            </span>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-400">{it.title}</p>
            <p className="mt-1.5 pr-10 font-heading text-lg leading-snug text-ink-900">{it.fact}</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-500">{it.note}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-center text-xs text-ink-400">
        Computed from this chart by the House. Tendencies and themes, never verdicts.
      </p>
    </div>
  );
}
