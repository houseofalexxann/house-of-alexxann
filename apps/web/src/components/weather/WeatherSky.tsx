"use client";

import type { SkyWeather } from "@hoa/engine";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { ASPECT_COLORS, BODY_NAMES, PLANET_GLYPHS, SIGN_GLYPHS } from "@/components/chart/glyphs";
import { MoonPhaseIcon } from "@/components/transits/MoonPhaseIcon";

/**
 * The sky dome: today's planets set along an arc of the ecliptic, the Moon
 * drawn at its real phase, and the day's exact contacts as threads between
 * them. The threads breathe, the glyphs drift, the day's own light pulses
 * underneath. Every position is the engine's; the motion is decoration and
 * switches off entirely under reduced motion (and stays off until the
 * preference is known, so nothing moves during hydration).
 *
 * Geometry: a 800 by 340 box. Longitude 0 sits at the left horizon, 180 at
 * the zenith, 360 back at the right horizon, so the whole zodiac reads as one
 * arch of sky. The SVG draws the arc and the threads; the glyphs are HTML
 * laid over it in the same coordinate space, so the drawn moon and the real
 * typographic glyphs stay crisp at any size.
 */
const W = 800;
const H = 340;
const CX = 400;
const CY = 300;
const RX = 350;
const RY = 235;

/** Two decimals: enough for the eye, and identical on server and client, so
 *  hydration never sees a cosine that differs in its sixteenth digit. */
function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

interface Placed {
  body: SkyWeather["planets"][number]["body"];
  x: number;
  y: number;
}

function place(planets: SkyWeather["planets"]): Placed[] {
  // Sort by longitude so clustered planets can be pushed outward in turn.
  const sorted = [...planets].sort((a, b) => a.longitude - b.longitude);
  const out: Placed[] = [];
  let lastLon = -999;
  let bump = 0;
  for (const p of sorted) {
    bump = p.longitude - lastLon < 7 ? bump + 28 : 0;
    lastLon = p.longitude;
    const theta = Math.PI * (1 - p.longitude / 360);
    out.push({
      body: p.body,
      x: r2(CX + (RX + bump) * Math.cos(theta)),
      y: r2(CY - (RY + bump) * Math.sin(theta)),
    });
  }
  return out;
}

