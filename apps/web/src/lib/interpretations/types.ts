/**
 * Baseline interpretation templates (PRD §6.5): authored, data-driven,
 * consistent and on-brand. No live AI generation in Phase 1.
 *
 * Voice: modern, mystical, warm, specific. Second person. 2–4 sentences.
 * Never doom-y; hard aspects are framed as workable tension.
 */
export interface Interpretation {
  title: string;
  body: string;
}

/** Bodies that receive sign/house/aspect interpretations. */
export type InterpBody =
  | "sun" | "moon" | "mercury" | "venus" | "mars"
  | "jupiter" | "saturn" | "uranus" | "neptune" | "pluto";

/** Arrays are indexed by sign 0 = Aries … 11 = Pisces. */
export type PerSign = Interpretation[];

/** Arrays are indexed by house 0 = 1st house … 11 = 12th house. */
export type PerHouse = Interpretation[];

export type AspectName =
  | "conjunction" | "sextile" | "square" | "trine" | "opposition";

/**
 * Aspect keys are `${a}-${b}-${type}` with a and b in chart order
 * (sun, moon, mercury, venus, mars, jupiter, saturn, uranus, neptune, pluto —
 * a always earlier in that order than b).
 */
export type AspectKey = `${InterpBody}-${InterpBody}-${AspectName}`;
