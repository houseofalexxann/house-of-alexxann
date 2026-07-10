"use client";

import { useState } from "react";
import type { ChartResult } from "@hoa/engine";
import {
  aspectInterp,
  dashaLord,
  moonNakshatra,
  planetInHouse,
  planetInSign,
  risingSign,
  type Interpretation,
} from "@/lib/interpretations";
import {
  ANGLE_TAGLINES,
  HOUSE_MEANINGS,
  PLANET_SIGNIFICATIONS,
  PLANET_TAGLINES,
} from "@/lib/interpretations/keywords";
import { BODY_NAMES, ORDINALS, PLANET_GLYPHS, SIGN_NAMES } from "./glyphs";

function placementLabel(body: string, sign: number, house: number | null): string {
  const name = BODY_NAMES[body as keyof typeof BODY_NAMES] ?? body;
  return `${name} in ${SIGN_NAMES[sign]}${house ? ` in the ${ORDINALS[house - 1]} House` : ""}`;
}

/** A "key" card: big placement, tagline, then the authored reading. */
function KeyCard({
  glyph,
  heading,
  tagline,
  interp,
}: {
  glyph: string;
  heading: string;
  tagline: string;
  interp: Interpretation | null;
}) {
  const [open, setOpen] = useState(false);
  return (
    <article className="card overflow-hidden">
      <button
        type="button"
        className="flex w-full items-start gap-4 p-5 text-left transition-colors hover:bg-night-800/60"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span aria-hidden className="mt-0.5 text-2xl text-gold-300">{glyph}</span>
        <span className="flex-1">
          <span className="block font-heading text-lg leading-snug text-moon-100">
            {heading}
          </span>
          <span className="mt-0.5 block text-sm text-moon-400">{tagline}</span>
        </span>
        <span aria-hidden className="mt-1 text-moon-500">{open ? "▴" : "▾"}</span>
      </button>
      {open && interp && (
        <p className="border-t border-night-700/60 px-5 py-4 text-sm leading-relaxed text-moon-300">
          {interp.body}
        </p>
      )}
    </article>
  );
}

function Entry({ interp, tagline }: { interp: Interpretation; tagline?: string }) {
  return (
    <article className="border-b border-night-700/60 py-4 last:border-0">
      <h4 className="font-heading text-lg text-gold-300">{interp.title}</h4>
      {tagline && <p className="text-xs text-moon-500">{tagline}</p>}
      <p className="mt-1.5 text-sm leading-relaxed text-moon-300">{interp.body}</p>
    </article>
  );
}

