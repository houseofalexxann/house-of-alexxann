# @hoa/engine

The House of Alexxann calculation core: **one isolated, deterministic API over the Swiss Ephemeris**. Every surface (Chart Studio, admin, later phases) calls `computeChart()`; nothing else in the platform computes chart math.

## API

```ts
import { computeChart } from "@hoa/engine";

const chart = computeChart({
  utc: "1990-06-15T14:30:00Z",   // birth instant in UTC (app resolves tz/DST)
  latitude: 40.7128,             // north positive
  longitude: -74.006,            // east positive
  system: "western",             // or "vedic"
  houseSystem: "placidus",       // placidus | whole-sign | koch | equal | porphyry | regiomontanus | campanus
  ayanamsa: "lahiri",            // vedic: lahiri (default) | raman | krishnamurti | fagan-bradley
  nodeType: "true",              // true (default) | mean lunar node
  timeKnown: true,               // false suppresses angles/houses (PRD §11)
  orbs: { conjunction: 8 },      // optional per-aspect orb overrides
});
```

Returns planets (longitude, speed, retrograde, sign, house, nakshatra for vedic), angles (Asc/MC), 12 house cusps, major aspects with orbs, and for vedic charts: the ayanamsa value, Vimshottari mahadasha/antardasha timeline, and D9 (navamsa) placements. Same input → identical output, always.

## Defaults (locked in PRD §15)

- Western: tropical zodiac, **Placidus** houses.
- Vedic: sidereal, **Lahiri** ayanamsa, **Whole Sign** houses, D1 + D9, Vimshottari dasha (365.25-day years).

## Ephemeris data

`ephe/` bundles the Swiss Ephemeris data files `sepl_18.se1`, `semo_18.se1`, `seas_18.se1` (coverage 1800–2400 AD). Outside that range sweph falls back to the built-in Moshier ephemeris automatically.

> **License note:** the Swiss Ephemeris is AGPL or paid-commercial. Per PRD §15.2 the license decision must be made before public/commercial launch.

## Verification (the accuracy gate, PRD §12.2)

`npm test` runs three suites (103 assertions):

1. **`references.test.ts`** — six known birth data sets (Einstein, Diana, Cobain, Jobs, Obama, Monroe) vs published reference values (Astrotheme/AstroDatabank lineage; vedicastroindex for the Vedic side): planetary longitudes and Asc/MC within 2 arcminutes, exact signs, published Placidus house placements, sidereal Moon, Rohini pada 1 and Obama's published mahadasha timeline (Moon→1971, Mars→1978, Rahu→1996, Jupiter→2012, Saturn→2031).
2. **`cross-engine.test.ts`** — sweph vs `astronomy-engine` (an independent VSOP87-lineage implementation): Sun–Pluto across all six charts agree within 0.02°.
3. **`internal.test.ts`** — determinism, sidereal-mode isolation, house geometry per system, tropical−sidereal ≡ ayanamsa, nakshatra/navamsa/Vimshottari arithmetic, aspect orbs, time-unknown mode, input validation.

Known convention note: astrology sites "bump" a planet within ~0.5° of the next house cusp into that house for display; this engine reports strict geometric placement. The reference tests accept exactly that case and nothing else.
