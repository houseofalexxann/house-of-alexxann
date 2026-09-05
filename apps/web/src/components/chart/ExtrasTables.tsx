"use client";

/**
 * Tables for the Western additions: asteroids and points, fixed-star
 * conjunctions, and the transit snapshot laid over the natal chart.
 */
import type {
  ExtraBody,
  ExtraPosition,
  FixedStarPosition,
  PlanetPosition,
  StarConjunction,
  TransitAspect,
} from "@hoa/engine";
import { ASPECT_SYMBOLS, ORDINALS, PLANET_GLYPHS, SIGN_NAMES } from "./glyphs";
import { EXTRA_KEY, PLANET_KEY } from "@/lib/chart-key";

const HEAD = "border-b border-pearl-400 text-left text-xs uppercase tracking-widest text-ink-400";
const CELL = "py-2 pr-3";

/** Plain names without glyphs (the glyph is drawn separately). */
function planetName(body: string): string {
  return PLANET_KEY.find((p) => p.body === body)?.name ?? body;
}

function pointLabel(point: string): string {
  if (point === "ascendant") return "Ascendant";
  if (point === "midheaven") return "Midheaven";
  const extra = EXTRA_KEY.find((e) => e.body === point);
  if (extra) return extra.name;
  return planetName(point);
}

