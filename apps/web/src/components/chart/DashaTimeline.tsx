"use client";

import { useState } from "react";
import type { VimshottariDasha } from "@hoa/engine";
import { BODY_NAMES } from "./glyphs";

function fmt(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function DashaTimeline({ dasha }: { dasha: VimshottariDasha }) {
  const now = Date.now();
  const currentIdx = dasha.mahadashas.findIndex(
    (m) => now >= Date.parse(m.start) && now < Date.parse(m.end)
  );
  const [open, setOpen] = useState<number | null>(
    currentIdx >= 0 ? currentIdx : null
  );

  return (
    <div>
      <p className="mb-4 text-sm text-moon-400">
        Moon in{" "}
        <span className="text-gold-300">
          {dasha.moonNakshatra.name} (pada {dasha.moonNakshatra.pada})
        </span>{" "}
        · first period {BODY_NAMES[dasha.moonNakshatra.lord as keyof typeof BODY_NAMES] ?? dasha.moonNakshatra.lord}{" "}
        with {(dasha.balanceOfFirst * 100).toFixed(0)}% remaining at birth
      </p>
      <ol className="space-y-1">
        {dasha.mahadashas.map((m, i) => {
          const isCurrent = i === currentIdx;
          const isOpen = open === i;
          return (
            <li key={i} className="overflow-hidden rounded-lg border border-night-700/70">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors hover:bg-night-800 ${
                  isCurrent ? "bg-night-700/60" : "bg-night-900/40"
                }`}
                aria-expanded={isOpen}
              >
                <span>
                  <span className={isCurrent ? "font-semibold text-gold-300" : "text-moon-100"}>
                    {BODY_NAMES[m.lord]} mahadasha
                  </span>
                  {isCurrent && (
                    <span className="ml-2 rounded-full bg-gold-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold-300">
                      now
                    </span>
                  )}
                </span>
                <span className="tabular-nums text-xs text-moon-400">
                  {fmt(m.start)} — {fmt(m.end)} {isOpen ? "▴" : "▾"}
                </span>
              </button>
              {isOpen && m.sub && (
                <ul className="divide-y divide-night-800 border-t border-night-700/70 bg-night-950/50">
                  {m.sub.map((s, j) => {
                    const subCurrent =
                      now >= Date.parse(s.start) && now < Date.parse(s.end);
                    return (
                      <li
                        key={j}
                        className={`flex items-center justify-between px-5 py-1.5 text-xs ${
                          subCurrent ? "text-gold-300" : "text-moon-400"
                        }`}
                      >
                        <span>
                          {BODY_NAMES[m.lord]} · {BODY_NAMES[s.lord]}
                          {subCurrent && " ← current"}
                        </span>
                        <span className="tabular-nums">
                          {fmt(s.start)} — {fmt(s.end)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
