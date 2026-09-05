"use client";

/**
 * South Indian chart: the fixed-sign square. Signs never move: Mesha (Aries)
 * is the second cell of the top row and the signs run clockwise from there,
 * so the houses are what rotate. The lagna is marked the traditional way,
 * with a diagonal stroke across its cell's corner and "As" with its degree.
 * Grahas are written with their two-letter abbreviations and degrees.
 *
 * Drawn as SVG so it exports exactly as it appears on the page.
 */
import type { Body } from "@hoa/engine";
import { PLANET_GLYPHS, SIGN_COLORS, SIGN_GLYPHS } from "./glyphs";
import { GRAHA_ABBR } from "@/lib/chart-key";
import type { ChartLabels } from "./NorthIndianChart";

/** Grid (row, col) for each sign index 0 = Aries … 11 = Pisces in the classic layout. */
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
  /** Degree within the sign, when known. */
  degree?: number;
  retrograde?: boolean;
}

const S = 400;
const C = S / 4;
const TEXT_FONT = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const GLYPH_FONT = "'Apple Symbols', 'Segoe UI Symbol', 'Noto Sans Symbols2', 'Cormorant Garamond', serif";

export function RasiGrid({
  title,
  entries,
  labels = "abbr",
}: {
  title: string;
  entries: GridEntry[];
  labels?: ChartLabels;
}) {
  const bySign: Record<number, GridEntry[]> = {};
  for (const e of entries) (bySign[e.sign] ??= []).push(e);
  const ascSign = entries.find((e) => e.body === "ascendant")?.sign;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${S} ${S}`}
        role="img"
        aria-label={`${title} chart, South Indian style${ascSign !== undefined ? `, lagna in rasi ${ascSign + 1}` : ""}`}
        className="aspect-square w-full rounded-lg"
        style={{ background: "linear-gradient(180deg, #fffdfd, #f9f1f4)" }}
      >
        <rect x="1" y="1" width={S - 2} height={S - 2} fill="none" stroke="#c9adb9" strokeWidth="1.6" />
        {/* Cell borders */}
        {[1, 2, 3].map((k) => (
          <g key={k}>
            <line x1={k * C} y1="0" x2={k * C} y2={S} stroke="#d3bcc6" strokeWidth="1" />
            <line x1="0" y1={k * C} x2={S} y2={k * C} stroke="#d3bcc6" strokeWidth="1" />
          </g>
        ))}
        {/* The centre block, one clean square */}
        <rect x={C + 1} y={C + 1} width={2 * C - 2} height={2 * C - 2} fill="#fdf8fa" />
        <text
          x={S / 2}
          y={S / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="16"
          fontStyle="italic"
          fontFamily="'Cormorant Garamond', Georgia, serif"
          fill="#c75486"
        >
          {title}
        </text>

        {CELL.map(([r, c], sign) => {
          const x0 = c * C;
          const y0 = r * C;
          const list = [
            ...(bySign[sign] ?? []).filter((e) => e.body === "ascendant"),
            ...(bySign[sign] ?? []).filter((e) => e.body !== "ascendant"),
          ];
          const rows: GridEntry[][] = [];
          for (let i = 0; i < list.length; i += 2) rows.push(list.slice(i, i + 2));
          const isLagna = ascSign === sign;
          const fontSize = 12;
          const lineH = 15.5;
          const blockTop = y0 + C / 2 + 4 - ((rows.length - 1) * lineH) / 2;
          return (
            <g key={sign}>
              {isLagna && (
                <line x1={x0 + 1} y1={y0 + 22} x2={x0 + 22} y2={y0 + 1} stroke="#c75486" strokeWidth="1.4" />
              )}
              <text
                x={x0 + 6}
                y={y0 + 11}
                fontSize="11"
                fontFamily={GLYPH_FONT}
                fill={SIGN_COLORS[sign]}
                opacity="0.85"
                style={{ fontVariantEmoji: "text" }}
              >
                {SIGN_GLYPHS[sign]}
              </text>
              {rows.map((row, i) => (
                <text
                  key={i}
                  x={x0 + C / 2}
                  y={blockTop + i * lineH}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={fontSize}
                  fontFamily={labels === "glyph" ? GLYPH_FONT : TEXT_FONT}
                  fill="#3f2b48"
                  style={{ fontVariantEmoji: "text" }}
                >
                  {row.map((e, k) => (
                    <tspan
                      key={e.body}
                      dx={k === 0 ? 0 : 7}
                      fill={e.body === "ascendant" ? "#c75486" : "#3f2b48"}
                      fontWeight={e.body === "ascendant" ? 700 : 500}
                    >
                      {e.body === "ascendant"
                        ? "As"
                        : labels === "abbr"
                          ? GRAHA_ABBR[e.body as Body]
                          : PLANET_GLYPHS[e.body as Body]}
                      {typeof e.degree === "number" && (
                        <tspan fill="#8d7797" fontSize={fontSize - 2.5} fontFamily={TEXT_FONT} dx="1.5">
                          {Math.floor(e.degree)}°
                        </tspan>
                      )}
                      {e.retrograde && (
                        <tspan fill="#d4638f" fontSize={fontSize - 2.5} fontFamily={TEXT_FONT} dx="1">
                          ℞
                        </tspan>
                      )}
                    </tspan>
                  ))}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
