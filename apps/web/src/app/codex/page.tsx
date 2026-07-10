import type { Metadata } from "next";
import Link from "next/link";
import { egyptianTermsTable, ZR_YEARS } from "@hoa/engine";
import {
  ASPECT_SYMBOLS,
  BODY_NAMES,
  PLANET_GLYPHS,
  SIGN_COLORS,
  SIGN_GLYPHS,
  SIGN_NAMES,
} from "@/components/chart/glyphs";
import { HOUSE_MEANINGS, PLANET_TAGLINES } from "@/lib/interpretations/keywords";
import { GLOSSARY, NAKSHATRA_LEGEND, VEDIC_TERMS } from "@/lib/learn-data";

export const metadata: Metadata = {
  title: "The Codex — glyphs, glossary & the deep techniques",
  description:
    "A key to the House: every glyph explained, a glossary of Hellenistic and Vedic terms, the 36 decans, the Egyptian bounds, and zodiacal releasing.",
};

const ELEMENTS = ["Fire", "Earth", "Air", "Water"];
const MODALITIES = ["Cardinal", "Fixed", "Mutable"];
const SIGN_RULERS = [
  "mars", "venus", "mercury", "moon", "sun", "mercury",
  "venus", "mars", "jupiter", "saturn", "saturn", "jupiter",
] as const;

const CHALDEAN = ["mars", "sun", "venus", "mercury", "moon", "saturn", "jupiter"] as const;

const ASPECT_MEANINGS: [keyof typeof ASPECT_SYMBOLS, string, string][] = [
  ["conjunction", "0°", "two planets fuse — one voice, doubled"],
  ["sextile", "60°", "an offer of ease — real, but it must be accepted"],
  ["square", "90°", "productive friction — the growth is in the grind"],
  ["trine", "120°", "flow — a gift so native you may not notice it"],
  ["opposition", "180°", "a seesaw seeking integration, not a winner"],
];







