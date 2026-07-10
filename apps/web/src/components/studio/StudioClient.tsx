"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ChartResult } from "@hoa/engine";
import type { PlaceResult, ResolvedInstant } from "@/lib/geocode";
import { ChartWheel } from "@/components/chart/ChartWheel";
import { AspectTable, HouseCuspTable, PlanetTable } from "@/components/chart/DataTable";
import { DashaTimeline } from "@/components/chart/DashaTimeline";
import { RasiGrid } from "@/components/chart/RasiGrid";
import { InterpretationsPanel } from "@/components/chart/Interpretations";
import { PLANET_GLYPHS, SIGN_NAMES } from "@/components/chart/glyphs";

type System = "western" | "vedic";
type HouseSystem =
  | "placidus" | "whole-sign" | "koch" | "equal"
  | "porphyry" | "regiomontanus" | "campanus";
type Ayanamsa = "lahiri" | "raman" | "krishnamurti" | "fagan-bradley";

const HOUSE_SYSTEMS: { value: HouseSystem; label: string }[] = [
  { value: "placidus", label: "Placidus" },
  { value: "whole-sign", label: "Whole Sign" },
  { value: "koch", label: "Koch" },
  { value: "equal", label: "Equal" },
  { value: "porphyry", label: "Porphyry" },
  { value: "regiomontanus", label: "Regiomontanus" },
  { value: "campanus", label: "Campanus" },
];

const AYANAMSAS: { value: Ayanamsa; label: string }[] = [
  { value: "lahiri", label: "Lahiri (default)" },
  { value: "raman", label: "Raman" },
  { value: "krishnamurti", label: "Krishnamurti" },
  { value: "fagan-bradley", label: "Fagan–Bradley" },
];

interface ChartResponse {
  chart: ChartResult;
  resolved: ResolvedInstant;
  meta: { name: string | null; placeLabel: string; localDate: string; localTime: string | null };
}

interface BirthForm {
  name: string;
  date: string;
  time: string;
  timeKnown: boolean;
  place: PlaceResult | null;
}

