"use client";

/**
 * The chart wheel, the hero visual (PRD §10). Pure SVG from a ChartResult.
 *
 * Layout, outside in, the way the reference tools draw it:
 *   (transit ring, when a transit moment is laid over the chart) →
 *   zodiac band (signs, 5° and 10° ticks, fixed-star marks) →
 *   planet ring (glyph, then degree and minute toward the centre, ℞ if retrograde;
 *   asteroids and points join this ring in a lighter hand) →
 *   house cusps with numbers in their own quiet ring →
 *   the aspect disc, where every aspect line lives and nothing else does.
 *
 * The Ascendant sits at the left (9 o'clock) by convention and the houses
 * run counter-clockwise. With an unknown birth time the wheel orients 0°
 * Aries left and draws no houses or angles.
 *
 * Every label stays inside the viewBox: the angle labels sit just outside
 * the zodiac band, and the viewBox grows when the transit ring is present,
 * so nothing is ever cut off on the page or in the exported image.
 */
import type { ChartResult, PlanetPosition } from "@hoa/engine";
import {
  ASPECT_COLORS,
  PLANET_GLYPHS,
  SIGN_COLORS,
  SIGN_GLYPHS,
} from "./glyphs";
import { EXTRA_GLYPHS } from "@/lib/chart-key";

const BASE = 700;
const R_OUTER = 318; // zodiac band, outer edge
const R_ZODIAC = 280; // zodiac band, inner edge
const R_TICK = 268; // planet degree tick, inner end
const R_GLYPH = 246; // planet glyph
const R_LABEL = 216; // planet degree label
const R_HOUSE_NUM = 170; // house numbers
const R_DISC = 150; // the aspect disc
const R_ANGLE_LABEL = 336; // AC / DC / MC / IC, outside the band
const R_TRANSIT_GLYPH = 358; // transit ring
const R_TRANSIT_LABEL = 380; // transit degree labels, staggered outward to 396
const TRANSIT_PAD = 70; // extra viewBox on each side when the transit ring is drawn

/** Minimum angular gap between neighbouring glyphs, in degrees. */
const MIN_GAP = 8.5;

const GLYPH_FONT = "'Apple Symbols', 'Segoe UI Symbol', 'Noto Sans Symbols2', 'Cormorant Garamond', serif";
const TEXT_FONT = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const TRANSIT_COLOR = "#256f95";

export interface StarHit {
  name: string;
  longitude: number;
}

interface Props {
  chart: ChartResult;
  className?: string;
  /** Transiting planets for the outer ring. */
  transits?: PlanetPosition[] | null;
  /** Fixed stars conjunct the chart, marked on the zodiac band. */
  starHits?: StarHit[] | null;
}

const norm = (d: number) => ((d % 360) + 360) % 360;

/**
 * Spreads crowded bodies so no two glyphs sit closer than the gap, keeping
 * each cluster centred on its true positions rather than shoving everything
 * one way. Works around the circle by starting from the largest empty gap.
 */
function spread(longitudes: { key: string; lon: number }[], gap = MIN_GAP): Map<string, number> {
  const out = new Map<string, number>();
  if (longitudes.length === 0) return out;
  const sorted = [...longitudes].sort((a, b) => a.lon - b.lon);
  let gapStart = 0;
  let gapSize = -1;
  for (let i = 0; i < sorted.length; i++) {
    const next = sorted[(i + 1) % sorted.length];
    const g = norm(next.lon - sorted[i].lon) || 360;
    if (g > gapSize) {
      gapSize = g;
      gapStart = (i + 1) % sorted.length;
    }
  }
  const ring = [...sorted.slice(gapStart), ...sorted.slice(0, gapStart)];
  const base = ring[0].lon;
  const pos = ring.map((p) => norm(p.lon - base));
  // Relax: every pair closer than the gap is pushed apart symmetrically, so a
  // cluster settles centred on its true positions and a cluster's tail can
  // never be left overlapping the body after it. Converges in a few passes.
  for (let pass = 0; pass < 60; pass++) {
    let moved = false;
    for (let i = 0; i + 1 < pos.length; i++) {
      const short = gap - (pos[i + 1] - pos[i]);
      if (short > 1e-6) {
        pos[i] -= short / 2;
        pos[i + 1] += short / 2;
        moved = true;
      }
    }
    if (!moved) break;
  }
  ring.forEach((p, idx) => out.set(p.key, norm(base + pos[idx])));
  return out;
}

