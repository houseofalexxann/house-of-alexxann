"use client";

/**
 * South-Indian-style fixed-sign grid, used for the Vedic D1 (Rasi) and
 * D9 (Navamsa) charts. Signs occupy fixed cells; bodies render inside their
 * sign's cell.
 */
import type { Body } from "@hoa/engine";
import { PLANET_GLYPHS, SIGN_GLYPHS } from "./glyphs";

/** Grid (row, col) for each sign index 0=Aries…11=Pisces in the classic layout. */
const CELL: [number, number][] = [
  [0, 1], // Aries
  [0, 2], // Taurus
  [0, 3], // Gemini
  [1, 3], // Cancer
  [2, 3], // Leo
  [3, 3], // Virgo
  [3, 2], // Libra
  [3, 1], // Scorpio
  [3, 0], // Sagittarius
  [2, 0], // Capricorn
  [1, 0], // Aquarius
  [0, 0], // Pisces
];

export interface GridEntry {
  body: Body | "ascendant";
  sign: number;
}

export function RasiGrid({
  title,
  entries,
}: {
  title: string;
  entries: GridEntry[];
}) {
  const bySign: Record<number, GridEntry[]> = {};
  for (const e of entries) (bySign[e.sign] ??= []).push(e);

  const cells = Array.from({ length: 4 }, () =>
    Array.from({ length: 4 }, () => null as null | { sign: number })
  );
  CELL.forEach(([r, c], sign) => (cells[r][c] = { sign }));

  return (
    <figure>
      <div
        className="grid aspect-square grid-cols-4 grid-rows-4 overflow-hidden rounded-lg border border-night-500"
        role="img"
        aria-label={`${title} chart grid`}
      >
        {cells.flatMap((row, r) =>
          row.map((cell, c) => {
            if (!cell) {
              if (r === 1 && c === 1) {
                return (
                  <div
                    key={`${r}${c}`}
                    className="col-span-2 row-span-2 flex items-center justify-center border border-night-700/50 bg-night-900/60"
                  >
                    <span className="font-heading text-lg italic text-gold-400/80">{title}</span>
                  </div>
                );
              }
              return null;
            }
            const list = bySign[cell.sign] ?? [];
            return (
              <div
                key={`${r}${c}`}
                className="relative flex min-h-16 flex-wrap content-start gap-x-1.5 gap-y-0.5 border border-night-700/50 bg-night-800/40 p-1.5 pt-5"
              >
                <span className="absolute left-1.5 top-1 text-[10px] text-moon-500">
                  {SIGN_GLYPHS[cell.sign]}
                </span>
                {list.map((e) => (
                  <span
                    key={e.body}
                    className={
                      e.body === "ascendant"
                        ? "text-xs font-semibold text-gold-300"
                        : "text-sm text-moon-100"
                    }
                    title={e.body}
                  >
                    {e.body === "ascendant" ? "As" : PLANET_GLYPHS[e.body as Body]}
                  </span>
                ))}
              </div>
            );
          })
        )}
      </div>
    </figure>
  );
}
