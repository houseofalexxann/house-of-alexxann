"use client";

import type { ChartResult } from "@hoa/engine";
import {
  ASPECT_SYMBOLS,
  BODY_NAMES,
  ORDINALS,
  PLANET_GLYPHS,
  SIGN_NAMES,
} from "./glyphs";

export function PlanetTable({ chart }: { chart: ChartResult }) {
  const vedic = chart.input.system === "vedic";
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-night-600 text-left text-xs uppercase tracking-widest text-moon-500">
            <th className="py-2 pr-3 font-medium">Body</th>
            <th className="py-2 pr-3 font-medium">Position</th>
            {chart.input.timeKnown && <th className="py-2 pr-3 font-medium">House</th>}
            <th className="py-2 pr-3 font-medium">Motion</th>
            {vedic && <th className="py-2 font-medium">Nakshatra</th>}
          </tr>
        </thead>
        <tbody>
          {chart.angles && (
            <>
              <tr className="border-b border-night-700/60">
                <td className="py-2 pr-3 text-gold-300">Ascendant</td>
                <td className="py-2 pr-3">
                  {chart.angles.formattedAscendant}{" "}
                  <span className="text-moon-300">{SIGN_NAMES[chart.angles.ascendantSign]}</span>
                </td>
                {chart.input.timeKnown && <td className="py-2 pr-3 text-moon-400">1st cusp</td>}
                <td className="py-2 pr-3 text-moon-500">—</td>
                {vedic && <td className="py-2 text-moon-500">—</td>}
              </tr>
              <tr className="border-b border-night-700/60">
                <td className="py-2 pr-3 text-gold-300">Midheaven</td>
                <td className="py-2 pr-3">
                  {chart.angles.formattedMidheaven}{" "}
                  <span className="text-moon-300">{SIGN_NAMES[chart.angles.midheavenSign]}</span>
                </td>
                {chart.input.timeKnown && <td className="py-2 pr-3 text-moon-400">10th cusp</td>}
                <td className="py-2 pr-3 text-moon-500">—</td>
                {vedic && <td className="py-2 text-moon-500">—</td>}
              </tr>
            </>
          )}
          {chart.planets.map((p) => (
            <tr key={p.body} className="border-b border-night-700/60 last:border-0">
              <td className="py-2 pr-3">
                <span className="mr-2 text-base">{PLANET_GLYPHS[p.body]}</span>
                {BODY_NAMES[p.body]}
              </td>
              <td className="py-2 pr-3 tabular-nums">
                {p.formatted}{" "}
                <span className="text-moon-300">{SIGN_NAMES[p.sign]}</span>
              </td>
              {chart.input.timeKnown && (
                <td className="py-2 pr-3 text-moon-400">
                  {p.house ? ORDINALS[p.house - 1] : "—"}
                </td>
              )}
              <td className="py-2 pr-3">
                {p.retrograde ? (
                  <span className="text-gold-400">℞ retrograde</span>
                ) : (
                  <span className="text-moon-500">direct</span>
                )}
              </td>
              {vedic && (
                <td className="py-2 text-moon-300">
                  {p.nakshatra ? `${p.nakshatra.name} · pada ${p.nakshatra.pada}` : "—"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HouseCuspTable({ chart }: { chart: ChartResult }) {
  if (!chart.houseCusps) return null;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-night-600 text-left text-xs uppercase tracking-widest text-moon-500">
            <th className="py-2 pr-3 font-medium">House</th>
            <th className="py-2 font-medium">Cusp</th>
          </tr>
        </thead>
        <tbody>
          {chart.houseCusps.map((c, i) => {
            const sign = Math.floor(c / 30) % 12;
            const deg = c - sign * 30;
            const d = Math.floor(deg);
            const m = Math.round((deg - d) * 60);
            return (
              <tr key={i} className="border-b border-night-700/60 last:border-0">
                <td className="py-1.5 pr-3 text-moon-400">{ORDINALS[i]}</td>
                <td className="py-1.5 tabular-nums">
                  {d}°{String(m).padStart(2, "0")}&#39;{" "}
                  <span className="text-moon-300">{SIGN_NAMES[sign]}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function AspectTable({ chart }: { chart: ChartResult }) {
  if (chart.aspects.length === 0)
    return <p className="text-sm text-moon-400">No major aspects within orb.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-night-600 text-left text-xs uppercase tracking-widest text-moon-500">
            <th className="py-2 pr-3 font-medium">Aspect</th>
            <th className="py-2 pr-3 font-medium">Orb</th>
            <th className="py-2 font-medium">Phase</th>
          </tr>
        </thead>
        <tbody>
          {chart.aspects.map((a, i) => (
            <tr key={i} className="border-b border-night-700/60 last:border-0">
              <td className="py-2 pr-3">
                {BODY_NAMES[a.a]}{" "}
                <span className="mx-1 text-gold-400">{ASPECT_SYMBOLS[a.type]}</span>{" "}
                {BODY_NAMES[a.b]}
                <span className="ml-2 text-xs text-moon-500">{a.type}</span>
              </td>
              <td className="py-2 pr-3 tabular-nums text-moon-300">{a.orb.toFixed(2)}°</td>
              <td className="py-2 text-moon-400">
                {a.applying === null ? "—" : a.applying ? "applying" : "separating"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
