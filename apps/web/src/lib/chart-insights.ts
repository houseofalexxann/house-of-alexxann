/**
 * Cosmic insights: the at-a-glance facts a reader would pull from a chart
 * first, computed from the cast itself. Every card is a true statement about
 * the chart (a placement, a count, an angle) followed by one reflective
 * sentence in the House's voice. Tendencies, never verdicts.
 */
import type { Body, ChartResult } from "@hoa/engine";
import { ASPECT_KEY, PLANET_KEY, SIGN_KEY } from "./chart-key";

export interface Insight {
  id: string;
  /** Short label, e.g. "Your big three". */
  title: string;
  /** The fact, stated plainly. */
  fact: string;
  /** One reflective sentence. */
  note: string;
  /** A glyph or short mark to lead the card. */
  mark: string;
}

const ELEMENTS = ["Fire", "Earth", "Air", "Water"] as const;
const MODALITIES = ["Cardinal", "Fixed", "Mutable"] as const;

/** Traditional rulers, shared by both systems for the seven classical planets. */
const RULER: Body[] = [
  "mars", "venus", "mercury", "moon", "sun", "mercury",
  "venus", "mars", "jupiter", "saturn", "saturn", "jupiter",
];

const CLASSICAL: Body[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn"];

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

function listNames(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function computeInsights(chart: ChartResult, now: number): Insight[] {
  const vedic = chart.input.system === "vedic";
  const timeKnown = Boolean(chart.angles);
  const planets = chart.planets;
  const byBody = new Map(planets.map((p) => [p.body, p]));
  const keyOf = (b: Body) => PLANET_KEY.find((k) => k.body === b);
  const name = (b: Body) => {
    const k = keyOf(b);
    if (!k) return b;
    return vedic && k.sanskrit ? k.sanskrit : k.name;
  };
  const glyph = (b: Body) => keyOf(b)?.glyph ?? "";
  const sign = (s: number) => (vedic ? `${SIGN_KEY[s].sanskrit} (${SIGN_KEY[s].name})` : SIGN_KEY[s].name);
  const out: Insight[] = [];

  // 1. The big three.
  const sun = byBody.get("sun");
  const moon = byBody.get("moon");
  if (sun && moon) {
    const rising = chart.angles ? `rising ${sign(chart.angles.ascendantSign)}` : "rising sign unknown";
    out.push({
      id: "big-three",
      title: vedic ? "Sun, Moon and lagna" : "Your big three",
      fact: `Sun in ${sign(sun.sign)} · Moon in ${sign(moon.sign)} · ${rising}`,
      note: vedic
        ? "Jyotish weighs the Moon and the lagna most heavily: the mind and the body you live in. The Sun is the soul behind them."
        : "Identity, inner life, and approach, in that order. Most readings begin here, and most people recognise themselves in all three.",
      mark: "☉︎ ☽︎ ↑",
    });
  }

  // 2. The chart ruler / lagna lord.
  if (chart.angles) {
    const rulerBody = RULER[chart.angles.ascendantSign];
    const ruler = byBody.get(rulerBody);
    if (ruler) {
      out.push({
        id: "ruler",
        title: vedic ? "Lagna lord" : "Chart ruler",
        fact: `${name(rulerBody)} rules your rising sign and sits in ${sign(ruler.sign)}${ruler.house ? `, ${ordinal(ruler.house)} house` : ""}${ruler.retrograde ? ", retrograde" : ""}`,
        note: vedic
          ? "Where the lagna lord goes, the life tends to follow. Its house is often the first thing a Jyotishi checks."
          : "Traditionally the planet that steers the whole chart. Its house is where a lot of your life tends to happen.",
        mark: glyph(rulerBody),
      });
    }
  }

  // 3. Sect: a day chart or a night chart (Western only; Jyotish has its own strength system).
  if (!vedic && chart.traditional.sect) {
    const s = chart.traditional.sect;
    out.push({
      id: "sect",
      title: s.sect === "day" ? "A day chart" : "A night chart",
      fact: `${s.lightLeader === "sun" ? "The Sun" : "The Moon"} leads · ${name(s.beneficOfSect)} is the benefic of the sect · ${name(s.maleficContraryToSect)} is out of sect`,
      note: "Hellenistic astrology reads the benefic of the sect as the kindest planet in a chart and the malefic contrary to the sect as the one that asks the most of you.",
      mark: s.sect === "day" ? "☉︎" : "☽︎",
    });
  }

  // 4. Elements and modalities.
  const counted = planets.filter((p) => (vedic ? CLASSICAL.includes(p.body) : p.body !== "rahu" && p.body !== "ketu"));
  const elCount = [0, 0, 0, 0];
  const moCount = [0, 0, 0];
  for (const p of counted) {
    elCount[p.sign % 4]++;
    moCount[p.sign % 3]++;
  }
  const leadEl = ELEMENTS[elCount.indexOf(Math.max(...elCount))];
  const quietEl = elCount.includes(0) ? ELEMENTS[elCount.indexOf(0)] : null;
  const leadMo = MODALITIES[moCount.indexOf(Math.max(...moCount))];
  out.push({
    id: "balance",
    title: "Elements and modes",
    fact: `${ELEMENTS.map((e, i) => `${e} ${elCount[i]}`).join(" · ")}  ·  ${MODALITIES.map((m, i) => `${m} ${moCount[i]}`).join(" · ")}`,
    note: `${leadEl} leads, and ${leadMo.toLowerCase()} is the dominant mode.${
      quietEl ? ` ${quietEl} holds no planets at all, which is usually something a person seeks out through others, or learns on purpose.` : ""
    }`,
    mark: leadEl === "Fire" ? "△" : leadEl === "Earth" ? "▽" : leadEl === "Air" ? "◭" : "◮",
  });

  // 5. Stelliums.
  const bySign = new Map<number, Body[]>();
  const byHouse = new Map<number, Body[]>();
  for (const p of counted) {
    bySign.set(p.sign, [...(bySign.get(p.sign) ?? []), p.body]);
    if (p.house) byHouse.set(p.house, [...(byHouse.get(p.house) ?? []), p.body]);
  }
  const signGroups = [...bySign.entries()].filter(([, b]) => b.length >= 3);
  const houseGroups = timeKnown ? [...byHouse.entries()].filter(([, b]) => b.length >= 3) : [];
  if (signGroups.length || houseGroups.length) {
    const parts = [
      ...signGroups.map(([s, b]) => `${listNames(b.map(name))} in ${sign(s)}`),
      ...houseGroups.map(([h, b]) => `${listNames(b.map(name))} in the ${ordinal(h)} house`),
    ];
    out.push({
      id: "stellium",
      title: "Where the energy gathers",
      fact: parts.join(" · "),
      note: "Three or more planets in one place make a stellium: that sign or house tends to be a major theme, sometimes the theme.",
      mark: "✦✦✦",
    });
  }

  // 6. Tightest aspects.
  const tight = [...chart.aspects]
    .filter((a) => !((a.a === "rahu" && a.b === "ketu") || (a.a === "ketu" && a.b === "rahu")))
    .sort((a, b) => a.orb - b.orb)
    .slice(0, 3);
  if (tight.length) {
    const first = ASPECT_KEY.find((k) => k.type === tight[0].type);
    out.push({
      id: "aspects",
      title: "Tightest aspects",
      fact: tight.map((a) => `${name(a.a)} ${a.type} ${name(a.b)} (${a.orb.toFixed(1)}°)`).join(" · "),
      note: first
        ? `The closer the orb, the louder the conversation. ${first.name}: ${first.keynote}`
        : "The closer the orb, the louder the conversation.",
      mark: first?.symbol ?? "☌︎",
    });
  }

  // 7. Moon phase.
  const mp = chart.traditional.moonPhase;
  if (mp) {
    out.push({
      id: "moon-phase",
      title: "Born under",
      fact: `${mp.phase}, ${Math.round(mp.illumination * 100)}% lit`,
      note: mp.waxing
        ? "A growing Moon. Traditionally read as an instinct to build, begin, and push toward what is not yet there."
        : "A fading Moon. Traditionally read as an instinct to distil, release, and finish what was started before you.",
      mark: mp.waxing ? "☽︎" : "☾︎",
    });
  }

  // 8. Angular planets: sitting on the Ascendant or Midheaven.
  if (chart.angles) {
    const onAngles = chart.traditional.angleAspects
      .filter((a) => a.type === "conjunction" && a.orb <= 5)
      .sort((a, b) => a.orb - b.orb);
    if (onAngles.length) {
      out.push({
        id: "angular",
        title: "On the angles",
        fact: onAngles
          .map((a) => `${name(a.planet)} on the ${a.angle === "ascendant" ? "Ascendant" : "Midheaven"} (${a.orb.toFixed(1)}°)`)
          .join(" · "),
        note: "A planet sitting right on an angle is loud. It colours the whole chart and tends to be visible to everyone who meets you.",
        mark: glyph(onAngles[0].planet),
      });
    }
  }

  // 9. Retrogrades.
  const retro = planets.filter((p) => p.retrograde && p.body !== "rahu" && p.body !== "ketu");
  if (retro.length) {
    out.push({
      id: "retrograde",
      title: "Retrograde at birth",
      fact: listNames(retro.map((p) => name(p.body))),
      note: "Common, and not a flaw: the outer planets spend much of every year this way. Read as turned inward, a slower and more considered expression.",
      mark: "℞",
    });
  }

  // 10. Hemispheres (Western, with a birth time).
  if (!vedic && timeKnown) {
    const withHouse = counted.filter((p) => p.house);
    const above = withHouse.filter((p) => p.house! >= 7).length;
    const east = withHouse.filter((p) => [10, 11, 12, 1, 2, 3].includes(p.house!)).length;
    const total = withHouse.length;
    const skew = (a: number) => (a >= total * 0.7 ? "strong" : a <= total * 0.3 ? "strong the other way" : "balanced");
    if (skew(above) !== "balanced" || skew(east) !== "balanced") {
      out.push({
        id: "hemispheres",
        title: "Where the planets sit",
        fact: `${above} above the horizon, ${total - above} below · ${east} in the eastern half, ${total - east} in the western`,
        note:
          above >= total * 0.7
            ? "Most of the chart sits above the horizon, in the public, visible houses. Life tends to be lived out loud."
            : above <= total * 0.3
              ? "Most of the chart sits below the horizon, in the private houses. The real story tends to happen inside and at home."
              : east >= total * 0.7
                ? "Most planets sit in the eastern half, around the Ascendant. Traditionally read as self-directed: you tend to set things in motion."
                : "Most planets sit in the western half, around the Descendant. Traditionally read as relational: other people tend to set things in motion.",
        mark: "◐",
      });
    }
  }

  // 11. Jyotish: the Moon's nakshatra, the current dasha, the D9 lagna.
  if (vedic) {
    const nak = moon?.nakshatra;
    if (nak) {
      out.push({
        id: "nakshatra",
        title: "Moon nakshatra",
        fact: `${nak.name}, pada ${nak.pada}, ruled by ${name(nak.lord as Body)}`,
        note: "The lunar mansion the Moon occupied at birth. It seeds the whole dasha timeline and is read as the texture of the mind.",
        mark: "☽︎",
      });
    }
    const md = chart.vimshottari?.mahadashas.find((m) => now >= Date.parse(m.start) && now < Date.parse(m.end));
    if (md) {
      const until = new Date(md.end).toLocaleDateString("en-US", { month: "long", year: "numeric" });
      const lordPos = byBody.get(md.lord);
      out.push({
        id: "dasha",
        title: "The chapter you are in",
        fact: `${name(md.lord)} mahadasha, until ${until}${lordPos ? ` · ${name(md.lord)} sits in ${sign(lordPos.sign)}${lordPos.house ? `, ${ordinal(lordPos.house)} house` : ""}` : ""}`,
        note: "The dasha lord's own placement colours the whole period. Timing in Jyotish is read as a season, not a sentence.",
        mark: glyph(md.lord),
      });
    }
    const d9asc = chart.navamsa?.find((n) => n.body === "ascendant");
    if (d9asc) {
      out.push({
        id: "navamsa",
        title: "Navamsa lagna",
        fact: `D9 rising ${sign(d9asc.sign)}`,
        note: "The ninth harmonic chart is read for the deeper strength of each graha and for partnership and dharma.",
        mark: "◇",
      });
    }
  }

  return out;
}