/** Collapsible "make it make sense" legend: houses + planet significations. */
function Legend() {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-10 rounded-xl border border-night-600/60">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-5 py-3 text-left text-sm font-semibold uppercase tracking-[0.2em] text-moon-400 hover:text-moon-100"
      >
        Make it make sense — houses &amp; planets, in one breath
        <span aria-hidden>{open ? "▴" : "▾"}</span>
      </button>
      {open && (
        <div className="grid gap-8 border-t border-night-700/60 p-5 md:grid-cols-2">
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-moon-500">
              The houses
            </h4>
            <ul className="space-y-2 text-sm">
              {HOUSE_MEANINGS.map((h) => (
                <li key={h.title}>
                  <span className="text-gold-300">{h.title}:</span>{" "}
                  <span className="text-moon-300">{h.keywords}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-moon-500">
              The planets &amp; what they carry
            </h4>
            <ul className="space-y-2 text-sm">
              {Object.entries(PLANET_SIGNIFICATIONS).map(([body, words]) => (
                <li key={body}>
                  <span className="mr-1.5">{PLANET_GLYPHS[body as keyof typeof PLANET_GLYPHS]}</span>
                  <span className="text-gold-300">
                    {BODY_NAMES[body as keyof typeof BODY_NAMES]}:
                  </span>{" "}
                  <span className="text-moon-300">{words.join(", ")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}

export function InterpretationsPanel({ chart }: { chart: ChartResult }) {
  const vedic = chart.input.system === "vedic";
  const sun = chart.planets.find((p) => p.body === "sun");
  const moon = chart.planets.find((p) => p.body === "moon");

  return (
    <div>
      {/* ——— The keys to your chart: Rising, Sun, Moon ——— */}
      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-moon-500">
          The keys to your chart
        </h3>
        <div className="space-y-3">
          {chart.angles && (
            <KeyCard
              glyph="☼"
              heading={`${SIGN_NAMES[chart.angles.ascendantSign]} Rising`}
              tagline={ANGLE_TAGLINES.ascendant}
              interp={risingSign(chart.angles.ascendantSign)}
            />
          )}
          {sun && (
            <KeyCard
              glyph={PLANET_GLYPHS.sun}
              heading={placementLabel("sun", sun.sign, sun.house)}
              tagline={PLANET_TAGLINES.sun}
              interp={planetInSign("sun", sun.sign)}
            />
          )}
          {moon && (
            <KeyCard
              glyph={PLANET_GLYPHS.moon}
              heading={placementLabel("moon", moon.sign, moon.house)}
              tagline={PLANET_TAGLINES.moon}
              interp={planetInSign("moon", moon.sign)}
            />
          )}
        </div>
      </section>

      {/* ——— Vedic: nakshatra + current chapter ——— */}
      {vedic && chart.vimshottari && (
        <section className="mt-10">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-moon-500">
            Your lunar mansion &amp; current chapter
          </h3>
          <div>
            {(() => {
              const nak = moonNakshatra(chart.vimshottari.moonNakshatra.index);
              const now = Date.now();
              const current = chart.vimshottari.mahadashas.find(
                (m) => now >= Date.parse(m.start) && now < Date.parse(m.end)
              );
              const lord = current ? dashaLord(current.lord) : null;
              return (
                <>
                  {nak && <Entry interp={nak} />}
                  {lord && <Entry interp={lord} tagline="The season of time you're inside right now" />}
                </>
              );
            })()}
          </div>
        </section>
      )}

      {/* ——— Planets in signs & houses, taglined ——— */}
      <section className="mt-10">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-moon-500">
          Your planets
        </h3>
        <div>
          {chart.planets
            .filter((p) => p.body !== "sun" && p.body !== "moon")
            .map((p) => {
              const inSign = planetInSign(p.body, p.sign);
              if (!inSign) return null;
              return (
                <Entry
                  key={p.body}
                  interp={{ ...inSign, title: placementLabel(p.body, p.sign, p.house) }}
                  tagline={PLANET_TAGLINES[p.body]}
                />
              );
            })}
        </div>
      </section>

      {/* ——— Houses (time known only) ——— */}
      {chart.input.timeKnown && (
        <section className="mt-10">
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-moon-500">
            Where it lands — planets in houses
          </h3>
          <div>
            {chart.planets.map((p) => {
              const interp = p.house ? planetInHouse(p.body, p.house) : null;
              if (!interp) return null;
              return (
                <Entry
                  key={p.body}
                  interp={interp}
                  tagline={
                    HOUSE_MEANINGS[p.house! - 1]
                      ? `${HOUSE_MEANINGS[p.house! - 1].title}: ${HOUSE_MEANINGS[p.house! - 1].keywords}`
                      : undefined
                  }
                />
              );
            })}
          </div>
        </section>
      )}

      {/* ——— Aspects ——— */}
      <section className="mt-10">
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-[0.25em] text-moon-500">
          The conversations between planets
        </h3>
        <div>
          {chart.aspects.map((a, i) => {
            const interp = aspectInterp(a.a, a.b, a.type);
            if (!interp) return null;
            return (
              <Entry
                key={i}
                interp={{ ...interp, title: `${interp.title}` }}
                tagline={`orb ${a.orb.toFixed(1)}° · ${a.applying ? "applying" : a.applying === false ? "separating" : ""}`}
              />
            );
          })}
        </div>
      </section>

      <Legend />
    </div>
  );
}
