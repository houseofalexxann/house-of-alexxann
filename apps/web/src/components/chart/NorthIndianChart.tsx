"use client";

/**
 * North Indian chart: the classic diamond, drawn the way Jyotish software
 * and hand-drawn charts draw it.
 *
 * - Houses hold fixed positions. The 1st house is the top-centre diamond and
 *   the count runs counter-clockwise: 2nd and 3rd in the top-left corner,
 *   4th the left diamond, 5th and 6th bottom-left, 7th the bottom diamond,
 *   8th and 9th bottom-right, 10th the right diamond, 11th and 12th top-right.
 * - Signs rotate with the lagna and appear as rasi numbers (1 = Mesha/Aries
 *   through 12 = Meena/Pisces), written at the inner corner of each house
 *   the way the tradition places them.
 * - Grahas are written with their standard two-letter abbreviations and
 *   their degree in the sign; the lagna is marked "As" with its degree.
 *   Glyphs are available as an alternative labelling.
 *
 * Used for the D1 (Rasi) and D9 (Navamsa).
 */
import type { Body } from "@hoa/engine";
import { PLANET_GLYPHS, SIGN_COLORS } from "./glyphs";
import { GRAHA_ABBR } from "@/lib/chart-key";
import type { GridEntry } from "./RasiGrid";

export type ChartLabels = "abbr" | "glyph";

const S = 400;
const H = S / 2;
const Q = S / 4;

/**
 * Each house: where its text sits, the inner vertex where the rasi number
 * goes, and its shape. The side triangles (3, 5, 9, 11) are tall and narrow,
 * so they take one graha per line and sit a little in from the edge; the
 * top and bottom triangles are wide and short, so two per line fits.
 */
const EDGE = Q / 3 + 9;
const HOUSES: {
  centroid: [number, number];
  vertex: [number, number];
  kind: "diamond" | "wide" | "tall";
}[] = [
  { centroid: [H, Q], vertex: [H, H], kind: "diamond" }, // 1 top
  { centroid: [Q, Q / 3], vertex: [Q, Q], kind: "wide" }, // 2 top-left, upper
  { centroid: [EDGE, Q], vertex: [Q, Q], kind: "tall" }, // 3 top-left, lower
  { centroid: [Q, H], vertex: [H, H], kind: "diamond" }, // 4 left
  { centroid: [EDGE, H + Q], vertex: [Q, H + Q], kind: "tall" }, // 5 bottom-left, upper
  { centroid: [Q, S - Q / 3], vertex: [Q, H + Q], kind: "wide" }, // 6 bottom-left, lower
  { centroid: [H, H + Q], vertex: [H, H], kind: "diamond" }, // 7 bottom
  { centroid: [H + Q, S - Q / 3], vertex: [H + Q, H + Q], kind: "wide" }, // 8 bottom-right, lower
  { centroid: [S - EDGE, H + Q], vertex: [H + Q, H + Q], kind: "tall" }, // 9 bottom-right, upper
  { centroid: [H + Q, H], vertex: [H, H], kind: "diamond" }, // 10 right
  { centroid: [S - EDGE, Q], vertex: [H + Q, Q], kind: "tall" }, // 11 top-right, lower
  { centroid: [H + Q, Q / 3], vertex: [H + Q, Q], kind: "wide" }, // 12 top-right, upper
];

const TEXT_FONT = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const GLYPH_FONT = "'Apple Symbols', 'Segoe UI Symbol', 'Noto Sans Symbols2', 'Cormorant Garamond', serif";

function label(e: GridEntry, labels: ChartLabels): string {
  if (e.body === "ascendant") return "As";
  return labels === "abbr" ? GRAHA_ABBR[e.body as Body] : PLANET_GLYPHS[e.body as Body];
}

function degreeText(e: GridEntry): string {
  return typeof e.degree === "number" ? `${Math.floor(e.degree)}°` : "";
}