/**
 * Alternates label radii for neighbours closer than 12°, so labels never
 * collide. The walk starts just after the largest empty gap around the
 * circle, the same trick spread() uses, so the wrap needs no special case.
 */
function staggerLabels(order: { key: string; lon: number }[], outer: number, inner: number): Map<string, number> {
  const radius = new Map<string, number>();
  if (order.length === 0) return radius;
  const sorted = [...order].sort((a, b) => a.lon - b.lon);
  let gapStart = 0;
  let gapSize = -1;
  for (let i = 0; i < sorted.length; i++) {
    const g = norm(sorted[(i + 1) % sorted.length].lon - sorted[i].lon) || 360;
    if (g > gapSize) {
      gapSize = g;
      gapStart = (i + 1) % sorted.length;
    }
  }
  const walk = [...sorted.slice(gapStart), ...sorted.slice(0, gapStart)];
  let parity = 0;
  walk.forEach((p, i) => {
    const close = i > 0 && norm(p.lon - walk[i - 1].lon) < 12;
    parity = close ? 1 - parity : 0;
    radius.set(p.key, parity ? inner : outer);
  });
  return radius;
}

export function ChartWheel({ chart, className, transits, starHits }: Props) {
  const hasTransits = Boolean(transits && transits.length);
  const pad = hasTransits ? TRANSIT_PAD : 0;
  const size = BASE + pad * 2;
  const cx = size / 2;
  const cy = size / 2;

  const asc = chart.angles?.ascendant ?? 0;
  const theta = (lon: number) => 180 + (lon - asc);
  const pt = (lon: number, r: number) => {
    const a = (theta(lon) * Math.PI) / 180;
    return { x: cx + r * Math.cos(a), y: cy - r * Math.sin(a) };
  };
  const wedge = (a: number, b: number, rOut: number, rIn: number) => {
    const o1 = pt(a, rOut);
    const o2 = pt(b, rOut);
    const i2 = pt(b, rIn);
    const i1 = pt(a, rIn);
    return `M ${o1.x} ${o1.y} A ${rOut} ${rOut} 0 0 0 ${o2.x} ${o2.y} L ${i2.x} ${i2.y} A ${rIn} ${rIn} 0 0 1 ${i1.x} ${i1.y} Z`;
  };

  const extras = chart.extras ?? [];
  const ring = [
    ...chart.planets.map((p) => ({ key: p.body, lon: p.longitude })),
    ...extras.map((e) => ({ key: e.body, lon: e.longitude })),
  ];
  const display = spread(ring);
  const shown = ring.map((r) => ({ key: r.key, lon: display.get(r.key) ?? r.lon }));
  const labelRadius = staggerLabels(shown, R_LABEL, R_LABEL - 16);

  const transitDisplay = hasTransits
    ? spread(transits!.map((p) => ({ key: p.body, lon: p.longitude })), 7.5)
    : new Map<string, number>();
  const transitLabelRadius = hasTransits
    ? staggerLabels(
        transits!.map((p) => ({ key: p.body, lon: transitDisplay.get(p.body) ?? p.longitude })),
        R_TRANSIT_LABEL,
        R_TRANSIT_LABEL + 16
      )
    : new Map<string, number>();

  const timeKnown = Boolean(chart.angles && chart.houseCusps);
  const cusps = chart.houseCusps ?? [];

  const angleLabels: [string, number][] = chart.angles
    ? [
        ["AC", chart.angles.ascendant],
        ["DC", chart.angles.ascendant + 180],
        ["MC", chart.angles.midheaven],
        ["IC", chart.angles.midheaven + 180],
      ]
    : [];

  // Round to the minute first so 27°59.9′ reads 28°00′, never 27°60′.
  const degreeLabel = (degreeInSign: number) => {
    const total = Math.min(Math.round(degreeInSign * 60), 29 * 60 + 59);
    const degree = Math.floor(total / 60);
    const minute = total % 60;
    return `${degree}°${String(minute).padStart(2, "0")}′`;
  };

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Natal chart wheel${chart.angles ? `, ascendant ${chart.angles.formattedAscendant}` : ", birth time unknown"}${hasTransits ? ", with transits in the outer ring" : ""}`}
      className={className}
      style={{ maxWidth: "100%", height: "auto", overflow: "visible" }}
    >
      <defs>
        <radialGradient id="wheel-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="70%" stopColor="#fdf7f9" />
          <stop offset="100%" stopColor="#f6eaf0" />
        </radialGradient>
        <radialGradient id="wheel-disc" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#fbf3f6" stopOpacity="0.9" />
        </radialGradient>
      </defs>

      {/* Transit ring, faint, outside everything */}
      {hasTransits && (
        <circle cx={cx} cy={cy} r={R_TRANSIT_LABEL + 26} fill="none" stroke="#dbe9f1" strokeWidth="1" strokeDasharray="3 4" />
      )}

      {/* Ground */}
      <circle cx={cx} cy={cy} r={R_OUTER} fill="url(#wheel-bg)" stroke="#d9c3cb" strokeWidth="1.5" />

      {/* Zodiac band: a soft tint per sign, boundaries, glyphs, ticks */}
      {Array.from({ length: 12 }, (_, s) => {
        const start = s * 30;
        const a = pt(start, R_ZODIAC);
        const b = pt(start, R_OUTER);
        const mid = pt(start + 15, (R_OUTER + R_ZODIAC) / 2);
        return (
          <g key={s}>
            <path d={wedge(start, start + 30, R_OUTER, R_ZODIAC)} fill={SIGN_COLORS[s]} opacity="0.07" />
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#cfb6c0" strokeWidth="1" />
            {Array.from({ length: 5 }, (_, k) => {
              const d = start + (k + 1) * 5;
              const len = (k + 1) % 2 === 0 ? 9 : 5;
              const t1 = pt(d, R_ZODIAC);
              const t2 = pt(d, R_ZODIAC + len);
              return (
                <line key={k} x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} stroke="#cfb6c0" strokeWidth={len > 5 ? 0.8 : 0.5} />
              );
            })}
            <text
              x={mid.x}
              y={mid.y}
              fill={SIGN_COLORS[s]}
              fontSize="21"
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily={GLYPH_FONT}
              style={{ fontVariantEmoji: "text" }}
            >
              {SIGN_GLYPHS[s]}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={R_ZODIAC} fill="none" stroke="#d9c3cb" strokeWidth="1.2" />

      {/* Fixed stars conjunct the chart: a small gold star on the band's inner edge */}
      {starHits?.map((s, i) => {
        const p = pt(s.longitude, R_ZODIAC + 7);
        return (
          <text
            key={`${s.name}-${i}`}
            x={p.x}
            y={p.y}
            fill="#cf9c3f"
            fontSize="10"
            textAnchor="middle"
            dominantBaseline="central"
          >
            <title>{`${s.name} at ${degreeLabel(s.longitude % 30)}`}</title>✦
          </text>
        );
      })}

      {/* House cusps, from the disc out to the zodiac band; numbers in a quiet ring */}
      {timeKnown &&
        cusps.map((cusp, i) => {
          const inner = pt(cusp, R_DISC);
          const outer = pt(cusp, R_ZODIAC);
          const isAngle = i === 0 || i === 3 || i === 6 || i === 9;
          const next = cusps[(i + 1) % 12];
          const span = norm(next - cusp) || 30;
          const numPos = pt(cusp + span / 2, R_HOUSE_NUM);
          return (
            <g key={i}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={isAngle ? "#d4638f" : "#d9c3cb"}
                strokeWidth={isAngle ? 1.7 : 0.8}
                opacity={isAngle ? 0.9 : 0.75}
              />
              <circle cx={numPos.x} cy={numPos.y} r="9" fill="#fbf3f6" stroke="#ecdce2" strokeWidth="0.6" />
              <text
                x={numPos.x}
                y={numPos.y}
                fill="#9a86a6"
                fontSize="10.5"
                fontFamily={TEXT_FONT}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {i + 1}
              </text>
            </g>
          );
        })}

      {/* The aspect disc */}
      <circle cx={cx} cy={cy} r={R_DISC} fill="url(#wheel-disc)" stroke="#e6d4db" strokeWidth="1" />
      {chart.aspects.map((a, i) => {
        const pa = chart.planets.find((p) => p.body === a.a);
        const pb = chart.planets.find((p) => p.body === a.b);
        if (!pa || !pb) return null;
        const p1 = pt(pa.longitude, R_DISC);
        const p2 = pt(pb.longitude, R_DISC);
        const tight = a.orb < 2;
        return (
          <line
            key={i}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke={ASPECT_COLORS[a.type]}
            strokeWidth={tight ? 1.5 : 0.9}
            opacity={tight ? 0.85 : 0.42}
            strokeDasharray={a.type === "sextile" ? "4 3" : undefined}
          />
        );
      })}
      {chart.planets.map((p) => {
        const d = pt(p.longitude, R_DISC);
        return <circle key={p.body} cx={d.x} cy={d.y} r="2" fill="#7d6a8a" opacity="0.7" />;
      })}

      {/* Planets: true-degree tick, leader to the glyph if displaced, glyph, degree label */}
      {chart.planets.map((p) => {
        const lonDisplay = display.get(p.body) ?? p.longitude;
        const displaced = Math.abs(norm(lonDisplay - p.longitude + 180) - 180) > 1;
        const t1 = pt(p.longitude, R_ZODIAC);
        const t2 = pt(p.longitude, R_TICK);
        const g = pt(lonDisplay, R_GLYPH);
        const gEdge = pt(lonDisplay, R_GLYPH + 12);
        const lab = pt(lonDisplay, labelRadius.get(p.body) ?? R_LABEL);
        return (
          <g key={p.body}>
            <line x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} stroke="#45304b" strokeWidth="1.2" opacity="0.9" />
            {displaced && (
              <line x1={t2.x} y1={t2.y} x2={gEdge.x} y2={gEdge.y} stroke="#b9a5c2" strokeWidth="0.7" />
            )}
            <text
              x={g.x}
              y={g.y}
              fill="#3f2b48"
              fontSize="22"
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily={GLYPH_FONT}
              style={{ fontVariantEmoji: "text" }}
            >
              {PLANET_GLYPHS[p.body]}
            </text>
            <text
              x={lab.x}
              y={lab.y}
              fill="#7d6a8a"
              fontSize="9.5"
              fontFamily={TEXT_FONT}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {degreeLabel(p.degreeInSign)}
              {p.retrograde && (
                <tspan fill="#d4638f" fontSize="9" dx="2">
                  ℞
                </tspan>
              )}
            </text>
          </g>
        );
      })}

      {/* Asteroids and points, in a lighter hand on the same ring */}
      {extras.map((e) => {
        const lonDisplay = display.get(e.body) ?? e.longitude;
        const displaced = Math.abs(norm(lonDisplay - e.longitude + 180) - 180) > 1;
        const t1 = pt(e.longitude, R_ZODIAC);
        const t2 = pt(e.longitude, R_TICK + 3);
        const g = pt(lonDisplay, R_GLYPH);
        const gEdge = pt(lonDisplay, R_GLYPH + 10);
        const lab = pt(lonDisplay, labelRadius.get(e.body) ?? R_LABEL);
        return (
          <g key={e.body}>
            <line x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} stroke="#8d7797" strokeWidth="0.9" opacity="0.9" />
            {displaced && (
              <line x1={t2.x} y1={t2.y} x2={gEdge.x} y2={gEdge.y} stroke="#c9b9d1" strokeWidth="0.6" />
            )}
            <text
              x={g.x}
              y={g.y}
              fill="#6e5a7d"
              fontSize="17"
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily={GLYPH_FONT}
              style={{ fontVariantEmoji: "text" }}
            >
              {EXTRA_GLYPHS[e.body]}
            </text>
            <text
              x={lab.x}
              y={lab.y}
              fill="#7d6a8a"
              fontSize="8.5"
              fontFamily={TEXT_FONT}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {degreeLabel(e.degreeInSign)}
              {e.retrograde && (
                <tspan fill="#d4638f" fontSize="8" dx="2">
                  ℞
                </tspan>
              )}
            </text>
          </g>
        );
      })}

      {/* The four angles, labelled just outside the band */}
      {angleLabels.map(([label, lon]) => {
        const p = pt(lon, R_ANGLE_LABEL);
        const mark1 = pt(lon, R_OUTER);
        const mark2 = pt(lon, R_OUTER + 7);
        return (
          <g key={label}>
            <line x1={mark1.x} y1={mark1.y} x2={mark2.x} y2={mark2.y} stroke="#d4638f" strokeWidth="1.6" />
            <text
              x={p.x}
              y={p.y}
              fill="#d4638f"
              fontSize="12"
              fontWeight="600"
              fontFamily={TEXT_FONT}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {label}
            </text>
          </g>
        );
      })}

      {/* Transits: the sky of the chosen moment in the outer ring, in blue */}
      {hasTransits &&
        transits!.map((p) => {
          const lonDisplay = transitDisplay.get(p.body) ?? p.longitude;
          const displaced = Math.abs(norm(lonDisplay - p.longitude + 180) - 180) > 1;
          const t1 = pt(p.longitude, R_OUTER);
          const t2 = pt(p.longitude, R_OUTER + 9);
          const g = pt(lonDisplay, R_TRANSIT_GLYPH);
          const gEdge = pt(lonDisplay, R_TRANSIT_GLYPH - 11);
          const lab = pt(lonDisplay, transitLabelRadius.get(p.body) ?? R_TRANSIT_LABEL);
          return (
            <g key={`t-${p.body}`}>
              <line x1={t1.x} y1={t1.y} x2={t2.x} y2={t2.y} stroke={TRANSIT_COLOR} strokeWidth="1.3" />
              {displaced && (
                <line x1={t2.x} y1={t2.y} x2={gEdge.x} y2={gEdge.y} stroke="#9fc6d9" strokeWidth="0.7" />
              )}
              <text
                x={g.x}
                y={g.y}
                fill={TRANSIT_COLOR}
                fontSize="19"
                textAnchor="middle"
                dominantBaseline="central"
                fontFamily={GLYPH_FONT}
                style={{ fontVariantEmoji: "text" }}
              >
                {PLANET_GLYPHS[p.body]}
              </text>
              <text
                x={lab.x}
                y={lab.y}
                fill="#2f6f8f"
                fontSize="9"
                fontFamily={TEXT_FONT}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {degreeLabel(p.degreeInSign)}
                {p.retrograde && (
                  <tspan fill="#d4638f" fontSize="8.5" dx="2">
                    ℞
                  </tspan>
                )}
              </text>
            </g>
          );
        })}

      {/* Centre ornament */}
      <text
        x={cx}
        y={cy}
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
