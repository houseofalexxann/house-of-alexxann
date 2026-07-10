/** Public types for the House of Alexxann calculation engine. */

export type ChartSystem = "western" | "vedic";

/** House systems exposed to users. Mapped internally to Swiss Ephemeris codes. */
export type HouseSystem =
  | "placidus"
  | "whole-sign"
  | "koch"
  | "equal"
  | "porphyry"
  | "regiomontanus"
  | "campanus";

export type Ayanamsa = "lahiri" | "raman" | "krishnamurti" | "fagan-bradley";

export type NodeType = "true" | "mean";

export type Body =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto"
  | "rahu" // north node
  | "ketu"; // south node

export type AspectType =
  | "conjunction"
  | "sextile"
  | "square"
  | "trine"
  | "opposition";

export interface ChartInput {
  /** Birth instant in UTC, ISO-8601 (e.g. "1879-03-14T10:50:00Z"). */
  utc: string;
  /** Geographic latitude, degrees north positive. */
  latitude: number;
  /** Geographic longitude, degrees east positive. */
  longitude: number;
  system: ChartSystem;
  /** Default: placidus (western), whole-sign (vedic). */
  houseSystem?: HouseSystem;
  /** Vedic only. Default: lahiri. */
  ayanamsa?: Ayanamsa;
  /** Default: true node. */
  nodeType?: NodeType;
  /**
   * When the birth time is unknown, pass false: angles, house cusps and
   * house placements are suppressed, and Moon-dependent output is flagged.
   */
  timeKnown?: boolean;
  /** Per-aspect orb overrides in degrees (western aspects). */
  orbs?: Partial<Record<AspectType, number>>;
}

export interface PlanetPosition {
  body: Body;
  /** Ecliptic longitude 0–360 (tropical for western, sidereal for vedic). */
  longitude: number;
  /** Ecliptic latitude in degrees. */
  latitude: number;
  /** Longitudinal speed, degrees/day (negative = retrograde). */
  speed: number;
  retrograde: boolean;
  /** 0 = Aries … 11 = Pisces. */
  sign: number;
  /** Degrees into the sign, 0–30. */
  degreeInSign: number;
  /** Formatted e.g. `23°30'` */
  formatted: string;
  /** House 1–12; null when birth time is unknown. */
  house: number | null;
  /** Vedic only: nakshatra of this body. */
  nakshatra?: NakshatraPosition;
}

export interface NakshatraPosition {
  /** 0 = Ashwini … 26 = Revati. */
  index: number;
  name: string;
  /** Quarter 1–4. */
  pada: number;
  /** Vimshottari lord of the nakshatra. */
  lord: Body | "mercury" | "venus";
}

export interface Angles {
  ascendant: number;
  midheaven: number;
  ascendantSign: number;
  midheavenSign: number;
  formattedAscendant: string;
  formattedMidheaven: string;
}

export interface Aspect {
  a: Body;
  b: Body;
  type: AspectType;
  /** Exact angle of the aspect (0, 60, 90, 120, 180). */
  angle: number;
  /** Deviation from exact, degrees. */
  orb: number;
  /** True if the aspect is getting tighter. */
  applying: boolean | null;
}

export interface DashaPeriod {
  lord: Body;
  /** ISO UTC timestamps. */
  start: string;
  end: string;
  /** Antardashas (sub-periods); present on mahadashas. */
  sub?: DashaPeriod[];
}

export interface VimshottariDasha {
  /** Moon nakshatra that seeds the timeline. */
  moonNakshatra: NakshatraPosition;
  /** Fraction of the first mahadasha remaining at birth (0–1). */
  balanceOfFirst: number;
  mahadashas: DashaPeriod[];
}

export interface NavamsaPosition {
  body: Body | "ascendant";
  /** Navamsa (D9) sign, 0–11. */
  sign: number;
}

export type Dignity =
  | "domicile"
  | "exaltation"
  | "detriment"
  | "fall"
  | "peregrine";

export interface PlanetDignity {
  body: Body;
  sign: number;
  dignity: Dignity;
  /** Traditional ruler of the sign this planet occupies. */
  rulerOfSign: Body;
}

export interface MoonPhase {
  /** Sun–Moon elongation, 0–360. */
  elongation: number;
  /** e.g. "Waning Crescent (Balsamic)". */
  phase: string;
  waxing: boolean;
  /** Illuminated fraction, 0–1. */
  illumination: number;
}

export interface SectInfo {
  sect: "day" | "night";
  /** The luminary of the sect (Sun by day, Moon by night). */
  lightLeader: "sun" | "moon";
  beneficOfSect: Body;
  maleficContraryToSect: Body;
  /** Per traditional planet: comfortable in this chart's sect? */
  inSect: Partial<Record<Body, boolean>>;
}

export interface AngleAspect {
  planet: Body;
  angle: "ascendant" | "midheaven";
  type: AspectType;
  orb: number;
}

export interface TraditionalAnalysis {
  /** Null when the birth time is unknown. */
  sect: SectInfo | null;
  dignities: PlanetDignity[];
  moonPhase: MoonPhase;
  /** Empty when the birth time is unknown. */
  angleAspects: AngleAspect[];
}

export interface ChartResult {
  input: Required<Pick<ChartInput, "utc" | "latitude" | "longitude" | "system">> & {
    houseSystem: HouseSystem;
    ayanamsa: Ayanamsa | null;
    nodeType: NodeType;
    timeKnown: boolean;
  };
  /** Julian day (UT) used for the computation. */
  julianDayUT: number;
  /** Ayanamsa value in degrees at the birth instant (vedic only). */
  ayanamsaValue: number | null;
  planets: PlanetPosition[];
  /** Null when birth time is unknown. */
  angles: Angles | null;
  /** 12 house cusp longitudes (index 0 = house 1); null when time unknown. */
  houseCusps: number[] | null;
  aspects: Aspect[];
  /** Vedic only. */
  vimshottari: VimshottariDasha | null;
  /** Vedic only: D9 (navamsa) sign placements. */
  navamsa: NavamsaPosition[] | null;
  /** Traditional/Hellenistic depth: sect, dignities, moon phase, angle aspects. */
  traditional: TraditionalAnalysis;
  /** Engine + ephemeris version for reproducibility. */
  engineVersion: string;
}
