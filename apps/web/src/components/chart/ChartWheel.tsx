"use client";

/**
 * The chart wheel — the hero visual (PRD §10). Pure SVG, renders from a
 * ChartResult. Ascendant sits at the left (9 o'clock) per convention; with
 * an unknown birth time the wheel orients 0° Aries left and hides houses.
 */
import type { ChartResult } from "@hoa/engine";
import {
  ASPECT_COLORS,
  PLANET_GLYPHS,
  SIGN_COLORS,
  SIGN_GLYPHS,
} from "./glyphs";

const CX = 300;
const CY = 300;
const R_OUTER = 290;
const R_ZODIAC_INNER = 248;
const R_HOUSE_NUM = 110;
const R_INNER = 92;
const R_PLANET = 205;
const R_TICK = 248;
const R_ASPECT = 178;

interface Props {
  chart: ChartResult;
  className?: string;
}

export function ChartWheel({ chart, className }: Props) {
  const asc = chart.angles?.ascendant ?? 0;
  // Screen angle (deg, math convention w/ flipped y) for an ecliptic longitude.
  const theta = (lon: number) => 180 + (lon - asc);
  const pt = (lon: number, r: number) => {
    const a = (theta(lon) * Math.PI) / 180;
    return { x: CX + r * Math.cos(a), y: CY - r * Math.sin(a) };
  };

  // Spread planets that crowd within 7° so glyphs never overlap.
  const sorted = [...chart.planets].sort((a, b) => a.longitude - b.longitude);
  const displayLon = new Map<string, number>();
  const MIN_GAP = 7;
  let prev: number | null = null;
  for (const p of sorted) {
    let lon = p.longitude;
    if (prev !== null && lon - prev < MIN_GAP) lon = prev + MIN_GAP;
    displayLon.set(p.body, lon);
    prev = lon;
  }
  // Wrap-around collision between last and first.
  if (sorted.length > 1) {
    const first = displayLon.get(sorted[0].body)!;
    const last = displayLon.get(sorted[sorted.length - 1].body)!;
    if (first + 360 - last < MIN_GAP) {
      displayLon.set(sorted[0].body, last + MIN_GAP - 360);
    }
  }

  return (
    <svg
      viewBox="0 0 600 600"
      role="img"
      aria-label="Natal chart wheel"
      className={className}
      style={{ maxWidth: "100%", height: "auto" }}
    >
      <defs>
        <radialGradient id="wheel-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="78%" stopColor="#fdf6f8" />
          <stop offset="100%" stopColor="#f7ebf0" />
        </radialGradient>
      </defs>

      <circle cx={CX} cy={CY} r={R_OUTER} fill="url(#wheel-bg)" stroke="#d9c3cb" strokeWidth="1.5" />
      <circle cx={CX} cy={CY} r={R_ZODIAC_INNER} fill="none" stroke="#d9c3cb" strokeWidth="1" />
      <circle cx={CX} cy={CY} r={R_INNER} fill="none" stroke="#ecdcdf" strokeWidth="1" />
      <circle cx={CX} cy={CY} r={R_ASPECT} fill="none" stroke="#f0e2e6" strokeWidth="0.75" />

      {/* Zodiac ring: segment boundaries + glyphs + 10° ticks */}
      {Array.from({ length: 12 }, (_, s) => {
        const start = s * 30;
        const a = pt(start, R_ZODIAC_INNER);
        const b = pt(start, R_OUTER);
        const mid = pt(start + 15, (R_OUTER + R_ZODIAC_INNER) / 2);
        return (
          <g key={s}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#d9c3cb" strokeWidth="1" />
            <text
              x={mid.x}
              y={mid.y}
              fill={SIGN_COLORS[s]}
              fontSize="20"
              textAnchor="middle"
              dominantBaseline="central"
              opacity="0.98"
              fontFamily="'Apple Symbols', 'Segoe UI Symbol', 'Noto Sans Symbols2', serif"
              style={{ fontVariantEmoji: "text" }}
            >
              {SIGN_GLYPHS[s]}
            </text>
            {[10, 20].map((t) => {
              const t1 = pt(start + t, R_ZODIAC_INNER);
              const t2 = pt(start + t, R_ZODIAC_INNER + 8);
              return (
                <line key={t} x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} stroke="#d9c3cb" strokeWidth="0.6" />
              );
            })}
          </g>
        );
      })}

      {/* House cusps + numbers */}
      {chart.houseCusps &&
        chart.houseCusps.map((cusp, i) => {
          const inner = pt(cusp, R_INNER);
          const outer = pt(cusp, R_ZODIAC_INNER);
          const isAngle = i === 0 || i === 9;
          const next = chart.houseCusps![(i + 1) % 12];
          const span = (next - cusp + 360) % 360;
          const numPos = pt(cusp + span / 2, R_HOUSE_NUM);
          return (
            <g key={i}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={isAngle ? "#d4638f" : "#d9c3cb"}
                strokeWidth={isAngle ? 1.6 : 0.8}
                opacity={isAngle ? 0.9 : 0.7}
              />
              <text
                x={numPos.x}
                y={numPos.y}
                fill="#a794b0"
                fontSize="11"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

      {/* AC / MC labels */}
      {chart.angles && (
        <>
          {(
            [
              ["AC", chart.angles.ascendant],
              ["MC", chart.angles.midheaven],
            ] as const
          ).map(([label, lon]) => {
            const p = pt(lon, R_OUTER + 14);
            return (
              <text
                key={label}
                x={p.x}
                y={p.y}
                fill="#d4638f"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {label}
              </text>
            );
          })}
        </>
      )}

      {/* Aspect lines */}
      {chart.aspects.map((a, i) => {
        const pa = chart.planets.find((p) => p.body === a.a)!;
        const pb = chart.planets.find((p) => p.body === a.b)!;
        const p1 = pt(pa.longitude, R_ASPECT);
        const p2 = pt(pb.longitude, R_ASPECT);
        return (
          <line
            key={i}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={ASPECT_COLORS[a.type]}
            strokeWidth={a.orb < 2 ? 1.4 : 0.8}
            opacity={a.orb < 2 ? 0.85 : 0.45}
          />
        );
      })}

      {/* Planets: exact-degree tick + glyph at spread position */}
      {chart.planets.map((p) => {
        const lonDisplay = displayLon.get(p.body)!;
        const tick1 = pt(p.longitude, R_TICK);
        const tick2 = pt(p.longitude, R_TICK - 9);
        const g = pt(lonDisplay, R_PLANET);
        const deg = pt(lonDisplay, R_PLANET - 26);
        return (
          <g key={p.body}>
            <line x1={tick1.x} y1={tick1.y} x2={tick2.x} y2={tick2.y} stroke="#45304b" strokeWidth="1.1" opacity="0.9" />
            <text
              x={g.x}
              y={g.y}
              fill="#45304b"
              fontSize="21"
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily="'Apple Symbols', 'Segoe UI Symbol', 'Noto Sans Symbols2', serif"
              style={{ fontVariantEmoji: "text" }}
            >
              {PLANET_GLYPHS[p.body]}
            </text>
            <text
              x={deg.x}
              y={deg.y}
              fill="#8d7797"
              fontSize="9.5"
              textAnchor="middle"
              dominantBaseline="central"
            >
              {Math.floor(p.degreeInSign)}°{p.retrograde ? " ℞" : ""}
            </text>
          </g>
        );
      })}

      {/* Center ornament */}
      <text
        x={CX}
        y={CY}
        fill="#d4638f"
        fontSize="14"
        textAnchor="middle"
        dominantBaseline="central"
        opacity="0.7"
      >
        ✦
      </text>
    </svg>
  );
}
