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

const GLOSSARY: [string, string][] = [
  ["Angular, succedent, cadent", "The three strengths of houses. Angular houses (1st, 4th, 7th, 10th) sit on the chart's hinges — planets there act visibly and soon. Succedent houses (2nd, 5th, 8th, 11th) gather and stabilize what the angles set in motion. Cadent houses (3rd, 6th, 9th, 12th) are the in-between rooms: preparation, service, study, retreat — planets there work sideways, through process rather than declaration."],
  ["Applying & separating", "The direction of an aspect in time. An applying aspect is still tightening — the faster planet is closing the distance, and the matter is still unfolding, still negotiable. A separating aspect has already perfected and is loosening — the conversation happened, and what remains is its afterglow or aftermath. Traditional astrologers weighed applying aspects far more heavily for what is to come."],
  ["Ascendant (rising)", "The exact degree of the zodiac rising over the eastern horizon at the moment and place of your birth. It is the most time-sensitive point in the chart — shifting roughly one degree every four minutes — which is why an accurate birth time matters. The Ascendant sets the wheel of houses, names your rising sign, and describes the instrument through which everything else in the chart plays: your approach, your arrival, the face the world meets first. Its ruler becomes the captain of the whole chart."],
  ["Ayanamsa", "The measured angle between the tropical zodiac (seasons) and the sidereal zodiac (stars) — currently about 24 degrees and slowly growing, because Earth's axis wobbles over a ~25,800-year cycle (the precession of the equinoxes). Every Vedic chart subtracts an ayanamsa from tropical positions; Lahiri is the official Indian convention and our default, with Raman, Krishnamurti, and Fagan–Bradley offered for other lineages."],
  ["Antardasha (bhukti)", "The sub-period inside a Vimshottari mahadasha. Each major chapter subdivides into nine smaller ones in the same planetary order, each lasting a proportional share. The antardasha describes the sub-plot: a Venus year inside a Saturn decade feels different from a Mars year inside it. Timing in Jyotish is read maha + antar together, like a key signature and the phrase being played inside it."],
  ["Benefic & malefic", "The traditional temperament of the planets. Venus and Jupiter are the benefics — they tend to ease, connect, and grow what they touch. Mars and Saturn are the malefics — they cut, test, delay, and toughen. This is weather, not morality: a well-placed Saturn builds cathedrals, and sect softens or sharpens each (Jupiter is strongest by day, Venus by night; Mars is harder in day charts, Saturn harder at night)."],
  ["Bound (Egyptian term)", "One of five unequal slices inside each sign, each governed by one of the five visible planets — never the Sun or Moon. The bounds are among the oldest layers of the dignity system; Ptolemy records the 'Egyptian' table we use, and medieval astrologers called them terms. A planet in its own bound gains quiet self-possession. Traditionally the bound lord colors the fine grain of a placement — the accent within the accent — and was consulted for physical description and life-stage rulers."],
  ["Cazimi & combust", "Two fates of a planet near the Sun. Within about 8.5 degrees, a planet is combust — burned up in the glare, its significations weakened or hidden, working unseen. But within 17 arcminutes of the Sun's exact center it is cazimi, 'in the heart of the Sun' — the king's chosen advisor, singularly empowered. The same closeness that destroys at arm's length crowns at the heart."],
  ["Decan (face)", "A ten-degree third of a sign — thirty-six faces around the wheel, each assigned a planetary ruler in the descending Chaldean order (Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon, repeating). The decans began as Egyptian star-clocks marking the hours of the night, and they survive everywhere: the tarot's thirty-six minor pip cards (2–10) are the thirty-six decans wearing costumes. The weakest dignity, and the most visual — read it for imagery, mood, and texture."],
  ["Detriment (exile)", "A planet in the sign opposite one of its domiciles — Venus in Aries, the Moon in Capricorn. The planet is a guest in a house built on values opposite its own, so its style runs against the grain of the terrain. This produces friction and also its gifts: improvisation, self-awareness, fluency earned rather than inherited. Modern practice reads detriment less as weakness than as a placement that must become conscious of itself."],
  ["Dignity (essential)", "The five-layer system measuring how resourced a planet is by zodiac position alone: domicile (its own sign), exaltation (its honored sign), triplicity (its element team), bound (its degrees), and face (its decan) — with detriment and fall as the challenged mirror states, and peregrine as the unhoused wanderer with none. Essential dignity is about intrinsic resources; how a planet is placed in houses and aspects (accidental dignity) is about opportunity."],
  ["Domicile (rulership)", "A planet standing in a sign it rules — the Sun in Leo, the Moon in Cancer, Saturn in Capricorn or Aquarius. It is in its own house with its own tools and answers to no landlord: what it signifies, it can deliver by itself. The domicile lord of any sign also 'manages' every other planet staying there — which is why the ruler of your Ascendant matters so much."],
  ["Exaltation", "The sign where a planet is received like royalty — the Sun in Aries, the Moon in Taurus, Venus in Pisces, Saturn in Libra. Abu Ma'shar calls it the planet's kingdom. Exalted planets act with elevation and confidence, sometimes with the exaggeration of a guest of honor: celebrated, slightly idealized, expected to perform the best version of themselves."],
  ["Fall (depression)", "The sign opposite a planet's exaltation — the Moon in Scorpio, Venus in Virgo, Saturn in Aries. The planet's usual method finds no applause here; its confidence runs at low tide. Tradition read this as debility, and lived experience often reads it as depth: placements in fall tend to develop unusual honesty about their own workings, strength assembled from first principles rather than inheritance."],
  ["Graha", "Sanskrit for 'seizer' — the nine 'planets' of Jyotish: Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, and the two lunar nodes Rahu and Ketu. The name is the theory: a graha is that which grips consciousness and holds it to a storyline."],
  ["Lot of Fortune", "An Arabic part cast from the three great lights of the chart — Ascendant plus Moon minus Sun by day, reversed by night. Fortune concerns the given: the body, health, livelihood, circumstance — what happens to you and through you without your asking. Hellenistic astrologers treated it as a second Ascendant for matters of fortune and counted whole-sign houses from it."],
  ["Lot of Spirit", "Fortune's deliberate twin — Ascendant plus Sun minus Moon by day, reversed at night. Where Fortune is what befalls you, Spirit is what you set in motion: will, vocation, chosen action, the life you author. Zodiacal releasing is most often counted from Spirit for career and life-direction questions."],
  ["Mahadasha", "A major planetary chapter in the Vimshottari system, lasting from 6 years (Sun) to 20 (Venus). Which chapter you begin life inside — and how far along — is seeded entirely by the Moon's nakshatra at birth. People often recognize their mahadasha changes in hindsight as the chapter breaks of their biography."],
  ["Midheaven (MC)", "The Medium Coeli — the degree of the zodiac culminating overhead at your birth. It crowns the 10th house region: public work, reputation, the visible summit of a life, and (in older texts) 'praxis' — what you do. Aspects to the MC describe what colors your public becoming."],
  ["Nakshatra", "One of the 27 lunar mansions dividing the sidereal zodiac into 13°20' segments — the Moon's nightly resting places. Each has a presiding deity, a symbol, an animal, a temperament, and a planetary lord; together they are Jyotish's oldest layer, older than the twelve signs. The Moon's nakshatra at your birth (your janma nakshatra) names your emotional habitat and seeds the entire Vimshottari timeline. Our charts give the nakshatra and pada of every planet and of the Ascendant and Midheaven."],
  ["Navamsa (D9)", "The ninth harmonic chart: each sign divides into nine padas of 3°20', which reassemble into a second complete chart. Tradition reads it for marriage and partnership, dharma, and the inner fruit of the natal promise — the D1 is the tree, the D9 the fruit hidden inside it. A planet in the same sign in both charts (vargottama) gains uncommon strength."],
  ["Orb", "The allowance around an exact aspect within which it still 'works.' A trine at exactly 120°00' is rare; within a few degrees the conversation is still audible. We default to 8° for conjunctions, oppositions and trines, 7° for squares, 6° for sextiles — tighter orb, louder aspect. The orb number shown beside each aspect is its distance from exactness."],
  ["Pada", "A quarter of a nakshatra — 3°20', the smallest commonly-read unit of the sidereal zodiac. The four padas step each mansion through a fire–earth–air–water sequence and map one-to-one onto the navamsa: knowing a planet's pada is knowing its D9 sign. Pada lords add a final grace note to any placement."],
  ["Peregrine", "A planet with no essential dignity at its degree — not in its domicile, exaltation, triplicity, bound, or face. The medieval image is a wanderer without land: improvising, borrowing, unusually shaped by whoever rules the sign it visits (its dispositor). Peregrine planets often carry the most interesting plot lines, because they must make a life rather than inherit one."],
  ["Profection", "An ancient timing wheel: each birthday, your Ascendant 'profects' one house forward, and that year takes its themes from the house reached — its sign's ruler becomes your Lord of the Year. Twelve years, full circle, begin again. Simple, old, startlingly accurate as a table of contents for the year."],
  ["Rasi (D1)", "The root chart of Jyotish — the sidereal signs exactly as they stood at birth, before any division. All the divisional charts (vargas) are derived from it, which is why it is called D1: the ground floor of the whole Vedic reading."],
  ["Retrograde", "The apparent backward motion of a planet as Earth overtakes it (or is overtaken). Nothing in the sky reverses; the geometry of viewpoint does. Tradition reads retrograde planets as internalized, revisionary, working on their own schedule — strength turned inward, themes that return for a second pass. In the chart tables retrogrades are marked ℞."],
  ["Sect", "The chart's oldest sorting: were you born with the Sun above the horizon (a day chart) or below it (a night chart)? Each sect has a team — Sun, Jupiter, Saturn by day; Moon, Venus, Mars by night; Mercury swings with its sunrise position. Planets on duty in their own sect act with more grace: the benefic of sect gives more freely, the malefic contrary to sect tests more sharply. Sect is the first thing a Hellenistic astrologer checks, because it re-weights everything else."],
  ["Sidereal zodiac", "The zodiac measured against the fixed stars themselves, used by Jyotish and by Western sidereal astrologers. Because of precession it drifts about one degree every 72 years relative to the seasons — hence the ayanamsa correction, and hence your 'Vedic sign' often being one sign earlier than your tropical one. Neither zodiac is wrong; they measure different skies."],
  ["Solar return", "The chart cast for the exact moment the Sun returns to its natal degree each year — your astrological new year, accurate to the minute. Read as a standalone chart for the year's weather, then laid over the natal chart for where it lands. The location can be cast for where you'll be on the birthday, which is why some people travel for their returns."],
  ["Station", "The moments a planet appears to stand still, pivoting between direct and retrograde motion. Stationing planets are traditionally at their most potent — a held breath in the sky. A planet stationing on one of your natal degrees marks a season that asks your full attention."],
  ["Synastry", "The astrology of relationship: two charts laid over each other, each person's planets aspecting the other's. Your Moon on someone's Ascendant, their Saturn on your Venus — synastry maps where two skies interlock, comfort, and instruct each other."],
  ["Transit", "The sky as it moves now, read against the sky you were born under. A transit is a real-time aspect from a moving planet to a natal position — the mechanism behind every honest 'what's happening right now' reading, and the engine of our Transits room."],
  ["Triplicity", "The element-team dignity: each element (fire, earth, air, water) is stewarded by three planets who trade shifts — a day ruler, a night ruler, and a participating partner. A planet in its own triplicity has allies on call: not the keys to the house, but family in the neighborhood. Dorotheus made triplicity the backbone of his whole system."],
  ["Vimshottari dasha", "The 120-year master clock of Jyotish: nine planetary chapters — Ketu 7, Venus 20, Sun 6, Moon 10, Mars 7, Rahu 18, Jupiter 16, Saturn 19, Mercury 17 — whose order is fixed and whose starting point is seeded by the Moon's nakshatra at birth. Where you begin in the wheel, and how much of that first chapter remains, is the first timing fact of a Vedic reading."],
  ["Whole-sign houses", "The oldest and simplest house system: the entire rising sign is your 1st house, the next sign your 2nd, and so on around — every house exactly one sign. Standard in Hellenistic and Vedic practice, and enjoying a modern revival. We default to whole sign for Vedic charts and Placidus for Western, with both switchable — comparing the two is half the fun."],
  ["Zodiacal releasing", "Vettius Valens' grand timing technique: beginning from the Lot of Spirit (for deeds and career) or Fortune (for body and circumstance), life unfolds in sign-ruled chapters lasting that sign's 'minor years,' each subdividing fractally into months and days. Peak chapters arrive when the releasing reaches signs angular to Fortune; the 'loosing of the bond' marks a dramatic change of storyline. Recovered from near-oblivion by the modern Hellenistic revival, it is among the most striking timing tools ever devised — your L1 chapters are already computed in the deeper chart."],
];