export default function CodexPage() {
  const bounds = egyptianTermsTable();
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-12 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
          The Codex
        </p>
        <h1 className="text-4xl text-ink-900 sm:text-5xl">A key to the House</h1>
        <p className="mx-auto mt-4 max-w-2xl leading-relaxed text-ink-500">
          Astrology is a language with an old grammar. This page holds the
          alphabet — every glyph, every term, and the deeper techniques we
          practice here: the lineage of Ptolemy, Vettius Valens and Abu
          Ma&#39;shar, the Vedic seers, and the modern translators who
          recovered them.
        </p>
      </header>

      {/* Dedication — the Library of Alexandria */}
      <section className="card mb-8 border-rose-300/60 p-6 sm:p-8">
        <h2 className="font-heading text-2xl text-ink-900">
          For the Library of Alexandria
        </h2>
        <div className="mt-3 max-w-3xl space-y-3 leading-relaxed text-ink-700">
          <p>
            This page is kept in the spirit of the{" "}
            <strong className="text-ink-900">Library of Alexandria</strong> —
            the place where this craft was actually born. In that city, in the
            centuries before and after Ptolemy wrote there, Babylonian
            star-lists, Egyptian decans and temple medicine, and Greek geometry
            were gathered under one roof and fused into the horoscopic
            astrology we still practice: the Ascendant, the houses, the lots,
            the bounds — Alexandrian inventions, every one. The Library held
            the esoteric beside the factual and refused to treat them as
            enemies: astronomy shelved with astrology, anatomy with healing
            rites, mathematics with myth.
          </p>
          <p>
            The House keeps that faith. Knowledge that liberates belongs to
            everyone who walks in — precise where precision serves, mystical
            where mystery is honest, and never locked away from the people who
            need it most. What burned in Alexandria we rebuild in every open
            notebook like this one — and this House, under a namesake&#39;s
            care, keeps the lamps lit.
          </p>
        </div>
      </section>

      {/* ——— The glyphs ——— */}
      <section id="legend" className="card p-6 sm:p-8">
        <h2 className="font-heading text-2xl text-ink-900">The glyphs</h2>
        <p className="mt-1 text-sm text-ink-500">
          Each symbol is a compressed sentence. Hover any glyph in a chart and
          you&#39;ll find these.
        </p>

        <h3 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
          Planets &amp; points
        </h3>
        <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {(Object.keys(PLANET_GLYPHS) as (keyof typeof PLANET_GLYPHS)[]).map((b) => (
            <div key={b} className="flex items-baseline gap-3 text-sm">
              <span className="astro-glyph w-6 text-center text-xl text-ink-900">
                {PLANET_GLYPHS[b]}
              </span>
              <span className="w-20 shrink-0 text-ink-900">{BODY_NAMES[b]}</span>
              <span className="text-ink-500">
                {PLANET_TAGLINES[b]?.toLowerCase() ?? ""}
              </span>
            </div>
          ))}
        </div>

        <h3 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
          Signs — element · modality · ruler
        </h3>
        <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {SIGN_NAMES.map((name, i) => (
            <div key={name} className="flex items-baseline gap-3 text-sm">
              <span
                className="astro-glyph w-6 text-center text-xl"
                style={{ color: SIGN_COLORS[i] }}
              >
                {SIGN_GLYPHS[i]}
              </span>
              <span className="w-24 shrink-0 text-ink-900">{name}</span>
              <span className="text-ink-500">
                {ELEMENTS[i % 4]} · {MODALITIES[i % 3]} · ruled by{" "}
                {BODY_NAMES[SIGN_RULERS[i]]}
              </span>
            </div>
          ))}
        </div>

        <h3 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
          Aspects
        </h3>
        <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {ASPECT_MEANINGS.map(([key, angle, meaning]) => (
            <div key={key} className="flex items-baseline gap-3 text-sm">
              <span className="astro-glyph w-6 text-center text-lg text-rose-600">
                {ASPECT_SYMBOLS[key]}
              </span>
              <span className="w-28 shrink-0 capitalize text-ink-900">
                {key} <span className="text-ink-400">{angle}</span>
              </span>
              <span className="text-ink-500">{meaning}</span>
            </div>
          ))}
        </div>

        <h3 className="mb-3 mt-10 text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
          The twelve houses
        </h3>
        <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
          {HOUSE_MEANINGS.map((h) => (
            <div key={h.title} className="flex items-baseline gap-3 text-sm">
              <span className="w-20 shrink-0 text-rose-600">{h.title}</span>
              <span className="text-ink-500">{h.keywords}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ——— Decans ——— */}
      <section id="decans" className="card mt-8 p-6 sm:p-8">
        <h2 className="font-heading text-2xl text-ink-900">The 36 decans</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-500">
          Ten degrees at a time, the Egyptians watched the sky rise in 36
          faces. In the Chaldean order each decan belongs to a planet — the
          finest brush the old astrologers painted with, and the ancestor of
          the tarot&#39;s minor arcana.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pearl-400/60 text-left text-xs uppercase tracking-widest text-ink-400">
                <th className="py-2 pr-3 font-medium">Sign</th>
                <th className="py-2 pr-3 font-medium">0°–10°</th>
                <th className="py-2 pr-3 font-medium">10°–20°</th>
                <th className="py-2 font-medium">20°–30°</th>
              </tr>
            </thead>
            <tbody>
              {SIGN_NAMES.map((name, s) => (
                <tr key={name} className="border-b border-pearl-300/50 last:border-0">
                  <td className="py-2 pr-3">
                    <span className="astro-glyph mr-2" style={{ color: SIGN_COLORS[s] }}>
                      {SIGN_GLYPHS[s]}
                    </span>
                    {name}
                  </td>
                  {[0, 1, 2].map((d) => {
                    const ruler = CHALDEAN[(s * 3 + d) % 7];
                    return (
                      <td key={d} className="py-2 pr-3 text-ink-700">
                        <span className="astro-glyph mr-1">{PLANET_GLYPHS[ruler]}</span>
                        {BODY_NAMES[ruler]}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ——— Egyptian bounds ——— */}
      <section id="bounds" className="card mt-8 p-6 sm:p-8">
        <h2 className="font-heading text-2xl text-ink-900">The Egyptian bounds</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-500">
          Each sign divides into five unequal <em>bounds</em> (terms), each
          held by one of the five visible planets — the table Ptolemy
          attributed to the Egyptians, used by Valens, Firmicus, and the
          medieval astrologers after them. Your chart shows the bound every
          planet stands in.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pearl-400/60 text-left text-xs uppercase tracking-widest text-ink-400">
                <th className="py-2 pr-3 font-medium">Sign</th>
                <th className="py-2 font-medium">Bounds (ruler · span)</th>
              </tr>
            </thead>
            <tbody>
              {bounds.map(({ sign, terms }) => (
                <tr key={sign} className="border-b border-pearl-300/50 last:border-0">
                  <td className="py-2 pr-3 align-top">
                    <span className="astro-glyph mr-2" style={{ color: SIGN_COLORS[sign] }}>
                      {SIGN_GLYPHS[sign]}
                    </span>
                    {SIGN_NAMES[sign]}
                  </td>
                  <td className="py-2 text-ink-700">
                    {terms.map((t, i) => (
                      <span key={i} className="mr-4 inline-block whitespace-nowrap">
                        <span className="astro-glyph mr-1">
                          {PLANET_GLYPHS[t.ruler as keyof typeof PLANET_GLYPHS]}
                        </span>
                        {t.from}°–{t.to}°
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ——— Zodiacal releasing ——— */}
      <section id="zr" className="card mt-8 p-6 sm:p-8">
        <h2 className="font-heading text-2xl text-ink-900">Zodiacal releasing</h2>
        <div className="mt-3 max-w-2xl space-y-3 text-sm leading-relaxed text-ink-700">
          <p>
            From Vettius Valens&#39; <em>Anthology</em> (2nd century) comes a
            way of reading time itself: starting from the Lot of Spirit, life
            unfolds in chapters ruled by successive signs — each lasting that
            sign&#39;s &#34;minor years.&#34; Chapters subdivide into months and
            days by the same rhythm, revealing peak periods (when the chapter
            aligns with Fortune&#39;s angles), quiet preparations, and the
            dramatic turn tradition calls the <em>loosing of the bond</em>.
          </p>
          <p>
            Your chart already shows the L1 chapters of Spirit. The full
            technique — sub-periods, peaks, Fortune-releasing for the body and
            health — is part of readings and arrives in the members&#39;
            experience.
          </p>
        </div>
        <h3 className="mb-3 mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
          Minor years of the signs
        </h3>
        <div className="flex flex-wrap gap-2">
          {SIGN_NAMES.map((name, i) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 rounded-full border border-pearl-400 bg-white/60 px-3 py-1 text-sm text-ink-700"
            >
              <span className="astro-glyph" style={{ color: SIGN_COLORS[i] }}>
                {SIGN_GLYPHS[i]}
              </span>
              {name} · {ZR_YEARS[i]}y
            </span>
          ))}
        </div>
      </section>

      {/* ——— Glossary: Western/Hellenistic and Vedic, side by side but never blurred ——— */}
      <section id="glossary" className="card mt-8 p-6 sm:p-8">
        <h2 className="font-heading text-2xl text-ink-900">Glossary — Western &amp; Hellenistic</h2>
        <p className="mt-1 text-sm text-ink-500">The tropical lineage, in plain language.</p>
        <dl className="mt-6 space-y-4">
          {GLOSSARY.filter(([term]) => !VEDIC_TERMS.has(term)).map(([term, def]) => (
            <div key={term} className="border-b border-pearl-300/60 pb-4 last:border-0">
              <dt className="font-heading text-lg text-rose-600">{term}</dt>
              <dd className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-700">{def}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="glossary-vedic" className="card mt-8 border-lilac-400/50 p-6 sm:p-8">
        <h2 className="font-heading text-2xl text-ink-900">Glossary — Vedic · Jyotish</h2>
        <p className="mt-1 text-sm text-ink-500">The sidereal lineage, honored on its own terms.</p>
        <dl className="mt-6 space-y-4">
          {GLOSSARY.filter(([term]) => VEDIC_TERMS.has(term)).map(([term, def]) => (
            <div key={term} className="border-b border-pearl-300/60 pb-4 last:border-0">
              <dt className="font-heading text-lg text-lilac-600">{term}</dt>
              <dd className="mt-1 max-w-3xl text-sm leading-relaxed text-ink-700">{def}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ——— The 27 nakshatras & their deities ——— */}
      <section id="nakshatras" className="card mt-8 border-lilac-400/50 p-6 sm:p-8">
        <h2 className="font-heading text-2xl text-ink-900">The 27 nakshatras &amp; their deities</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-500">
          The Moon&#39;s mansions, each 13°20&#39; of the sidereal sky, each with a
          presiding deity and a Vimshottari lord. Your chart names the nakshatra
          and pada of every planet, the Ascendant and the Midheaven.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-pearl-400/60 text-left text-xs uppercase tracking-widest text-ink-400">
                <th className="py-2 pr-3 font-medium">#</th>
                <th className="py-2 pr-3 font-medium">Nakshatra</th>
                <th className="py-2 pr-3 font-medium">Deity</th>
                <th className="py-2 font-medium">Lord</th>
              </tr>
            </thead>
            <tbody>
              {NAKSHATRA_LEGEND.map(([name, deity, lord], i) => (
                <tr key={name} className="border-b border-pearl-300/50 last:border-0">
                  <td className="py-1.5 pr-3 tabular-nums text-ink-400">{i + 1}</td>
                  <td className="py-1.5 pr-3 text-ink-900">{name}</td>
                  <td className="py-1.5 pr-3 text-ink-700">{deity}</td>
                  <td className="py-1.5 text-ink-700">{lord}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Sources & lineage — credit where the knowledge lives */}
      <section id="lineage" className="card mt-8 p-6 sm:p-8">
        <h2 className="font-heading text-2xl text-ink-900">Sources &amp; lineage</h2>
        <div className="mt-3 max-w-3xl space-y-3 text-sm leading-relaxed text-ink-700">
          <p>
            Nothing here is invented from nothing, and this House does not
            pretend otherwise. The classical ground: <strong>Ptolemy</strong>{" "}
            (<em>Tetrabiblos</em>), <strong>Vettius Valens</strong>{" "}
            (<em>Anthology</em>), <strong>Dorotheus of Sidon</strong>, and{" "}
            <strong>Abu Ma&#39;shar</strong> — read through the modern
            Hellenistic revival, especially <strong>Chris Brennan</strong>&#39;s{" "}
            <em>Hellenistic Astrology</em> and The Astrology Podcast.
          </p>
          <p>
            The Vedic room follows the living Jyotish tradition — and
            Alexandria&#39;s study leans with gratitude on{" "}
            <strong>Adi Parashakti</strong>&#39;s teaching (find them on X),
            alongside the classical <em>Brihat Parashara Hora Shastra</em>.
            Where a reading reflects a teacher&#39;s specific insight, the
            reading says so — teachers are cited, never quietly absorbed.
          </p>
          <p>
            Inspirations honored: the warmth of CHANI, the depth of Héloïse
            (heloAstro), the remedial craft of Sphere + Sundry, and the
            liberatory clarity of Alok Vaid-Menon. All errors are our own; all
            corrections are welcome.
          </p>
        </div>
        <div className="mt-6 rounded-xl border border-pearl-300 bg-white/60 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            Further study — go to the sources
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-ink-700">
            <li>
              <a href="https://theastrologypodcast.com/" className="text-rose-600 underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">
                The Astrology Podcast
              </a>{" "}
              — Chris Brennan&#39;s weekly deep-dives on the history, philosophy
              and techniques of astrology, with monthly forecast episodes and
              full transcripts. The House&#39;s Hellenistic study leans on this
              work constantly.
            </li>
            <li>
              <a href="https://www.patreon.com/astrologypodcast" className="text-rose-600 underline-offset-2 hover:underline" target="_blank" rel="noopener noreferrer">
                Support it on Patreon
              </a>{" "}
              — independent astrology education survives because listeners fund
              it. Pay the teachers.
            </li>
            <li>
              <span className="text-ink-900">Adi Parashakti on X</span> — the
              Vedic perspective this House studies with gratitude.
            </li>
          </ul>
        </div>
      </section>

      <div className="mt-10 text-center">
        <Link href="/studio" className="btn-gold">
          ✦ Cast your chart with all of this inside
        </Link>
      </div>
    </div>
  );
}
