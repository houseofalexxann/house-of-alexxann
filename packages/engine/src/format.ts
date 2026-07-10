import { SIGN_NAMES } from "./constants";

/** Split a 0–360 longitude into sign index + degrees into sign. */
export function signOf(longitude: number): { sign: number; degreeInSign: number } {
  const sign = Math.floor(longitude / 30) % 12;
  return { sign, degreeInSign: longitude - sign * 30 };
}

/** Format degrees-in-sign as `23°30'` (rounded to the arcminute). */
export function formatDegreeInSign(degreeInSign: number): string {
  let deg = Math.floor(degreeInSign);
  let min = Math.round((degreeInSign - deg) * 60);
  if (min === 60) {
    deg += 1;
    min = 0;
  }
  return `${deg}°${String(min).padStart(2, "0")}'`;
}

/** Format a longitude as e.g. `23°30' Pisces`. */
export function formatLongitude(longitude: number): string {
  const { sign, degreeInSign } = signOf(longitude);
  return `${formatDegreeInSign(degreeInSign)} ${SIGN_NAMES[sign]}`;
}