export function NorthIndianChart({
  title,
  entries,
  labels = "abbr",
}: {
  title: string;
  entries: GridEntry[];
  labels?: ChartLabels;
}) {
  const ascEntry = entries.find((e) => e.body === "ascendant");
  const asc = ascEntry?.sign ?? 0;
  const lagnaKnown = Boolean(ascEntry);

  return (
    <figure>
      <svg
        viewBox={`0 0 ${S} ${S}`}
        role="img"
        aria-label={`${title} chart, North Indian style, ${
          lagnaKnown ? `lagna in rasi ${asc + 1}` : "lagna unknown, counted from Mesha"
        }`}
        className="aspect-square w-full rounded-lg"
        style={{ background: "linear-gradient(180deg, #fffdfd, #f9f1f4)" }}
      >
        {/* Frame, diagonals, inner diamond */}
        <rect x="1" y="1" width={S - 2} height={S - 2} fill="none" stroke="#c9adb9" strokeWidth="1.6" />
        <line x1="0" y1="0" x2={S} y2={S} stroke="#d3bcc6" strokeWidth="1" />
        <line x1={S} y1="0" x2="0" y2={S} stroke="#d3bcc6" strokeWidth="1" />
        <path d={`M ${H} 0 L ${S} ${H} L ${H} ${S} L 0 ${H} Z`} fill="none" stroke="#d3bcc6" strokeWidth="1" />

        {HOUSES.map((house, i) => {
          const sign = (asc + i) % 12;
          const here = entries.filter((e) => e.sign === sign);
          // Lagna first, then the grahas in their traditional order of listing.
          const ordered = [
            ...here.filter((e) => e.body === "ascendant"),
            ...here.filter((e) => e.body !== "ascendant"),
          ];
          const perRow = house.kind === "diamond" ? 3 : house.kind === "wide" ? 2 : 1;
          const rows: GridEntry[][] = [];
          for (let r = 0; r < ordered.length; r += perRow) rows.push(ordered.slice(r, r + perRow));

          // The rasi number sits at the house's inner corner, nudged into the house.
          const [vx, vy] = house.vertex;
          const [cx, cy] = house.centroid;
          const nx = vx + (cx - vx) * 0.16;
          const ny = vy + (cy - vy) * 0.16;

          const fontSize = house.kind === "diamond" ? 12.5 : 11.5;
          const lineH = fontSize + 3.5;
          // Text block centred on the centroid, shifted a touch away from the number.
          const shiftX = house.kind === "tall" ? (cx < vx ? -3 : 3) : 0;
          const shiftY = house.kind === "wide" ? (cy < vy ? -3 : 3) : 0;
          const blockTop = cy + shiftY - ((rows.length - 1) * lineH) / 2;

          return (
            <g key={i}>
              {/* Rasi number in ink for contrast on the plate; a dot carries the sign's colour. */}
              <circle cx={nx} cy={ny - 9} r="1.8" fill={SIGN_COLORS[sign]} />
              <text
                x={nx}
                y={ny}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12"
                fontWeight="700"
                fontFamily={TEXT_FONT}
                fill="#4a3a58"
              >
                {sign + 1}
              </text>
              {rows.map((row, r) => (
                <text
                  key={r}
                  x={cx + shiftX}
                  y={blockTop + r * lineH}
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
                      {label(e, labels)}
                      {degreeText(e) && (
                        <tspan fill="#8d7797" fontSize={fontSize - 2.5} fontFamily={TEXT_FONT} dx="1.5">
                          {degreeText(e)}
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
      <figcaption className="mt-2 text-center font-heading text-sm italic text-rose-600/80">
        {title}
        {!lagnaKnown && (
          <span className="mt-1 block font-sans text-xs not-italic text-ink-500">
            Birth time unknown, so the lagna and houses cannot be placed. Signs are shown
            counting from Mesha.
          </span>
        )}
      </figcaption>
    </figure>
  );
}