export function StudioClient() {
  const [form, setForm] = useState<BirthForm>({
    name: "",
    date: "",
    time: "",
    timeKnown: true,
    place: null,
  });
  const [system, setSystem] = useState<System>("western");
  const [houseWestern, setHouseWestern] = useState<HouseSystem>("placidus");
  const [houseVedic, setHouseVedic] = useState<HouseSystem>("whole-sign");
  const [ayanamsa, setAyanamsa] = useState<Ayanamsa>("lahiri");

  const [result, setResult] = useState<ChartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  // ——— Place autocomplete ———
  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [placeOpen, setPlaceOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onPlaceInput = (q: string) => {
    setPlaceQuery(q);
    setForm((f) => ({ ...f, place: null }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setPlaceResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        setPlaceResults(data.results ?? []);
        setPlaceOpen(true);
      } catch {
        setPlaceResults([]);
      }
    }, 300);
  };

  const compute = useCallback(
    async (sys: System, opts?: { houseSystem?: HouseSystem; ayanamsa?: Ayanamsa }) => {
      if (!form.date || !form.place || (form.timeKnown && !form.time)) {
        setError("Please provide a birth date, time (or mark it unknown) and place.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/chart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name || undefined,
            date: form.date,
            time: form.timeKnown ? form.time : "12:00",
            timeKnown: form.timeKnown,
            place: {
              label: form.place.label,
              latitude: form.place.latitude,
              longitude: form.place.longitude,
              timezone: form.place.timezone,
            },
            system: sys,
            houseSystem:
              opts?.houseSystem ?? (sys === "western" ? houseWestern : houseVedic),
            ayanamsa: sys === "vedic" ? opts?.ayanamsa ?? ayanamsa : undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Chart computation failed.");
        setResult(data as ChartResponse);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    },
    [form, houseWestern, houseVedic, ayanamsa]
  );

  const switchSystem = (sys: System) => {
    setSystem(sys);
    if (result) void compute(sys);
  };

  // ——— Export & share ———
  const downloadImage = async () => {
    const svg = wheelRef.current?.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("render failed"));
      img.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1200;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#060917";
    ctx.fillRect(0, 0, 1200, 1200);
    ctx.drawImage(img, 0, 0, 1200, 1200);
    URL.revokeObjectURL(url);
    const png = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = png;
    a.download = `${(form.name || "natal-chart").toLowerCase().replace(/\s+/g, "-")}-${system}.png`;
    a.click();
  };

  const [copied, setCopied] = useState(false);
  const copySummary = async () => {
    if (!result) return;
    const c = result.chart;
    const lines = [
      `✦ House of Alexxann — ${system === "western" ? "Western (tropical)" : "Vedic (sidereal)"} natal chart`,
      [
        result.meta.name,
        result.meta.localDate,
        result.meta.localTime ?? "time unknown",
        result.meta.placeLabel,
      ]
        .filter(Boolean)
        .join(" · "),
      "",
      ...c.planets.map(
        (p) =>
          `${PLANET_GLYPHS[p.body]} ${p.body[0].toUpperCase() + p.body.slice(1)}: ${p.formatted} ${SIGN_NAMES[p.sign]}${p.retrograde ? " ℞" : ""}${p.house ? ` (house ${p.house})` : ""}`
      ),
      ...(c.angles
        ? [
            `Ascendant: ${c.angles.formattedAscendant} ${SIGN_NAMES[c.angles.ascendantSign]}`,
            `Midheaven: ${c.angles.formattedMidheaven} ${SIGN_NAMES[c.angles.midheavenSign]}`,
          ]
        : []),
      "",
      "Cast your own free chart → https://houseofalexxann.com/studio",
    ];
    await navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  const chart = result?.chart ?? null;
  const vedic = chart?.input.system === "vedic";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6">
      <header className="mb-10 text-center">
        <h1 className="text-4xl text-moon-100 sm:text-5xl">Chart Studio</h1>
        <p className="mx-auto mt-3 max-w-xl text-moon-400">
          Cast a natal chart with professional-grade precision — Western or
          Vedic, free. Exact time and place give the truest chart.
        </p>
      </header>

      {/* ——— Birth data form ——— */}
      <form
        className="card mx-auto max-w-3xl p-6"
        onSubmit={(e) => {
          e.preventDefault();
          void compute(system);
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-moon-300">Name (optional)</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Whose sky is this?"
              className="w-full rounded-lg border border-night-500 bg-night-900 px-3 py-2 text-moon-100 placeholder:text-moon-500 focus:border-gold-400 focus:outline-none"
            />
          </label>
          <label className="relative block text-sm">
            <span className="mb-1 block text-moon-300">Birthplace</span>
            <input
              type="text"
              required
              value={form.place ? form.place.label : placeQuery}
              onChange={(e) => onPlaceInput(e.target.value)}
              onFocus={() => placeResults.length && setPlaceOpen(true)}
              onBlur={() => setTimeout(() => setPlaceOpen(false), 150)}
              placeholder="City of birth…"
              autoComplete="off"
              className="w-full rounded-lg border border-night-500 bg-night-900 px-3 py-2 text-moon-100 placeholder:text-moon-500 focus:border-gold-400 focus:outline-none"
            />
            {placeOpen && placeResults.length > 0 && (
              <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-night-500 bg-night-800 shadow-xl">
                {placeResults.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm text-moon-200 hover:bg-night-700"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setForm((f) => ({ ...f, place: p }));
                        setPlaceQuery(p.label);
                        setPlaceOpen(false);
                      }}
                    >
                      {p.label}
                      <span className="ml-2 text-xs text-moon-500">{p.timezone}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-moon-300">Birth date</span>
            <input
              type="date"
              required
              value={form.date}
              min="1800-01-01"
              max="2099-12-31"
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full rounded-lg border border-night-500 bg-night-900 px-3 py-2 text-moon-100 focus:border-gold-400 focus:outline-none"
            />
          </label>
          <div className="text-sm">
            <span className="mb-1 block text-moon-300">Birth time</span>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={form.time}
                required={form.timeKnown}
                disabled={!form.timeKnown}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className="w-full rounded-lg border border-night-500 bg-night-900 px-3 py-2 text-moon-100 focus:border-gold-400 focus:outline-none disabled:opacity-40"
              />
              <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs text-moon-400">
                <input
                  type="checkbox"
                  checked={!form.timeKnown}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, timeKnown: !e.target.checked }))
                  }
                  className="accent-[#cfa84e]"
                />
                Time unknown
              </label>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="submit" disabled={loading} className="btn-gold disabled:opacity-60">
            {loading ? "Casting…" : "✦ Cast the chart"}
          </button>
          {error && <p className="text-sm text-rose-300">{error}</p>}
        </div>
      </form>

      {/* ——— Results ——— */}
      {chart && result && (
        <div className="mt-14">
          {/* System toggle + settings */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex overflow-hidden rounded-full border border-night-500">
              {(["western", "vedic"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => switchSystem(s)}
                  className={`px-5 py-2 text-sm font-medium transition-colors ${
                    system === s
                      ? "bg-gold-400 text-night-950"
                      : "bg-night-900/60 text-moon-300 hover:text-moon-100"
                  }`}
                >
                  {s === "western" ? "Western · tropical" : "Vedic · sidereal"}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-moon-400">
              Houses
              <select
                value={system === "western" ? houseWestern : houseVedic}
                onChange={(e) => {
                  const hs = e.target.value as HouseSystem;
                  if (system === "western") setHouseWestern(hs);
                  else setHouseVedic(hs);
                  void compute(system, { houseSystem: hs });
                }}
                className="rounded-lg border border-night-500 bg-night-900 px-2 py-1.5 text-sm text-moon-100"
              >
                {HOUSE_SYSTEMS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </label>
            {system === "vedic" && (
              <label className="flex items-center gap-2 text-xs text-moon-400">
                Ayanamsa
                <select
                  value={ayanamsa}
                  onChange={(e) => {
                    const ay = e.target.value as Ayanamsa;
                    setAyanamsa(ay);
                    void compute(system, { ayanamsa: ay });
                  }}
                  className="rounded-lg border border-night-500 bg-night-900 px-2 py-1.5 text-sm text-moon-100"
                >
                  {AYANAMSAS.map((a) => (
                    <option key={a.value} value={a.value}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {/* Chart header */}
          <div className="mt-8 text-center">
            <h2 className="text-3xl text-moon-100">
              {result.meta.name || "Natal chart"}
            </h2>
            <p className="mt-1 text-sm text-moon-400">
              {result.meta.localDate}
              {result.meta.localTime ? ` · ${result.meta.localTime}` : " · time unknown"}
              {" · "}
              {result.meta.placeLabel}
            </p>
            <p className="mt-0.5 text-xs text-moon-500">
              UTC {result.resolved.utc.replace("T", " ").replace("Z", "")} ·{" "}
              {vedic
                ? `sidereal (${AYANAMSAS.find((a) => a.value === ayanamsa)?.label.replace(" (default)", "")}, ayanamsa ${chart.ayanamsaValue?.toFixed(2)}°)`
                : "tropical"}
              {" · "}
              {HOUSE_SYSTEMS.find(
                (h) => h.value === (system === "western" ? houseWestern : houseVedic)
              )?.label}{" "}
              houses
            </p>
            {result.resolved.warnings.map((w, i) => (
              <p key={i} className="mx-auto mt-3 max-w-xl rounded-lg border border-gold-600/40 bg-gold-500/10 px-4 py-2 text-xs text-gold-300">
                {w}
              </p>
            ))}
          </div>

          {/* Wheel + data */}
          <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <div ref={wheelRef} className="card p-4 sm:p-6">
                <ChartWheel chart={chart} />
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={downloadImage} className="btn-ghost text-sm">
                  ⬇ Save chart image
                </button>
                <button type="button" onClick={copySummary} className="btn-ghost text-sm">
                  {copied ? "✓ Copied" : "⧉ Copy shareable summary"}
                </button>
              </div>
            </div>

            <div className="space-y-8">
              <section className="card p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-moon-500">
                  Positions
                </h3>
                <PlanetTable chart={chart} />
              </section>
              {chart.houseCusps && (
                <section className="card p-5">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-moon-500">
                    House cusps
                  </h3>
                  <HouseCuspTable chart={chart} />
                </section>
              )}
              <section className="card p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-moon-500">
                  Aspects
                </h3>
                <AspectTable chart={chart} />
              </section>
            </div>
          </div>

          {/* Vedic extras: D1 + D9 + dasha */}
          {vedic && chart.navamsa && (
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              <section className="card p-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-moon-500">
                  Rasi — D1
                </h3>
                <RasiGrid
                  title="Rasi"
                  entries={[
                    ...(chart.angles
                      ? [{ body: "ascendant" as const, sign: chart.angles.ascendantSign }]
                      : []),
                    ...chart.planets.map((p) => ({ body: p.body, sign: p.sign })),
                  ]}
                />
              </section>
              <section className="card p-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-moon-500">
                  Navamsa — D9
                </h3>
                <RasiGrid title="Navamsa" entries={chart.navamsa} />
              </section>
            </div>
          )}
          {vedic && chart.vimshottari && (
            <section className="card mt-8 p-6">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-moon-500">
                Vimshottari dasha — the chapters of time
              </h3>
              <DashaTimeline dasha={chart.vimshottari} />
            </section>
          )}

          {/* Interpretations */}
          <section className="card mt-12 p-6 sm:p-8">
            <h2 className="font-heading text-2xl text-moon-100">Your reading</h2>
            <p className="mb-6 mt-1 text-sm text-moon-400">
              Baseline interpretations, written by the House. A live reading
              goes much deeper —{" "}
              <Link href="/services" className="text-gold-400 underline-offset-2 hover:underline">
                book time with Alexandria
              </Link>
              .
            </p>
            <InterpretationsPanel chart={chart} />
          </section>
        </div>
      )}
    </div>
  );
}
