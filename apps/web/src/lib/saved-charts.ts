/**
 * Saved charts, the parts safe to share with the browser: the shape of a
 * saved profile, the limits, and how two sets of birth details compare.
 *
 * Every account keeps its own chart. Beyond that, a free account keeps a
 * few more (a partner, a child, a friend) and a member keeps as many as she
 * likes.
 */
export const FREE_OTHER_CHARTS = 3;
/** A ceiling for members too, far above real use, so the list stays a list. */
export const MEMBER_OTHER_CHARTS = 200;

export interface SavedProfile {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string | null;
  placeLabel: string;
  latitude: number;
  longitude: number;
  timezone: string;
  /** The account holder's own chart. */
  isSelf: boolean;
}

export interface BirthDetails {
  birthDate: string;
  birthTime: string | null;
  latitude: number;
  longitude: number;
}

/** The same moment and place (to about a kilometre), whatever the chart is called. */
export function sameBirth(a: BirthDetails, b: BirthDetails): boolean {
  return (
    a.birthDate === b.birthDate &&
    (a.birthTime ?? "") === (b.birthTime ?? "") &&
    Math.abs(a.latitude - b.latitude) < 0.01 &&
    Math.abs(a.longitude - b.longitude) < 0.01
  );
}
