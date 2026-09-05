"use client";

/**
 * Sits directly under a cast chart: a key to every glyph and mark on it,
 * and a short guide to reading it. Two tabs, nothing hidden behind a
 * paywall: knowing what the symbols mean is the floor, not the ceiling.
 */
import { useState } from "react";
import type { ChartResult } from "@hoa/engine";
import { CosmicInsights } from "./CosmicInsights";
import {
  ANGLE_KEY,
  ASPECT_KEY,
  EXTRA_KEY,
  MARK_KEY,
  PLANET_KEY,
  SIGN_KEY,
  VEDIC_GUIDE,
  WESTERN_GUIDE,
  type GuideSection,
} from "@/lib/chart-key";

type Tab = "insights" | "key" | "guide";

function Glyph({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      aria-hidden
      className="astro-glyph inline-flex w-8 shrink-0 justify-center text-xl leading-none"
      style={{ color: color ?? "#f5a9b8" }}
    >
      {children}
    </span>
  );
}

function Row({
  glyph,
  glyphColor,
  abbr,
  name,
  sub,
  note,
}: {
  glyph: React.ReactNode;
  glyphColor?: string;
  abbr?: string;
  name: string;
  sub?: string;
  note: string;
}) {
  return (
    <li className="flex items-start gap-3 py-2">
      <Glyph color={glyphColor}>{glyph}</Glyph>
      {abbr && (
        <span className="w-7 shrink-0 pt-0.5 text-xs font-semibold tabular-nums text-lilac-500">{abbr}</span>
      )}
      <div className="min-w-0">
        <p className="text-sm text-ink-900">
          {name}
          {sub && <span className="ml-1.5 text-xs text-ink-400">{sub}</span>}
        </p>
        <p className="text-xs leading-relaxed text-ink-500">{note}</p>
      </div>
    </li>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-400">{title}</h4>
      <ul className="mt-1 divide-y divide-pearl-300/50">{children}</ul>
    </div>
  );
}

