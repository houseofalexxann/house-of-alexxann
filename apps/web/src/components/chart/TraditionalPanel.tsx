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
    </div>
  );
}