const VEDIC_TERMS = new Set([
  "Ayanamsa",
  "Antardasha (bhukti)",
  "Graha",
  "Mahadasha",
  "Nakshatra",
  "Navamsa (D9)",
  "Pada",
  "Rasi (D1)",
  "Sidereal zodiac",
  "Vimshottari dasha",
]);

/** [name, presiding deity, Vimshottari lord] in classical order. */
const NAKSHATRA_LEGEND: [string, string, string][] = [
  ["Ashwini", "The Ashvins — twin physicians of the gods", "Ketu"],
  ["Bharani", "Yama — dharma and the threshold", "Venus"],
  ["Krittika", "Agni — sacred fire", "Sun"],
  ["Rohini", "Prajapati (Brahma) — creation", "Moon"],
  ["Mrigashira", "Soma — the nectar Moon", "Mars"],
  ["Ardra", "Rudra — the storm", "Rahu"],
  ["Punarvasu", "Aditi — the boundless mother", "Jupiter"],
  ["Pushya", "Brihaspati — priest of the gods", "Saturn"],
  ["Ashlesha", "The Nagas — serpent wisdom", "Mercury"],
  ["Magha", "The Pitrs — the ancestors", "Ketu"],
  ["Purva Phalguni", "Bhaga — pleasure and portion", "Venus"],
  ["Uttara Phalguni", "Aryaman — patronage and vows", "Sun"],
  ["Hasta", "Savitr — the golden hand of the Sun", "Moon"],
  ["Chitra", "Tvashtar (Vishvakarma) — divine architect", "Mars"],
  ["Swati", "Vayu — the wind", "Rahu"],
  ["Vishakha", "Indra-Agni — purpose with power", "Jupiter"],
  ["Anuradha", "Mitra — friendship and alliance", "Saturn"],
  ["Jyeshtha", "Indra — the elder's crown", "Mercury"],
  ["Mula", "Nirriti — the root and its undoing", "Ketu"],
  ["Purva Ashadha", "Apas — the invincible waters", "Venus"],
  ["Uttara Ashadha", "The Vishvedevas — universal principles", "Sun"],
  ["Shravana", "Vishnu — the listener's three steps", "Moon"],
  ["Dhanishta", "The Vasus — abundance in motion", "Mars"],
  ["Shatabhisha", "Varuna — the hundred healers", "Rahu"],
  ["Purva Bhadrapada", "Aja Ekapada — the one-footed fire", "Jupiter"],
  ["Uttara Bhadrapada", "Ahirbudhnya — serpent of the deep", "Saturn"],
  ["Revati", "Pushan — shepherd of safe passage", "Mercury"],
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
      </section>

      <div className="mt-10 text-center">
        <Link href="/studio" className="btn-gold">
          ✦ Cast your chart with all of this inside
        </Link>
      </div>
    </div>
  );
}
