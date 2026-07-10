"use client";

import type { ChartResult, Dignity } from "@hoa/engine";
import { BODY_NAMES, PLANET_GLYPHS, SIGN_NAMES } from "./glyphs";

/** A small drawn moon showing the natal phase (offset-disc approximation). */
function MoonDisc({ elongation, waxing }: { elongation: number; waxing: boolean }) {
  const r = 13;
  const f = (1 - Math.cos((elongation * Math.PI) / 180)) / 2; // illuminated fraction
  const dx = (waxing ? -1 : 1) * f * 2 * r;
  return (
    <svg viewBox="0 0 30 30" width="30" height="30" aria-hidden>
      <defs>
        <clipPath id="moon-clip">
          <circle cx="15" cy="15" r={r} />
        </clipPath>
      </defs>
      <circle cx="15" cy="15" r={r} fill="#efe6cf" stroke="#cf9c3f" strokeWidth="0.75" />
      <g clipPath="url(#moon-clip)">
        <circle cx={15 + dx} cy="15" r={r} fill="#5e6b78" opacity="0.9" />
      </g>
    </svg>
  );
}

const DIGNITY_LABEL: Record<Dignity, string> = {
  domicile: "in its own sign",
  exaltation: "exalted",
  detriment: "in detriment",
  fall: "in fall",
  peregrine: "peregrine",
};

/** Strong dignities read gold, challenged read rose, peregrine stays quiet. */
function dignityStyle(d: Dignity): string {
  if (d === "domicile" || d === "exaltation")
    return "border-[#cf9c3f]/50 bg-[#cf9c3f]/12 text-[#a97e2f]";
  if (d === "detriment" || d === "fall")
    return "border-rose-400/50 bg-rose-300/15 text-rose-600";
  return "border-pearl-400 bg-white/60 text-ink-500";
}

