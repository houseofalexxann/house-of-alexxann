"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { DateTime } from "luxon";
// Type-only: the engine carries the native ephemeris binding and must never
// reach the browser bundle.
import type {
  ChartResult,
  FixedStarPosition,
  PlanetPosition,
  StarConjunction,
  TransitAspect,
} from "@hoa/engine";
import type { PlaceResult, ResolvedInstant } from "@/lib/geocode";
import { ChartWheel } from "@/components/chart/ChartWheel";
import { AspectTable, HouseCuspTable, PlanetTable } from "@/components/chart/DataTable";
import { DashaTimeline } from "@/components/chart/DashaTimeline";
import { RasiGrid, type GridEntry } from "@/components/chart/RasiGrid";
import { NorthIndianChart } from "@/components/chart/NorthIndianChart";
import { InterpretationsPanel } from "@/components/chart/Interpretations";
import { TraditionalPanel } from "@/components/chart/TraditionalPanel";
import { PremiumGate } from "@/components/PremiumGate";
import { useUser } from "@/components/UserProvider";
import { PLANET_GLYPHS, SIGN_NAMES } from "@/components/chart/glyphs";
import { ChartKey } from "@/components/chart/ChartKey";
import { ALL_EXTRAS, EXTRA_KEY, GRAHA_ABBR, PLANET_KEY } from "@/lib/chart-key";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";
import { formatMembershipPrice } from "@/lib/membership";
import { AsteroidTable, FixedStarTable, TransitTable } from "@/components/chart/ExtrasTables";

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

/** "1990-06-15" → "June 15, 1990"; anything unparseable passes through. */
function prettyDate(iso: string): string {
  const d = DateTime.fromISO(iso);
  return d.isValid ? d.toFormat("LLLL d, yyyy") : iso;
}

/** "14:30" → "2:30 PM". */
function prettyTime(hhmm: string): string {
  const t = DateTime.fromFormat(hhmm, "HH:mm");
  return t.isValid ? t.toFormat("h:mm a") : hhmm;
}

interface ChartResponse {
  chart: ChartResult;
  resolved: ResolvedInstant;
  meta: { name: string | null; placeLabel: string; localDate: string; localTime: string | null };
  fixedStars: { stars: FixedStarPosition[]; conjunctions: StarConjunction[] } | null;
  transits: {
    utc: string;
    localDate: string;
    localTime: string;
    localUsed: string;
    warnings: string[];
    planets: PlanetPosition[];
    aspects: TransitAspect[];
  } | null;
}

/** Western additions a member can lay over the wheel. */
interface Additions {
  asteroids: boolean;
  stars: boolean;
  transit: { date: string; time: string } | null;
}
const NO_ADDITIONS: Additions = { asteroids: false, stars: false, transit: null };

interface BirthForm {
  name: string;
  date: string;
  time: string;
  timeKnown: boolean;
  place: PlaceResult | null;
}

