"use client";

/**
 * North-Indian-style chart: the classic diamond. Houses hold fixed positions
 * (1st house always the top-center diamond, counting counter-clockwise);
 * signs rotate with the ascendant and are shown as rasi numbers, in the
 * traditional manner. Used for the Vedic D1 (Rasi) and D9 (Navamsa).
 */
import type { Body } from "@hoa/engine";
import { PLANET_GLYPHS, SIGN_COLORS } from "./glyphs";
import type { GridEntry } from "./RasiGrid";

/** Centroid of each house region (1-indexed order, unit square 0–100). */
const HOUSE_POS: [number, number][] = [
  [50, 26], // 1  top diamond — lagna
  [26, 11], // 2
  [11, 26], // 3
  [26, 50], // 4  left diamond
  [11, 74], // 5
  [26, 89], // 6
  [50, 74], // 7  bottom diamond
  [74, 89], // 8
  [89, 74], // 9
  [74, 50], // 10 right diamond
  [89, 26], // 11
  [74, 11], // 12
];

export function NorthIndianChart({
  title,
  entries,
}: {
  title: string;
  entries: GridEntry[];
}) {
  const asc = entries.find((e) => e.body === "ascendant")?.sign ?? 0;
  const planets = entries.filter((e) => e.body !== "ascendant");

  return (
    <figure>
      <svg
        viewBox="0 0 100 100"
        role="img"
        aria-label={`${title} chart, North Indian style`}
        className="aspect-square w-full rounded-lg border border-pearl-500 bg-pearl-200/40"
      >
        {/* Frame, diagonals, and the inner diamond */}
        <rect x="0.5" y="0.5" width="99" height="99" fill="none" stroke="#d8bfcd" strokeWidth="1" />
        <line x1="0" y1="0" x2="100" y2="100" stroke="#d8bfcd" strokeWidth="0.6" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="#d8bfcd" strokeWidth="0.6" />
        <path d="M 50 0 L 100 50 L 50 100 L 0 50 Z" fill="none" stroke="#d8bfcd" strokeWidth="0.6" />

        {HOUSE_POS.map(([x, y], i) => {
          const sign = (asc + i) % 12;
          const inHouse = planets.filter((p) => p.sign === sign);
          const rows: GridEntry[][] = [];
          for (let r = 0; r < inHouse.length; r += 4) rows.push(inHouse.slice(r, r + 4));
          return (
            <g key={i}>
              {/* Rasi number — the traditional label */}
              <text
                x={x}
                y={y - 3.5}
                textAnchor="middle"
                fontSize="4"
                fill={SIGN_COLORS[sign]}
                fontWeight="600"
              >
                {sign + 1}
              </text>
              {i === 0 && (
                <text x={x} y={y + 1} textAnchor="middle" fontSize="3" fill="#c75486" fontWeight="700">
                  La
                </text>
              )}
              {rows.map((row, r) => (
                <text
                  key={r}
                  x={x}
                  y={y + (i === 0 ? 5.5 : 2) + r * 5}
                  textAnchor="middle"
                  fontSize="4.6"
                  fill="#45304b"
                  className="astro-glyph"
                >
                  {row.map((e) => PLANET_GLYPHS[e.body as Body]).join(" ")}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-center font-heading text-sm italic text-rose-600/80">
        {title}
      </figcaption>
    </figure>
  );
}
