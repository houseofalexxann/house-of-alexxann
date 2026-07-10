/**
 * Reference charts for the accuracy gate (PRD §12, criterion 2).
 *
 * Expected values were harvested 2026-07-09 from published references:
 * - Tropical positions, Ascendant, Midheaven and Placidus house placements:
 *   astrotheme.com celebrity pages (Swiss-Ephemeris lineage; AstroDatabank
 *   birth data, Rodden AA where noted).
 * - Vedic (Obama): vedicastroindex.com — Lahiri sidereal positions,
 *   Rohini pada 1, and the published Vimshottari mahadasha timeline.
 * - Birth data cross-checked against astro.com AstroDatabank entries.
 *
 * Longitudes are encoded as [degreeInSign, minutes, signIndex] (0 = Aries).
 */

export interface ReferenceChart {
  name: string;
  /** Birth instant converted to UTC from the documented local time. */
  utc: string;
  localTimeNote: string;
  latitude: number;
  longitude: number;
  /** [deg, min, sign] tropical. */
  expected: Record<string, [number, number, number]>;
  ascendant: [number, number, number];
  midheaven: [number, number, number];
  /** Published Placidus house placements (astrotheme), body -> house. */
  placidusHouses?: Record<string, number>;
}

export const DEG = (d: number, m: number, sign: number) => sign * 30 + d + m / 60;

export const REFERENCE_CHARTS: ReferenceChart[] = [
  {
    name: "Albert Einstein",
    utc: "1879-03-14T10:50:00Z",
    localTimeNote: "11:30 LMT Ulm (10E00 => UTC+0:40)",
    latitude: 48.4,
    longitude: 10.0,
    expected: {
      sun: [23, 30, 11],
      moon: [14, 32, 8],
      mercury: [3, 9, 0],
      venus: [16, 59, 0],
      mars: [26, 55, 9],
      jupiter: [27, 29, 10],
      saturn: [4, 11, 0],
      uranus: [1, 17, 5],
      neptune: [7, 52, 1],
    },
    ascendant: [11, 38, 3],
    midheaven: [12, 50, 11],
    placidusHouses: {
      sun: 10, moon: 6, mercury: 10, venus: 10, mars: 7,
      jupiter: 9, saturn: 10, uranus: 3, neptune: 11,
    },
  },
  {
    name: "Diana, Princess of Wales",
    utc: "1961-07-01T18:45:00Z",
    localTimeNote: "19:45 BST Sandringham (UTC+1)",
    latitude: 52.8333,
    longitude: 0.5,
    expected: {
      sun: [9, 40, 3],
      moon: [25, 2, 10],
    },
    ascendant: [18, 25, 8],
    midheaven: [23, 3, 6],
  },
  {
    name: "Kurt Cobain",
    utc: "1967-02-21T03:38:00Z",
    localTimeNote: "19:38 PST Aberdeen WA (UTC-8)",
    latitude: 46.9833,
    longitude: -123.8167,
    expected: {
      sun: [1, 49, 11],
      moon: [13, 24, 3],
      mercury: [18, 28, 11],
      venus: [26, 33, 11],
      mars: [1, 48, 7],
      jupiter: [25, 42, 3],
      saturn: [28, 44, 11],
      uranus: [23, 15, 5],
      neptune: [24, 21, 7],
    },
    ascendant: [23, 21, 5],
    midheaven: [21, 47, 2],
  },
  {
    name: "Steve Jobs",
    utc: "1955-02-25T03:15:00Z",
    localTimeNote: "19:15 PST San Francisco (UTC-8)",
    latitude: 37.7833,
    longitude: -122.4167,
    expected: {
      sun: [5, 45, 11],
      moon: [7, 45, 0],
      mercury: [14, 22, 10],
      venus: [21, 10, 9],
      mars: [29, 5, 0],
      jupiter: [20, 30, 3],
      saturn: [21, 10, 7],
      uranus: [24, 8, 3],
      neptune: [28, 3, 6],
    },
    ascendant: [22, 17, 5],
    midheaven: [21, 19, 2],
    placidusHouses: {
      sun: 6, moon: 7, mercury: 5, venus: 4, mars: 8,
      jupiter: 10, saturn: 3, uranus: 11, neptune: 2,
    },
  },
  {
    name: "Barack Obama",
    utc: "1961-08-05T05:24:00Z",
    localTimeNote: "19:24 AHST Honolulu (UTC-10)",
    latitude: 21.3,
    longitude: -157.8667,
    expected: {
      sun: [12, 33, 4],
      moon: [3, 21, 2],
      mercury: [2, 20, 4],
      venus: [1, 47, 3],
      mars: [22, 35, 5],
      jupiter: [0, 52, 10],
      saturn: [25, 20, 9],
      uranus: [25, 16, 4],
      neptune: [8, 36, 7],
    },
    ascendant: [18, 3, 10],
    midheaven: [28, 53, 7],
    placidusHouses: {
      sun: 6, moon: 4, mercury: 6, venus: 5, mars: 7,
      jupiter: 12, saturn: 12, uranus: 7, neptune: 9,
    },
  },
  {
    name: "Marilyn Monroe",
    utc: "1926-06-01T17:30:00Z",
    localTimeNote: "09:30 PST Los Angeles (UTC-8)",
    latitude: 34.05,
    longitude: -118.25,
    expected: {
      sun: [10, 27, 2],
      moon: [19, 6, 10],
      mercury: [6, 47, 2],
      venus: [28, 45, 0],
      mars: [20, 44, 11],
      jupiter: [26, 50, 10],
      saturn: [21, 26, 7],
      uranus: [29, 0, 11],
      neptune: [22, 13, 4],
    },
    ascendant: [13, 4, 4],
    midheaven: [6, 0, 1],
    placidusHouses: {
      sun: 11, moon: 7, mercury: 10, venus: 9, mars: 8,
      jupiter: 7, saturn: 4, uranus: 8, neptune: 1,
    },
  },
];

/** Published Vedic reference (vedicastroindex.com, Lahiri). */
export const OBAMA_VEDIC = {
  /** Sidereal Moon ~10.04° Taurus. */
  moonSidereal: DEG(10, 2, 1),
  nakshatra: "Rohini",
  pada: 1,
  /** Published mahadasha boundaries (month precision). */
  mahadashas: [
    { lord: "moon", endYear: 1971, endMonth: 7 },
    { lord: "mars", endYear: 1978, endMonth: 7 },
    { lord: "rahu", endYear: 1996, endMonth: 7 },
    { lord: "jupiter", endYear: 2012, endMonth: 7 },
    { lord: "saturn", endYear: 2031, endMonth: 7 },
  ],
};