export function AsteroidTable({
  extras,
  unavailable = [],
}: {
  extras: ExtraPosition[];
  unavailable?: ExtraBody[];
}) {
  return (
    <div className="overflow-x-auto">
      {unavailable.length > 0 && (
        <p className="mb-3 text-xs leading-relaxed text-rose-500">
          {unavailable.map((b) => EXTRA_KEY.find((k) => k.body === b)?.name ?? b).join(", ")}{" "}
          could not be computed for this date on this server; the rest are shown.
        </p>
      )}
      <table className="w-full text-sm">
        <thead>
          <tr className={HEAD}>
            <th className={`${CELL} font-medium`}>Point</th>
            <th className={`${CELL} font-medium`}>Position</th>
            <th className={`${CELL} font-medium`}>House</th>
            <th className="py-2 font-medium">Motion</th>
          </tr>
        </thead>
        <tbody>
          {extras.map((e) => {
            const key = EXTRA_KEY.find((k) => k.body === e.body);
            return (
              <tr key={e.body} className="border-b border-pearl-300/60">
                <td className={CELL}>
                  <span aria-hidden className="astro-glyph mr-2 text-rose-400">{key?.glyph}</span>
                  {key?.name ?? e.body}
                </td>
                <td className={CELL}>
                  {e.formatted} <span className="text-ink-700">{SIGN_NAMES[e.sign]}</span>
                </td>
                <td className={`${CELL} text-ink-500`}>{e.house ? ORDINALS[e.house - 1] : "·"}</td>
                <td className="py-2 text-ink-500">
                  {e.retrograde ? (
                    <>
                      <span aria-hidden>℞ </span>retrograde
                    </>
                  ) : (
                    "direct"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function FixedStarTable({
  conjunctions,
  stars,
}: {
  conjunctions: StarConjunction[];
  stars: FixedStarPosition[];
}) {
  if (conjunctions.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-ink-500">
        No catalogued star sits within one degree of your planets or angles. With{" "}
        {stars.length} stars at a one-degree orb that is unusual; most charts pick up
        a few. Fixed stars are read only by close conjunction, so nothing here is
        missing, the sky simply kept its distance.
      </p>
    );
  }
  const byName = new Map(stars.map((s) => [s.name, s]));
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className={HEAD}>
            <th className={`${CELL} font-medium`}>Star</th>
            <th className={`${CELL} font-medium`}>Conjunct</th>
            <th className={`${CELL} font-medium`}>Orb</th>
            <th className={`${CELL} font-medium`}>Nature</th>
            <th className="py-2 font-medium">Traditionally</th>
          </tr>
        </thead>
        <tbody>
          {conjunctions.map((c) => {
            const s = byName.get(c.star);
            return (
              <tr key={`${c.star}-${c.point}`} className="border-b border-pearl-300/60 align-top">
                <td className={CELL}>
                  <span aria-hidden className="mr-1.5 text-amber-300">✦</span>
                  <span className="text-ink-900">{c.star}</span>
                  {s && (
                    <span className="block text-xs text-ink-400">
                      {s.formatted} {SIGN_NAMES[s.sign]} · {s.constellation}
                    </span>
                  )}
                </td>
                <td className={CELL}>{pointLabel(c.point)}</td>
                <td className={`${CELL} tabular-nums text-ink-500`}>{c.orb.toFixed(2)}°</td>
                <td className={`${CELL} text-ink-700`}>{s?.nature ?? "·"}</td>
                <td className="py-2 text-ink-500">{s?.keynote ?? "·"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="mt-3 text-xs leading-relaxed text-ink-400">
        Natures follow Ptolemy as relayed by Vivian Robson (1923). Star positions are
        computed for the birth date from J2000 coordinates with precession applied.
      </p>
    </div>
  );
}

/** "exact" by orb, "stationary" when the transiting planet is standing still. */
function motionLabel(a: TransitAspect): string {
  if (a.orb < 0.05) return "exact";
  if (a.applying === null) return "stationary";
  return a.applying ? "applying" : "separating";
}

export function TransitTable({
  planets,
  aspects,
  when,
  warnings = [],
}: {
  planets: PlanetPosition[];
  aspects: TransitAspect[];
  when: string;
  warnings?: string[];
}) {
  return (
    <div className="space-y-5">
      <p className="text-sm text-ink-500">
        The sky for <span className="text-ink-900">{when}</span>, drawn as the outer ring
        and read in your natal houses.
      </p>
      {warnings.map((w) => (
        <p key={w} className="rounded-lg border border-rose-600/40 bg-rose-400/10 px-3 py-2 text-xs text-rose-500">
          {w}
        </p>
      ))}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={HEAD}>
              <th className={`${CELL} font-medium`}>Transiting</th>
              <th className={`${CELL} font-medium`}>Position</th>
              <th className="py-2 font-medium">Your house</th>
            </tr>
          </thead>
          <tbody>
            {planets
              .filter((p) => p.body !== "ketu")
              .map((p) => (
                <tr key={p.body} className="border-b border-pearl-300/60">
                  <td className={CELL}>
                    <span aria-hidden className="astro-glyph mr-2 text-sky-500">{PLANET_GLYPHS[p.body]}</span>
                    {planetName(p.body)}
                    {p.retrograde && (
                      <>
                        <span aria-hidden className="ml-1 text-xs text-rose-500">℞</span>
                        <span className="sr-only"> retrograde</span>
                      </>
                    )}
                  </td>
                  <td className={CELL}>
                    {p.formatted} <span className="text-ink-700">{SIGN_NAMES[p.sign]}</span>
                  </td>
                  <td className="py-2 text-ink-500">{p.house ? ORDINALS[p.house - 1] : "·"}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div>
        <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-400">
          Aspects to your chart
        </h4>
        {aspects.length === 0 ? (
          <p className="mt-2 text-sm text-ink-500">
            Nothing within the transit orbs at this moment. Quiet skies happen.
          </p>
        ) : (
          <ul className="mt-2 divide-y divide-pearl-300/50">
            {aspects.map((a, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-x-2 py-1.5 text-sm">
                <span className="text-ink-900">
                  <span aria-hidden className="astro-glyph mr-1 text-sky-500">{PLANET_GLYPHS[a.transiting]}</span>
                  {planetName(a.transiting)}
                </span>
                <span aria-hidden className="astro-glyph text-rose-400">{ASPECT_SYMBOLS[a.type]}</span>
                <span className="text-ink-700">
                  {a.type} natal {pointLabel(a.natal)}
                </span>
                <span className="tabular-nums text-xs text-ink-400">
                  {a.orb.toFixed(1)}° · {motionLabel(a)}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs leading-relaxed text-ink-400">
          Transit orbs are tight on purpose: 3° for conjunctions and oppositions, 2.5° for
          squares and trines, 2° for sextiles. Applying means the aspect is still
          tightening; separating means its exact moment has passed.
        </p>
      </div>
    </div>
  );
}