export function StudioClient({ initialSystem = "western", locked = false }: { initialSystem?: System; locked?: boolean } = {}) {
  const [form, setForm] = useState<BirthForm>({
    name: "",
    date: "",
    time: "",
    timeKnown: true,
    place: null,
  });
  const [system, setSystem] = useState<System>(initialSystem);
  const [houseWestern, setHouseWestern] = useState<HouseSystem>("placidus");
  const [houseVedic, setHouseVedic] = useState<HouseSystem>("whole-sign");
  const [ayanamsa, setAyanamsa] = useState<Ayanamsa>("lahiri");
  // Vedic chart presentation: the traditional North Indian diamond leads;
  // South Indian grid and the Western-style wheel are offered alongside.
  const [vedicStyle, setVedicStyle] = useState<"north" | "south" | "wheel">("north");
  // Jyotish charts label grahas Su Mo Ma by tradition; glyphs are offered too.
  const [vedicLabels, setVedicLabels] = useState<"abbr" | "glyph">("abbr");
  // Western additions (members only): asteroids, fixed stars, a transit overlay.
  const [additions, setAdditions] = useState<Additions>(NO_ADDITIONS);

  const { user, membershipPriceCents } = useUser();
  const member = Boolean(user && (user.isMember || user.role === "admin"));
  const [result, setResult] = useState<ChartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();

  // After a fresh cast, bring the chart into view in one motion, so nobody
  // hunts for it. Only when motion is known to be welcome; otherwise a jump.
  const revealResult = useCallback(() => {
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: reduced === false ? "smooth" : "auto", block: "start" });
    });
  }, [reduced]);
  // Recasts can overlap (a quick pair of toggles); only the latest may land.
  const castSeq = useRef(0);

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
    async (
      sys: System,
      opts?: { houseSystem?: HouseSystem; ayanamsa?: Ayanamsa; additions?: Additions; reveal?: boolean }
    ) => {
      if (!form.date || !form.place || (form.timeKnown && !form.time)) {
        setError("Please provide a birth date, time (or mark it unknown) and place.");
        return;
      }
      const seq = ++castSeq.current;
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
            ...(sys === "western" && member
              ? (() => {
                  const add = opts?.additions ?? additions;
                  return {
                    extras: add.asteroids ? ALL_EXTRAS : undefined,
                    fixedStars: add.stars || undefined,
                    // Half-filled transit inputs are simply not sent.
                    transit: add.transit && add.transit.date && add.transit.time ? add.transit : undefined,
                  };
                })()
              : {}),
          }),
        });
        const data = await res.json();
        if (seq !== castSeq.current) return; // a newer cast has superseded this one
        if (!res.ok) throw new Error(data.error ?? "Chart computation failed.");
        setResult(data as ChartResponse);
        if (opts?.reveal) revealResult();
        // Carry-through rule: signed-in casts save your birth details so
        // every tab (Vedic, Human Design, booking) prefills from them.
        if (user && form.place) {
          void fetch("/api/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: form.name || user.name || "My chart",
              birthDate: form.date,
              birthTime: form.timeKnown ? form.time : null,
              placeLabel: form.place.label,
              latitude: form.place.latitude,
              longitude: form.place.longitude,
              timezone: form.place.timezone,
            }),
          });
        }
      } catch (e) {
        if (seq === castSeq.current) setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        if (seq === castSeq.current) setLoading(false);
      }
    },
    [form, houseWestern, houseVedic, ayanamsa, user, revealResult, additions, member]
  );

  // Toggling an addition recasts the chart immediately when one is on screen.
  const updateAdditions = (patch: Partial<Additions>) => {
    const next = { ...additions, ...patch };
    setAdditions(next);
    if (result && system === "western") void compute("western", { additions: next });
  };
  const defaultTransit = () => {
    const now = DateTime.now().setZone(form.place?.timezone || "local");
    return { date: now.toFormat("yyyy-LL-dd"), time: now.toFormat("HH:mm") };
  };

  const switchSystem = (sys: System) => {
    setSystem(sys);
    if (result) void compute(sys);
  };

  // ——— Export & share ———
  // The saved image is a finished card: title, birth data, the chart at full
  // size, a key to every glyph on it, and the House's mark. Nothing is
  // cropped, because the chart's own viewBox already holds every label.
  const downloadImage = async () => {
    const svg = wheelRef.current?.querySelector("svg");
    if (!svg || !result) return;
    const isVedic = system === "vedic";
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const xml = new XMLSerializer().serializeToString(clone);
    const blob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("render failed"));
      img.src = url;
    });

    const useAbbr = isVedic && vedicStyle !== "wheel" && vedicLabels === "abbr";
    const keyRows: { mark: string; name: string }[] = [
      ...PLANET_KEY.filter((p) => (isVedic ? !p.westernOnly : !p.vedicOnly)).map((p) => ({
        mark: useAbbr ? GRAHA_ABBR[p.body] : p.glyph,
        name: isVedic && p.sanskrit ? `${p.sanskrit} (${p.name})` : p.name,
      })),
      ...(!isVedic && result.chart.extras
        ? result.chart.extras.map((e) => {
            const k = EXTRA_KEY.find((x) => x.body === e.body);
            return { mark: k?.glyph ?? "", name: k?.name ?? e.body };
          })
        : []),
    ];
    const subtitle = [
      [
        prettyDate(result.meta.localDate),
        result.meta.localTime ? prettyTime(result.meta.localTime) : "time unknown",
        result.meta.placeLabel,
      ].join("  ·  "),
    ];
    const W = 1400;
    const chartSize = 1200;
    const perRow = isVedic ? 5 : 6;
    const keyLines = Math.ceil(keyRows.length / perRow);
    const subtitleLines = result.transits ? 3 : 2;
    const top = 100 + subtitleLines * 28 + 22;
    const keyTop = top + chartSize + 40;
    const H = keyTop + 30 + keyLines * 54 + 64;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d")!;
    const ink = "#3b3345";
    const soft = "#7d6a8a";
    const rose = "#d4638f";
    const serif = "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
    const sans = "'Inter', 'Helvetica Neue', Arial, sans-serif";
    const glyphFont = "'Apple Symbols', 'Segoe UI Symbol', 'Noto Sans Symbols2', serif";

    ctx.fillStyle = "#fdfbfa";
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = ink;
    ctx.font = `500 46px ${serif}`;
    ctx.fillText(result.meta.name || "Natal chart", W / 2, 62);
    ctx.fillStyle = soft;
    ctx.font = `20px ${sans}`;
    const houseLabel =
      HOUSE_SYSTEMS.find((h) => h.value === (isVedic ? houseVedic : houseWestern))?.label ?? "";
    const systemLabel = isVedic
      ? `Vedic · sidereal (${AYANAMSAS.find((a) => a.value === ayanamsa)?.label.replace(" (default)", "") ?? "Lahiri"})`
      : "Western · tropical";
    subtitle.push(`${systemLabel}  ·  ${houseLabel} houses`);
    if (result.transits) {
      subtitle.push(
        `Transits for ${prettyDate(result.transits.localDate)}  ·  ${prettyTime(result.transits.localTime)}  (outer ring)`
      );
    }
    subtitle.forEach((line, i) => ctx.fillText(line, W / 2, 100 + i * 28));

    ctx.drawImage(img, (W - chartSize) / 2, top, chartSize, chartSize);
    URL.revokeObjectURL(url);

    // Key rows: every body drawn on this chart, with its name.
    const cell = (W - 160) / perRow;
    keyRows.forEach((row, i) => {
      const cx = 80 + cell * (i % perRow) + cell / 2;
      const cy = keyTop + 30 + Math.floor(i / perRow) * 54;
      ctx.fillStyle = rose;
      ctx.font = useAbbr ? `600 22px ${sans}` : `30px ${glyphFont}`;
      ctx.textAlign = "right";
      ctx.fillText(row.mark, cx - 8, cy);
      ctx.fillStyle = ink;
      ctx.font = `19px ${sans}`;
      ctx.textAlign = "left";
      ctx.fillText(row.name, cx + 4, cy);
    });

    ctx.textAlign = "center";
    ctx.fillStyle = rose;
    ctx.font = `500 22px ${serif}`;
    ctx.fillText("✦  House of Alexxann  ·  houseofalexxann.com", W / 2, H - 40);

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
      `✦ House of Alexxann · ${system === "western" ? "Western (tropical)" : "Vedic (sidereal)"} natal chart`,
      [
        result.meta.name,
        prettyDate(result.meta.localDate),
        result.meta.localTime ? prettyTime(result.meta.localTime) : "time unknown",
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

  // Prefill from query params (?name=&date=&time=&place=) — used by the admin
  // "cast this client's chart" links — and auto-cast when complete.
  const prefilledRef = useRef(false);
  useEffect(() => {
    if (prefilledRef.current) return;
    const q = new URLSearchParams(window.location.search);
    let date = q.get("date");
    let place = q.get("place");
    let time = q.get("time");
    let name = q.get("name");
    // Carry-through: fall back to the signed-in member's saved details.
    if ((!date || !place) && user?.profile) {
      date = user.profile.birthDate;
      place = user.profile.placeLabel;
      time = user.profile.birthTime;
      name = user.profile.name;
    }
    if (!date || !place) return;
    prefilledRef.current = true;
    (async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(place)}`);
        const data = await res.json();
        const first = (data.results ?? [])[0];
        if (!first) return;
        const nextForm = {
          name: name ?? "",
          date,
          time: time ?? "",
          timeKnown: Boolean(time),
          place: first as PlaceResult,
        };
        setForm(nextForm);
        setPlaceQuery(first.label);
        // Compute directly with the prefilled data (state isn't set yet).
        setLoading(true);
        const chartRes = await fetch("/api/chart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nextForm.name || undefined,
            date: nextForm.date,
            time: nextForm.timeKnown ? nextForm.time : "12:00",
            timeKnown: nextForm.timeKnown,
            place: {
              label: first.label,
              latitude: first.latitude,
              longitude: first.longitude,
              timezone: first.timezone,
            },
            system: initialSystem,
          }),
        });
        const chartData = await chartRes.json();
        if (chartRes.ok) {
          setResult(chartData as ChartResponse);
          revealResult();
        }
      } catch {
        // Prefill is best-effort; the form remains usable.
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const chart = result?.chart ?? null;
  const vedic = chart?.input.system === "vedic";

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6">
      <header className="mb-10 text-center">
        <h1 className="text-4xl text-ink-900 sm:text-5xl">Chart Studio</h1>
        <p className="mx-auto mt-3 max-w-xl text-ink-500">
          Cast a natal chart with professional-grade precision, Western or
          Vedic, free. Exact time and place give the truest chart.
        </p>
      </header>

      {/* ——— Birth data form ——— */}
      <form
        className="card mx-auto max-w-3xl p-6"
        onSubmit={(e) => {
          e.preventDefault();
          void compute(system, { reveal: true });
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-ink-700">Name (optional)</span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Whose sky is this?"
              className="w-full rounded-lg border border-pearl-500 bg-pearl-100 px-3 py-2 text-ink-900 placeholder:text-ink-400 focus:border-rose-600 focus:outline-none"
            />
          </label>
          <label className="relative block text-sm">
            <span className="mb-1 block text-ink-700">Birthplace</span>
            <input
              type="text"
              required
              value={form.place ? form.place.label : placeQuery}
              onChange={(e) => onPlaceInput(e.target.value)}
              onFocus={() => placeResults.length && setPlaceOpen(true)}
              onBlur={() => setTimeout(() => setPlaceOpen(false), 150)}
              placeholder="City of birth…"
              autoComplete="off"
              className="w-full rounded-lg border border-pearl-500 bg-pearl-100 px-3 py-2 text-ink-900 placeholder:text-ink-400 focus:border-rose-600 focus:outline-none"
            />
            {placeOpen && placeResults.length > 0 && (
              <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-pearl-500 bg-pearl-200 shadow-xl">
                {placeResults.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm text-ink-800 hover:bg-pearl-300"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setForm((f) => ({ ...f, place: p }));
                        setPlaceQuery(p.label);
                        setPlaceOpen(false);
                      }}
                    >
                      {p.label}
                      <span className="ml-2 text-xs text-ink-400">{p.timezone}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink-700">Birth date</span>
            <input
              type="date"
              required
              value={form.date}
              min="1800-01-01"
              max="2099-12-31"
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full rounded-lg border border-pearl-500 bg-pearl-100 px-3 py-2 text-ink-900 focus:border-rose-600 focus:outline-none"
            />
          </label>
          <div className="text-sm">
            <span className="mb-1 block text-ink-700">Birth time</span>
            <div className="flex items-center gap-3">
              <input
                type="time"
                value={form.time}
                required={form.timeKnown}
                disabled={!form.timeKnown}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className="w-full rounded-lg border border-pearl-500 bg-pearl-100 px-3 py-2 text-ink-900 focus:border-rose-600 focus:outline-none disabled:opacity-40"
              />
              <label className="flex shrink-0 cursor-pointer items-center gap-2 text-xs text-ink-500">
                <input
                  type="checkbox"
                  checked={!form.timeKnown}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, timeKnown: !e.target.checked }))
                  }
                  className="accent-[#d4638f]"
                />
                Time unknown
              </label>
            </div>
          </div>
        </div>

        {system === "western" && (
          <fieldset className="mt-5 rounded-xl border border-pearl-300/70 bg-pearl-200/30 px-4 pb-4 pt-2">
            <legend className="px-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-400">
              Add to the wheel
            </legend>
            {member ? (
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-ink-700">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-[#d4638f]"
                    checked={additions.asteroids}
                    onChange={(e) => updateAdditions({ asteroids: e.target.checked })}
                  />
                  Asteroids &amp; Chiron
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-[#d4638f]"
                    checked={additions.stars}
                    onChange={(e) => updateAdditions({ stars: e.target.checked })}
                  />
                  Fixed stars
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    className="accent-[#d4638f]"
                    checked={additions.transit !== null}
                    onChange={(e) => updateAdditions({ transit: e.target.checked ? defaultTransit() : null })}
                  />
                  Transits
                </label>
                {additions.transit && (
                  <span className="flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      aria-label="Transit date"
                      value={additions.transit.date}
                      min="1800-01-01"
                      max="2099-12-31"
                      onChange={(e) =>
                        updateAdditions({ transit: { ...additions.transit!, date: e.target.value } })
                      }
                      className="rounded-lg border border-pearl-500 bg-pearl-100 px-2 py-1 text-xs text-ink-900"
                    />
                    <input
                      type="time"
                      aria-label="Transit time"
                      value={additions.transit.time}
                      onChange={(e) =>
                        updateAdditions({ transit: { ...additions.transit!, time: e.target.value } })
                      }
                      className="rounded-lg border border-pearl-500 bg-pearl-100 px-2 py-1 text-xs text-ink-900"
                    />
                    <span className="text-xs text-ink-400">
                      {form.place?.timezone ? `${form.place.timezone.replace(/_/g, " ")} time` : "birthplace time"}
                    </span>
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-ink-500">
                Asteroids, fixed stars and a transit overlay are a Venusian Doll room,{" "}
                {formatMembershipPrice(membershipPriceCents)} a month.{" "}
                <Link href="/join" className="text-rose-600 hover:underline">
                  Become a Venusian Doll
                </Link>
                {!user && (
                  <>
                    {" "}
                    or{" "}
                    <Link href="/login" className="text-rose-600 hover:underline">
                      sign in
                    </Link>
                  </>
                )}
                .
              </p>
            )}
          </fieldset>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button type="submit" disabled={loading} className="btn-gold disabled:opacity-60">
            {loading ? "Casting…" : "✦ Cast the chart"}
          </button>
          {error && <p className="text-sm text-rose-300">{error}</p>}
        </div>
      </form>

      {/* ——— Results ——— */}
      {chart && result && (
        <div ref={resultRef} className="mt-14 scroll-mt-24">
          {/* System toggle + settings */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Sliding Western ⇄ Vedic switch (hidden on locked per-system tabs) */}
            {locked ? (
              <a
                href={system === "western" ? "/vedic" : "/western"}
                className="rounded-full border border-pearl-400 bg-pearl-200/70 px-4 py-2 text-sm text-ink-700 transition-colors hover:border-rose-400"
              >
                {system === "western"
                  ? "Looking for the sidereal sky? Visit the Vedic room →"
                  : "Looking for the tropical sky? Visit the Western room →"}
              </a>
            ) : (
            <div
              className="relative grid grid-cols-2 overflow-hidden rounded-full border border-pearl-400 bg-pearl-100/70 p-1"
              role="tablist"
              aria-label="Chart system"
            >
              <span
                aria-hidden
                className="absolute bottom-1 top-1 w-[calc(50%-4px)] rounded-full shadow-md transition-transform duration-300 ease-out"
                style={{
                  left: 4,
                  transform: system === "vedic" ? "translateX(calc(100% + 0px))" : "translateX(0)",
                  background:
                    system === "vedic"
                      ? "linear-gradient(120deg, #d96d8b, #b98ac0)"
                      : "linear-gradient(120deg, #4fb4dd, #7d9de0)",
                }}
              />
              {(["western", "vedic"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={system === s}
                  onClick={() => switchSystem(s)}
                  className={`relative z-10 rounded-full px-5 py-2 text-sm font-medium transition-colors duration-300 ${
                    system === s ? "text-white" : "text-ink-700 hover:text-ink-900"
                  }`}
                >
                  {s === "western" ? "Western · tropical" : "Vedic · sidereal"}
                </button>
              ))}
            </div>
            )}
            <label className="flex items-center gap-2 text-xs text-ink-500">
              Houses
              <select
                value={system === "western" ? houseWestern : houseVedic}
                onChange={(e) => {
                  const hs = e.target.value as HouseSystem;
                  if (system === "western") setHouseWestern(hs);
                  else setHouseVedic(hs);
                  void compute(system, { houseSystem: hs });
                }}
                className="rounded-lg border border-pearl-500 bg-pearl-100 px-2 py-1.5 text-sm text-ink-900"
              >
                {HOUSE_SYSTEMS.map((h) => (
                  <option key={h.value} value={h.value}>
                    {h.label}
                  </option>
                ))}
              </select>
            </label>
            {system === "vedic" && (
              <label className="flex items-center gap-2 text-xs text-ink-500">
                Ayanamsa
                <select
                  value={ayanamsa}
                  onChange={(e) => {
                    const ay = e.target.value as Ayanamsa;
                    setAyanamsa(ay);
                    void compute(system, { ayanamsa: ay });
                  }}
                  className="rounded-lg border border-pearl-500 bg-pearl-100 px-2 py-1.5 text-sm text-ink-900"
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
            <h2 className="text-3xl text-ink-900">
              {result.meta.name || "Natal chart"}
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              {prettyDate(result.meta.localDate)}
              {result.meta.localTime ? ` · ${prettyTime(result.meta.localTime)}` : " · time unknown"}
              {" · "}
              {result.meta.placeLabel}
            </p>
            <p className="mt-0.5 text-xs text-ink-400">
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
              <p key={i} className="mx-auto mt-3 max-w-xl rounded-lg border border-rose-600/40 bg-rose-400/10 px-4 py-2 text-xs text-rose-500">
                {w}
              </p>
            ))}
          </div>

          {/* Jump links: the long page in one row */}
          <nav aria-label="Sections of this chart" className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
            {(
              [
                ["#wheel", vedic ? "Chart" : "Wheel"],
                ["#positions", "Positions"],
                ["#aspects", "Aspects"],
                ...(chart.extras?.length ? [["#asteroids", "Asteroids"]] : []),
                ...(result.fixedStars ? [["#stars", "Fixed stars"]] : []),
                ...(result.transits ? [["#transits", "Transits"]] : []),
                ["#reading-key", "Insights & key"],
                ["#deeper", "Deeper chart"],
                ...(vedic ? [["#dasha", "Dasha"]] : []),
                ["#reading", "Your reading"],
              ] as [string, string][]
            ).map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-full border border-pearl-400 bg-pearl-200/60 px-3 py-1.5 text-ink-700 transition-colors hover:border-rose-400 hover:text-ink-900"
              >
                {label}
              </a>
            ))}
          </nav>

          {/* Wheel + data */}
          <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              {vedic && (
                <div className="mb-3 flex flex-wrap justify-center gap-2">
                  {(
                    [
                      ["north", "North Indian ◇"],
                      ["south", "South Indian ⊞"],
                      ["wheel", "Wheel ◎"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setVedicStyle(key)}
                      aria-pressed={vedicStyle === key}
                      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                        vedicStyle === key
                          ? "border-rose-500 bg-rose-300/30 text-rose-600"
                          : "border-pearl-400 bg-pearl-200/70 text-ink-500 hover:border-rose-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                  {vedicStyle !== "wheel" && (
                    <>
                      <span aria-hidden className="mx-1 self-center text-pearl-500">·</span>
                      {(
                        [
                          ["abbr", "Su Mo Ma"],
                          ["glyph", "☉︎ ☽︎ ♂︎"],
                        ] as const
                      ).map(([key, label]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setVedicLabels(key)}
                          aria-pressed={vedicLabels === key}
                          title={key === "abbr" ? "Traditional abbreviations" : "Glyphs"}
                          className={`astro-glyph rounded-full border px-3 py-1 text-xs transition-colors ${
                            vedicLabels === key
                              ? "border-rose-500 bg-rose-300/30 text-rose-600"
                              : "border-pearl-400 bg-pearl-200/70 text-ink-500 hover:border-rose-400"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
              <div id="wheel" ref={wheelRef} className="plate scroll-mt-28 p-4 sm:p-6">
                {vedic && vedicStyle !== "wheel" ? (
                  (() => {
                    const rasiEntries: GridEntry[] = [
                      ...(chart.angles
                        ? [
                            {
                              body: "ascendant" as const,
                              sign: chart.angles.ascendantSign,
                              degree: chart.angles.ascendant % 30,
                            },
                          ]
                        : []),
                      ...chart.planets.map((p) => ({
                        body: p.body,
                        sign: p.sign,
                        degree: p.degreeInSign,
                        retrograde: p.retrograde,
                      })),
                    ];
                    return vedicStyle === "north" ? (
                      <NorthIndianChart title="Rasi · D1" entries={rasiEntries} labels={vedicLabels} />
                    ) : (
                      <RasiGrid title="Rasi · D1" entries={rasiEntries} labels={vedicLabels} />
                    );
                  })()
                ) : (
                  <ChartWheel
                    chart={chart}
                    transits={result.transits?.planets ?? null}
                    starHits={
                      result.fixedStars
                        ? [
                            ...new Map(
                              result.fixedStars.conjunctions.map((c) => [
                                c.star,
                                { name: c.star, longitude: c.starLongitude },
                              ])
                            ).values(),
                          ]
                        : null
                    }
                  />
                )}
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <button type="button" onClick={downloadImage} className="btn-ghost text-sm">
                  ⬇ Save chart image
                </button>
                <button type="button" onClick={copySummary} className="btn-ghost text-sm">
                  {copied ? "✓ Copied" : "⧉ Copy shareable summary"}
                </button>
              </div>
              <div id="reading-key" className="scroll-mt-28">
                <ChartKey
                  system={vedic ? "vedic" : "western"}
                  chart={chart}
                  transits={Boolean(result.transits)}
                  stars={Boolean(result.fixedStars)}
                />
              </div>
            </div>

            <div className="space-y-8">
              <section id="positions" className="card scroll-mt-28 p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
                  Positions
                </h3>
                <PlanetTable chart={chart} />
              </section>
              {chart.houseCusps && (
                <section className="card p-5">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
                    House cusps
                  </h3>
                  <HouseCuspTable chart={chart} />
                </section>
              )}
              <section id="aspects" className="card scroll-mt-28 p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
                  Aspects
                </h3>
                <AspectTable chart={chart} />
              </section>
              {chart.extras && chart.extras.length > 0 && (
                <section id="asteroids" className="card scroll-mt-28 p-5">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
                    Asteroids &amp; points
                  </h3>
                  <AsteroidTable extras={chart.extras} unavailable={chart.extrasUnavailable ?? []} />
                </section>
              )}
              {result.fixedStars && (
                <section id="stars" className="card scroll-mt-28 p-5">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
                    Fixed stars
                  </h3>
                  <FixedStarTable
                    conjunctions={result.fixedStars.conjunctions}
                    stars={result.fixedStars.stars}
                  />
                </section>
              )}
              {result.transits && (
                <section id="transits" className="card scroll-mt-28 p-5">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
                    Transits
                  </h3>
                  <TransitTable
                    planets={result.transits.planets}
                    aspects={result.transits.aspects}
                    when={`${prettyDate(result.transits.localDate)} · ${prettyTime(result.transits.localTime)}`}
                    warnings={result.transits.warnings ?? []}
                  />
                </section>
              )}
            </div>
          </div>

          {/* Traditional depth: premium — basic charts stay minimal */}
          <section id="deeper" className="card mt-8 scroll-mt-28 p-6 sm:p-8">
            <h2 className="font-heading text-2xl text-ink-900">The deeper chart</h2>
            <p className="mb-6 mt-1 text-sm text-ink-500">
              The traditional layer: sect, essential dignity, your natal moon
              phase, decans &amp; bounds, lots and zodiacal releasing.
            </p>
            <PremiumGate title="The deeper chart is a members' room">
              <TraditionalPanel chart={chart} />
            </PremiumGate>
          </section>

          {/* Vedic extras: D9 (D1 leads above in the chosen style) + dasha */}
          {vedic && chart.navamsa && (
            <div className="mt-12 grid gap-8 md:grid-cols-2">
              {vedicStyle === "wheel" && (
                <section className="plate p-6">
                  <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-ink-500">
                    Rasi · D1
                  </h3>
                  <NorthIndianChart
                    title="Rasi"
                    labels={vedicLabels}
                    entries={[
                      ...(chart.angles
                        ? [
                            {
                              body: "ascendant" as const,
                              sign: chart.angles.ascendantSign,
                              degree: chart.angles.ascendant % 30,
                            },
                          ]
                        : []),
                      ...chart.planets.map((p) => ({
                        body: p.body,
                        sign: p.sign,
                        degree: p.degreeInSign,
                        retrograde: p.retrograde,
                      })),
                    ]}
                  />
                </section>
              )}
              <section className="plate p-6">
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-ink-500">
                  Navamsa · D9
                </h3>
                {vedicStyle === "south" ? (
                  <RasiGrid title="Navamsa" entries={chart.navamsa} labels={vedicLabels} />
                ) : (
                  <NorthIndianChart title="Navamsa" entries={chart.navamsa} labels={vedicLabels} />
                )}
              </section>
            </div>
          )}
          {vedic && chart.vimshottari && (
            <section id="dasha" className="card mt-8 scroll-mt-28 p-6">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
                Vimshottari dasha: the chapters of time
              </h3>
              <DashaTimeline dasha={chart.vimshottari} />
            </section>
          )}

          {/* Interpretations */}
          <section id="reading" className="card mt-12 scroll-mt-28 p-6 sm:p-8">
            <h2 className="font-heading text-2xl text-ink-900">Your reading</h2>
            <p className="mb-6 mt-1 text-sm text-ink-500">
              Baseline interpretations, written by the House. A live reading
              goes much deeper.{" "}
              <Link href="/services" className="text-rose-600 underline-offset-2 hover:underline">
                Book time with Alexandria
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