function Guide({ sections }: { sections: GuideSection[] }) {
  return (
    <div className="space-y-3">
      {sections.map((s, i) => (
        <details key={s.heading} open={i === 0} className="group rounded-lg border border-pearl-300 bg-pearl-200/50 px-4 py-2.5">
          <summary className="cursor-pointer list-none text-sm font-medium text-rose-500 marker:content-none">
            <span aria-hidden className="mr-2 inline-block transition-transform group-open:rotate-45">＋</span>
            {s.heading}
          </summary>
          {s.list ? (
            <ol className="mt-2 space-y-1.5 pl-6 text-sm leading-relaxed text-ink-700">
              {s.body.map((line) => (
                <li key={line} className="list-decimal marker:text-rose-400">
                  {line}
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-2 space-y-2 pl-6 text-sm leading-relaxed text-ink-700">
              {s.body.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          )}
        </details>
      ))}
    </div>
  );
}

export function ChartKey({
  system,
  chart,
  transits = false,
  stars = false,
}: {
  system: "western" | "vedic";
  chart: ChartResult;
  /** A transit ring is drawn on the wheel. */
  transits?: boolean;
  /** Fixed-star marks are drawn on the wheel. */
  stars?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("insights");
  const vedic = system === "vedic";
  const TABS: [Tab, string][] = [
    ["insights", "Cosmic insights"],
    ["key", "Key to the glyphs"],
    ["guide", "How to read it"],
  ];
  // Arrow keys move between tabs the way the tabs pattern expects.
  const onTabKey = (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const order = TABS.map(([id]) => id);
    let next: number | null = null;
    if (e.key === "ArrowRight") next = (index + 1) % order.length;
    if (e.key === "ArrowLeft") next = (index - 1 + order.length) % order.length;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = order.length - 1;
    if (next === null) return;
    e.preventDefault();
    setTab(order[next]);
    const el = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next];
    el?.focus();
  };
  const planets = PLANET_KEY.filter((p) => (vedic ? !p.westernOnly : !p.vedicOnly));
  const extras = !vedic && chart.extras?.length ? EXTRA_KEY.filter((k) => chart.extras!.some((e) => e.body === k.body)) : [];
  const wheelMarks = [
    ...(transits
      ? [{ symbol: "◎", name: "Transit ring", keynote: "The blue outer ring is the sky at the chosen moment, read in your natal houses. Blue ticks on the band mark each transiting planet's exact degree." }]
      : []),
    ...(stars
      ? [{ symbol: "✦", name: "Fixed star", keynote: "A gold star on the band marks a catalogued fixed star within one degree of one of your points. The fixed stars table says which." }]
      : []),
  ];

  return (
    <section className="card mt-6 p-5 sm:p-6" aria-label="Insights, key and reading guide">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-heading text-xl text-ink-900">Reading the chart</h3>
        <div className="flex flex-wrap rounded-full border border-pearl-400 bg-pearl-100/70 p-1" role="tablist" aria-label="Insights, key or guide">
          {TABS.map(([id, label], index) => (
            <button
              key={id}
              type="button"
              role="tab"
              id={`chart-tab-${id}`}
              aria-selected={tab === id}
              aria-controls={`chart-panel-${id}`}
              tabIndex={tab === id ? 0 : -1}
              onClick={() => setTab(id)}
              onKeyDown={(e) => onTabKey(e, index)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                tab === id ? "bg-rose-300/30 text-rose-600" : "text-ink-500 hover:text-ink-900"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === "insights" ? (
        <div className="mt-4" role="tabpanel" id="chart-panel-insights" aria-labelledby="chart-tab-insights">
          <CosmicInsights chart={chart} />
        </div>
      ) : tab === "key" ? (
        <div className="mt-4 grid gap-6 md:grid-cols-2" role="tabpanel" id="chart-panel-key" aria-labelledby="chart-tab-key">
          <div className="space-y-6">
            <Section title={vedic ? "Grahas" : "Planets and points"}>
              {planets.map((p) => (
                <Row
                  key={p.body}
                  glyph={p.glyph}
                  abbr={vedic ? p.abbr : undefined}
                  name={vedic && p.sanskrit ? p.sanskrit : p.name}
                  sub={vedic && p.sanskrit ? p.name : p.sanskrit}
                  note={p.keynote}
                />
              ))}
            </Section>
            {extras.length > 0 && (
              <Section title="Asteroids and points">
                {extras.map((k) => (
                  <Row key={k.body} glyph={k.glyph} glyphColor="#cdbfe8" name={k.name} note={k.keynote} />
                ))}
              </Section>
            )}
          </div>
          <div className="space-y-6">
            <Section title={vedic ? "Rasis, by number" : "Signs"}>
              {SIGN_KEY.map((s) => (
                <Row
                  key={s.index}
                  glyph={s.glyph}
                  glyphColor="#c3adf0"
                  abbr={vedic ? String(s.index + 1) : undefined}
                  name={vedic ? s.sanskrit : s.name}
                  sub={vedic ? s.name : `${s.element} · ${s.modality} · traditional ruler ${s.ruler}`}
                  note={s.keynote}
                />
              ))}
            </Section>
            {!vedic && (
              <Section title="Aspect lines">
                {ASPECT_KEY.map((a) => (
                  <Row key={a.type} glyph={a.symbol} glyphColor={a.color} name={a.name} sub={a.angle} note={a.keynote} />
                ))}
              </Section>
            )}
            {!vedic && (
              <Section title="Angles">
                {ANGLE_KEY.map((a) => (
                  <Row key={a.label} glyph={<span className="text-xs font-semibold">{a.label}</span>} name={a.name} note={a.keynote} />
                ))}
              </Section>
            )}
            <Section title="Marks">
              {(vedic
                ? [
                    { symbol: "As", name: "Lagna, the ascendant", keynote: "The sign rising in the east at birth, with its degree. The 1st house begins here." },
                    ...MARK_KEY.filter((m) => m.symbol === "℞"),
                    { symbol: "0°", name: "Degree in the sign", keynote: "How far into its rasi a graha sits, 0° to 29°." },
                  ]
                : [...MARK_KEY, ...wheelMarks]
              ).map((m) => (
                <Row key={m.name} glyph={<span className="text-xs font-semibold">{m.symbol}</span>} name={m.name} note={m.keynote} />
              ))}
            </Section>
          </div>
        </div>
      ) : (
        <div className="mt-4" role="tabpanel" id="chart-panel-guide" aria-labelledby="chart-tab-guide">
          <Guide sections={vedic ? VEDIC_GUIDE : WESTERN_GUIDE} />
          <p className="mt-4 text-xs leading-relaxed text-ink-400">
            Written by the House in its own words, after the way Astro.com, CHANI and The
            Astrology Podcast teach a first reading. Traditions and tendencies, never verdicts.
          </p>
        </div>
      )}
    </section>
  );
}
