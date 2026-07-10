/**
 * Birthplace resolution: free-text place → latitude/longitude/IANA timezone.
 * Uses the Open-Meteo geocoding API (no key required). Historical DST/offset
 * handling happens in localBirthToUtc via Luxon + the IANA tz database, so
 * e.g. wartime clocks and pre-standard local mean time resolve correctly.
 */
import { DateTime } from "luxon";

export interface PlaceResult {
  id: number;
  name: string;
  /** e.g. "Ulm, Baden-Württemberg, Germany" */
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country: string;
}

interface OpenMeteoResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  timezone: string;
  country?: string;
  admin1?: string;
}

export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "6");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const data = (await res.json()) as { results?: OpenMeteoResult[] };
  return (data.results ?? [])
    .filter((r) => r.latitude != null && r.timezone)
    .map((r) => ({
      id: r.id,
      name: r.name,
      label: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
      latitude: r.latitude,
      longitude: r.longitude,
      timezone: r.timezone,
      country: r.country ?? "",
    }));
}

export interface LocalBirth {
  /** "YYYY-MM-DD" */
  date: string;
  /** "HH:mm" (24h). Ignored when timeKnown is false. */
  time: string;
  timeKnown: boolean;
  /** IANA zone, e.g. "Europe/Berlin". */
  timezone: string;
}

export interface ResolvedInstant {
  utc: string;
  /** The local wall-clock time actually used. */
  localUsed: string;
  /** Offset from UTC in minutes at that instant (historical rules applied). */
  offsetMinutes: number;
  warnings: string[];
}

/**
 * Convert a local birth date/time to the UTC instant, applying the timezone's
 * full historical rules (DST, wartime shifts, LMT before standardization).
 */
export function localBirthToUtc(birth: LocalBirth): ResolvedInstant {
  const warnings: string[] = [];
  // Unknown birth time → solar noon convention; house-dependent output is
  // suppressed downstream by the engine's timeKnown flag.
  const time = birth.timeKnown ? birth.time : "12:00";
  if (!birth.timeKnown) {
    warnings.push(
      "Birth time unknown — positions are cast for local noon; houses, the Ascendant and the Moon's exact degree are omitted or approximate."
    );
  }

  let dt = DateTime.fromISO(`${birth.date}T${time}`, { zone: birth.timezone });
  if (!dt.isValid) {
    // A nonexistent wall time (spring-forward gap) or bad input.
    dt = DateTime.fromISO(`${birth.date}T${time}`, {
      zone: birth.timezone,
      setZone: true,
    });
    if (!dt.isValid) {
      throw new Error(`Invalid birth date/time: ${dt.invalidExplanation ?? dt.invalidReason}`);
    }
  }

  return {
    utc: dt.toUTC().toISO({ suppressMilliseconds: true })!,
    localUsed: dt.toISO({ suppressMilliseconds: true, includeOffset: true })!,
    offsetMinutes: dt.offset,
    warnings,
  };
}