export function TraditionalPanel({ chart }: { chart: ChartResult }) {
  const t = chart.traditional;
  const mp = t.moonPhase;

  return (
    <div className="space-y-8">
      {/* Sect + moon phase */}
      <div className="grid gap-6 sm:grid-cols-2">
        {t.sect && (
          <div className="rounded-xl border border-pearl-300 bg-white/50 p-5">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
              Sect
            </h4>
            <p className="mt-2 text-lg text-ink-900">
              A <span className="text-rose-600">{t.sect.sect}</span> chart —{" "}
              <span className="astro-glyph">{PLANET_GLYPHS[t.sect.lightLeader]}</span>{" "}
              the {t.sect.lightLeader === "sun" ? "Sun" : "Moon"} leads your sect.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">
              Its benefic of sect is{" "}
              <span className="text-ink-700">{BODY_NAMES[t.sect.beneficOfSect]}</span>;
              the malefic contrary to sect is{" "}
              <span className="text-ink-700">{BODY_NAMES[t.sect.maleficContraryToSect]}</span>.
              Planets in sect tend to express with more ease.
            </p>
          </div>
        )}
        <div className="rounded-xl border border-pearl-300 bg-white/50 p-5">
          <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            Natal moon phase
          </h4>
          <div className="mt-2 flex items-center gap-3">
            <MoonDisc elongation={mp.elongation} waxing={mp.waxing} />
            <div>
              <p className="text-lg text-ink-900">{mp.phase}</p>
              <p className="text-sm text-ink-500">
                {Math.round(mp.illumination * 100)}% illuminated ·{" "}
                {mp.waxing ? "waxing" : "waning"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Essential dignities */}
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
          Essential dignity — how at home each planet is
        </h4>
        <div className="flex flex-wrap gap-2">
          {t.dignities.map((d) => (
            <span
              key={d.body}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm ${dignityStyle(d.dignity)}`}
              title={`Ruled by ${BODY_NAMES[d.rulerOfSign]}`}
            >
              <span className="astro-glyph">{PLANET_GLYPHS[d.body]}</span>
              {BODY_NAMES[d.body]} {DIGNITY_LABEL[d.dignity]}
              <span className="opacity-60">· {SIGN_NAMES[d.sign]}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Aspects to the angles */}
      {t.angleAspects.length > 0 && (
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            Aspects to your angles
          </h4>
          <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-700">
            {t.angleAspects.map((a, i) => (
              <li key={i}>
                <span className="astro-glyph mr-1">{PLANET_GLYPHS[a.planet]}</span>
                {BODY_NAMES[a.planet]} {a.type}{" "}
                {a.angle === "ascendant" ? "Ascendant" : "Midheaven"}
                <span className="ml-1 text-ink-400">({a.orb.toFixed(1)}°)</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Decans & Egyptian bounds — the finer rulers under each placement */}
      <div>
        <h4 className="mb-1 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
          Decans &amp; bounds — the finer rulers
        </h4>
        <p className="mb-3 text-xs leading-relaxed text-ink-400">
          Every degree sits inside a ten-degree <em>decan</em> (Chaldean face)
          and an unequal <em>Egyptian bound</em> — sub-rulers the Hellenistic
          astrologers read for texture.{" "}
          <a href="/codex" className="text-rose-600 underline-offset-2 hover:underline">
            Full tables in the Codex →
          </a>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pearl-400/60 text-left text-xs uppercase tracking-widest text-ink-400">
                <th className="py-1.5 pr-3 font-medium">Body</th>
                <th className="py-1.5 pr-3 font-medium">Decan</th>
                <th className="py-1.5 font-medium">Bound</th>
              </tr>
            </thead>
            <tbody>
              {chart.planets
                .filter((p) => p.decan && p.term)
                .map((p) => (
                  <tr key={p.body} className="border-b border-pearl-300/50 last:border-0">
                    <td className="py-1.5 pr-3">
                      <span className="astro-glyph mr-1.5">{PLANET_GLYPHS[p.body]}</span>
                      {BODY_NAMES[p.body]}
                    </td>
                    <td className="py-1.5 pr-3 text-ink-700">
                      {ordinalDecan(p.decan!.decanOfSign)} decan of {SIGN_NAMES[p.sign]} · ruled by{" "}
                      <span className="astro-glyph">{PLANET_GLYPHS[p.decan!.ruler]}</span>{" "}
                      {BODY_NAMES[p.decan!.ruler]}
                    </td>
                    <td className="py-1.5 text-ink-700">
                      bound of{" "}
                      <span className="astro-glyph">{PLANET_GLYPHS[p.term!.ruler]}</span>{" "}
                      {BODY_NAMES[p.term!.ruler]}{" "}
                      <span className="text-ink-400">
                        ({p.term!.startDegree}°–{p.term!.endDegree}°)
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lots + zodiacal releasing */}
      {t.lots && (
        <div>
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            Lots &amp; the chapters of spirit — zodiacal releasing
          </h4>
          <p className="text-sm text-ink-700">
            <span className="mr-4">
              ⊗ Lot of Fortune: <strong>{formatLot(t.lots.fortune)}</strong>
            </span>
            <span>
              Lot of Spirit: <strong>{formatLot(t.lots.spirit)}</strong>
            </span>
          </p>
          {t.zodiacalReleasing && (
            <ol className="mt-3 space-y-1">
              {t.zodiacalReleasing.slice(0, 8).map((p, i) => {
                const now = Date.now();
                const current = now >= Date.parse(p.start) && now < Date.parse(p.end);
                return (
                  <li
                    key={i}
                    className={`flex items-center justify-between rounded-lg border px-4 py-2 text-sm ${
                      current
                        ? "border-rose-400/60 bg-rose-300/20 text-ink-900"
                        : "border-pearl-300/70 bg-white/40 text-ink-700"
                    }`}
                  >
                    <span>
                      {SIGN_NAMES[p.sign]} period · {p.years} years · ruled by{" "}
                      <span className="astro-glyph">{PLANET_GLYPHS[p.ruler]}</span>{" "}
                      {BODY_NAMES[p.ruler]}
                      {current && (
                        <span className="ml-2 rounded-full bg-rose-400/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-600">
                          now
                        </span>
                      )}
                    </span>
                    <span className="tabular-nums text-xs text-ink-400">
                      {new Date(p.start).getFullYear()}–{new Date(p.end).getFullYear()}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
          <p className="mt-2 text-xs text-ink-400">
            L1 general periods from the Lot of Spirit (Valens). Sub-periods
            arrive with membership.
          </p>
        </div>
      )}
    </div>
  );
}

function ordinalDecan(n: number): string {
  return n === 1 ? "1st" : n === 2 ? "2nd" : "3rd";
}

function formatLot(lon: number): string {
  const sign = Math.floor(lon / 30) % 12;
  const deg = lon - sign * 30;
  const d = Math.floor(deg);
  const m = Math.round((deg - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}' ${SIGN_NAMES[sign]}`;
}