export function WeatherSky({
  sky,
  tone,
  accent,
}: {
  sky: SkyWeather;
  tone: string;
  accent: string;
}) {
  const reduced = usePrefersReducedMotion();
  const animate = reduced === false;
  const placed = place(sky.planets);
  const at = Object.fromEntries(placed.map((p) => [p.body, p])) as Record<string, Placed>;
  const threads = sky.aspects.slice(0, 8);
  const moon = sky.planets.find((p) => p.body === "moon")!;

  return (
    <div
      className={`wx-sky relative overflow-hidden rounded-2xl border border-pearl-300/60 ${animate ? "wx-animate" : ""}`}
      style={{
        aspectRatio: `${W} / ${H}`,
        background: `radial-gradient(ellipse 72% 62% at 50% 96%, rgba(${tone}, 0.3), transparent 70%), linear-gradient(180deg, rgba(23,18,31,0.2), rgba(23,18,31,0.75))`,
      }}
    >
      {/* The day's own light, pulsing slowly under the horizon */}
      <div
        aria-hidden
        className="wx-glow pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
        style={{
          background: `radial-gradient(ellipse 55% 70% at 50% 100%, rgba(${tone}, 0.35), transparent 70%)`,
        }}
      />

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="absolute inset-0 h-full w-full"
        aria-hidden
        focusable="false"
      >
        {/* The horizon and the arc of the ecliptic */}
        <line x1="0" y1={CY} x2={W} y2={CY} stroke="rgba(246,240,249,0.14)" strokeWidth="1" />
        <path
          d={`M ${CX - RX} ${CY} A ${RX} ${RY} 0 0 1 ${CX + RX} ${CY}`}
          fill="none"
          stroke="rgba(246,240,249,0.18)"
          strokeWidth="1"
          strokeDasharray="2 5"
        />
        {/* Degree ticks at the sign boundaries */}
        {Array.from({ length: 13 }, (_, i) => {
          const theta = Math.PI * (1 - (i * 30) / 360);
          const x = r2(CX + RX * Math.cos(theta));
          const y = r2(CY - RY * Math.sin(theta));
          const x2 = r2(CX + (RX - 7) * Math.cos(theta));
          const y2 = r2(CY - (RY - 7) * Math.sin(theta));
          return (
            <line key={i} x1={x} y1={y} x2={x2} y2={y2} stroke="rgba(246,240,249,0.25)" strokeWidth="1" />
          );
        })}

        {/* The contacts: threads between planets, heaviest brightest */}
        {threads.map((a, i) => {
          const p = at[a.a];
          const q = at[a.b];
          if (!p || !q) return null;
          const strength = Math.min(1, a.weight / 1.2);
          // Bow the thread toward the zenith so crossing threads stay legible.
          const mx = r2((p.x + q.x) / 2);
          const my = r2((p.y + q.y) / 2 - 28 - strength * 20);
          return (
            <path
              key={`${a.a}-${a.b}-${a.type}`}
              d={`M ${p.x} ${p.y} Q ${mx} ${my} ${q.x} ${q.y}`}
              fill="none"
              stroke={ASPECT_COLORS[a.type]}
              strokeWidth={0.8 + strength * 1.8}
              strokeLinecap="round"
              className="wx-thread"
              style={{
                opacity: 0.3 + strength * 0.6,
                animationDelay: `${i * 420}ms`,
              }}
            />
          );
        })}

        {/* A halo under the Moon */}
        {at.moon && (
          <circle
            cx={at.moon.x}
            cy={at.moon.y}
            r="26"
            fill={accent}
            opacity="0.14"
            className="wx-halo"
          />
        )}
      </svg>

      {/* The planets themselves, laid over the drawing in the same space */}
      {placed.map((p, i) => {
        const data = sky.planets.find((q) => q.body === p.body)!;
        const label = `${BODY_NAMES[p.body]} at ${Math.floor(data.degreeInSign)}° ${data.signName}${data.retrograde ? ", retrograde" : ""}`;
        return (
          <div
            key={p.body}
            className="wx-float absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{
              left: `${(p.x / W) * 100}%`,
              top: `${(p.y / H) * 100}%`,
              animationDelay: `${(i % 5) * 700}ms`,
            }}
            title={label}
          >
            {p.body === "moon" ? (
              <MoonPhaseIcon phase={sky.moon.phase} size={30} />
            ) : (
              <span
                aria-hidden
                className="astro-glyph text-[22px] leading-none text-rose-400 drop-shadow-[0_0_6px_rgba(245,169,184,0.45)]"
              >
                {PLANET_GLYPHS[p.body]}
              </span>
            )}
            <span aria-hidden className="mt-0.5 flex items-center gap-0.5 text-[10px] text-ink-500">
              <span className="astro-glyph text-[11px] text-lilac-500">{SIGN_GLYPHS[data.sign]}</span>
              <span className="tabular-nums">{Math.floor(data.degreeInSign)}°</span>
              {data.retrograde && <span className="font-semibold text-lilac-500">℞</span>}
            </span>
            <span className="sr-only">{label}</span>
          </div>
        );
      })}

      {/* Corner caption: the Moon, in words */}
      <p className="absolute bottom-2 left-3 text-[11px] text-ink-500">
        Moon {Math.floor(moon.degreeInSign)}° {moon.signName}, {sky.moon.phase.toLowerCase()},{" "}
        {Math.round(sky.moon.illumination * 100)}% lit
      </p>
      <p className="absolute bottom-2 right-3 text-[11px] text-ink-400">
        {sky.aspects.length} contact{sky.aspects.length === 1 ? "" : "s"} in orb
      </p>
    </div>
  );
}

/** Tension against ease, as one bar, with how full the sky is underneath. */
export function WeatherMeter({ charge, ease, activity }: { charge: number; ease: number; activity: number }) {
  const c = Math.round(charge * 100);
  const e = Math.round(ease * 100);
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-ink-500">
        <span>Tension {c}%</span>
        <span>Ease {e}%</span>
      </div>
      <div
        className="mt-1.5 flex h-2 w-full overflow-hidden rounded-full bg-pearl-300/50"
        role="img"
        aria-label={`Tension ${c} percent, ease ${e} percent, activity ${Math.round(activity * 100)} percent`}
      >
        <span className="h-full bg-rose-400 transition-[width]" style={{ width: `${c}%`, opacity: 0.45 + activity * 0.55 }} />
        <span className="h-full bg-lilac-500 transition-[width]" style={{ width: `${e}%`, opacity: 0.45 + activity * 0.55 }} />
      </div>
      <p className="mt-1.5 text-[11px] text-ink-400">
        Activity {Math.round(activity * 100)}%: how much of the sky is in exact contact at all.
      </p>
    </div>
  );
}
