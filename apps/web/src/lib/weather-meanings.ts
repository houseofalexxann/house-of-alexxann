/**
 * Words for the weather.
 *
 * The engine classifies the sky's configuration; this file puts language on
 * it. Every condition below describes the SKY (how much of the day's exact
 * contact is tension, how much is ease, what the Moon is doing) and offers a
 * reflective frame. None of it claims an outcome. The framing follows
 * Ptolemy's doctrine of configurations as it is read in traditional practice:
 * squares and oppositions as tension that asks for adjustment, trines and
 * sextiles as ease, conjunctions taking the nature of the planets joined.
 * HISTORICAL DOCTRINE for the natures; REFLECTIVE LANGUAGE for the rest.
 */
import type {
  AspectType,
  Body,
  WeatherAspect,
  WeatherConditions,
  WeatherHighlight,
} from "@hoa/engine";
import { ASPECT_NATURE, POINT_LABEL } from "./transit-meanings";

export interface ConditionCopy {
  label: string;
  /** Four or five words: the forecast at a glance. */
  tagline: string;
  /** Two or three sentences. Reflective, never predictive. */
  reflection: string;
  /** The day's own light, in the House's palette. */
  tone: { glow: string; accent: string };
}

export const CONDITION_COPY: Record<WeatherConditions, ConditionCopy> = {
  still: {
    label: "Still",
    tagline: "A quiet sky.",
    reflection:
      "Few exact contacts today. Traditional practice reads a quiet sky as a day for tending rather than launching: finish what is open, rest where you can, and let the ground settle under you.",
    tone: { glow: "100,82,124", accent: "#a89bbb" },
  },
  clear: {
    label: "Clear",
    tagline: "Ease leads the day.",
    reflection:
      "Trines and sextiles carry the most weight today. Ease is an invitation rather than a guarantee: it rewards reaching for what is already moving, not waiting for it to arrive.",
    tone: { glow: "91,206,250", accent: "#8ed7f8" },
  },
  tender: {
    label: "Tender",
    tagline: "The Moon is speaking softly.",
    reflection:
      "The Moon is in gentle contact with Venus or Neptune and the sky is otherwise light. Days like this tend to favor care, beauty, and the conversations that need a soft room to happen in.",
    tone: { glow: "245,169,184", accent: "#f8bcc9" },
  },
  shifting: {
    label: "Shifting",
    tagline: "Ease and tension in the same sky.",
    reflection:
      "The day holds flow and friction in roughly equal measure. Read it the way you would changeable weather: carry both, and notice which one each hour actually brings.",
    tone: { glow: "198,170,224", accent: "#d3c7e0" },
  },
  charged: {
    label: "Charged",
    tagline: "Tension leads the day.",
    reflection:
      "Squares and oppositions carry the most weight today. Tradition reads these as friction that asks for an adjustment, which is different from a bad day: it is a day where something wants deciding.",
    tone: { glow: "245,169,184", accent: "#f5a9b8" },
  },
  turbulent: {
    label: "Turbulent",
    tagline: "A loud sky.",
    reflection:
      "Several hard contacts are exact or close to it at once. The old advice is not alarm but attention: slow the pace where you can, keep your words clean, and let what surfaces unfold before you name it.",
    tone: { glow: "212,99,143", accent: "#efa1b3" },
  },
};

export const WEATHER_NOT_FATE =
  "Weather, not fate: these conditions describe how the sky is configured today, computed from the Swiss Ephemeris. They say nothing about what will happen to you.";

const ARTICLE: Partial<Record<Body, string>> = { sun: "the Sun", moon: "the Moon" };

export function bodyName(b: Body): string {
  return ARTICLE[b] ?? POINT_LABEL[b] ?? b;
}

function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** "Venus trines Jupiter", "The Moon squares Saturn". */
export function describeAspect(a: Pick<WeatherAspect, "a" | "b" | "type">): string {
  return `${cap(bodyName(a.a))} ${ASPECT_NATURE[a.type as AspectType].verb} ${bodyName(a.b)}`;
}

/** The one-line phrasing of a highlight, for the week strip and the day list. */
export function describeHighlight(h: WeatherHighlight): string {
  switch (h.kind) {
    case "lunation":
      return `${h.phase === "new moon" ? "New Moon" : "Full Moon"} in ${h.signName}`;
    case "ingress":
      return `${cap(bodyName(h.body))} enters ${h.signName}`;
    case "station":
      return `${cap(bodyName(h.body))} stations ${h.station}`;
    case "exact":
      return describeAspect({ a: h.body, b: h.with!, type: h.aspect! });
  }
}

/** Weekday label for a UTC calendar date, "Today" for the first. */
export function weekdayLabel(date: string, index: number): string {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    weekday: "long",
    timeZone: "UTC",
  });
}

export function shortDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}
