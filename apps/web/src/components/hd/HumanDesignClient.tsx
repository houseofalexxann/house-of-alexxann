"use client";

import { useRef, useState } from "react";
import type { PlaceResult } from "@/lib/geocode";
import { PremiumGate } from "@/components/PremiumGate";

interface Activation { body: string; gate: number; line: number }
interface HDResult {
  type: string; strategy: string; authority: string; profile: string;
  definition: string; definedCenters: string[]; openCenters: string[];
  activeChannels: [number, number][]; personality: Activation[]; design: Activation[];
}

/** Simplified bodygraph: nine centers, defined = filled in flag palette. */
const CENTERS: { key: string; label: string; x: number; y: number; shape: "tri" | "sq" | "dia"; flip?: boolean }[] = [
  { key: "head", label: "Head", x: 150, y: 30, shape: "tri" },
  { key: "ajna", label: "Ajna", x: 150, y: 95, shape: "tri", flip: true },
  { key: "throat", label: "Throat", x: 150, y: 165, shape: "sq" },
  { key: "g", label: "G · Self", x: 150, y: 245, shape: "dia" },
  { key: "ego", label: "Ego", x: 225, y: 235, shape: "tri" },
  { key: "sacral", label: "Sacral", x: 150, y: 330, shape: "sq" },
  { key: "solarPlexus", label: "Emotions", x: 245, y: 330, shape: "tri" },
  { key: "spleen", label: "Spleen", x: 55, y: 330, shape: "tri" },
  { key: "root", label: "Root", x: 150, y: 405, shape: "sq" },
];

function CenterShape({ c, defined }: { c: (typeof CENTERS)[number]; defined: boolean }) {
  const size = 26;
  const fill = defined ? (c.key === "sacral" || c.key === "root" ? "#d96d8b" : "#5bcefa") : "#ffffff";
  const stroke = defined ? "transparent" : "#b5a0ae";
  let shape;
  if (c.shape === "sq") shape = <rect x={c.x - size} y={c.y - size * 0.8} width={size * 2} height={size * 1.6} rx="6" fill={fill} stroke={stroke} strokeWidth="1.5" />;
  else if (c.shape === "dia") shape = <rect x={c.x - size * 0.9} y={c.y - size * 0.9} width={size * 1.8} height={size * 1.8} rx="5" transform={`rotate(45 ${c.x} ${c.y})`} fill={fill} stroke={stroke} strokeWidth="1.5" />;
  else {
    const h = size * 1.5;
    const pts = c.flip
      ? `${c.x - size},${c.y - h / 2} ${c.x + size},${c.y - h / 2} ${c.x},${c.y + h / 2}`
      : `${c.x - size},${c.y + h / 2} ${c.x + size},${c.y + h / 2} ${c.x},${c.y - h / 2}`;
    shape = <polygon points={pts} fill={fill} stroke={stroke} strokeWidth="1.5" rx="4" />;
  }
  return (
    <g>
      {shape}
      <text x={c.x} y={c.y + 48} textAnchor="middle" fontSize="10" fill="#877b93">{c.label}</text>
    </g>
  );
}

const inputCls =
  "w-full rounded-lg border border-pearl-400 bg-white/80 px-3 py-2 text-ink-900 placeholder:text-ink-400 focus:border-rose-400 focus:outline-none";

export function HumanDesignClient() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [place, setPlace] = useState<PlaceResult | null>(null);
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<HDResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onPlace = (q: string) => {
    setPlaceQuery(q);
    setPlace(null);
    if (debounce.current) clearTimeout(debounce.current);
    if (q.trim().length < 2) return setPlaceResults([]);
    debounce.current = setTimeout(async () => {
      const r = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`).then((x) => x.json()).catch(() => ({ results: [] }));
      setPlaceResults(r.results ?? []);
      setOpen(true);
    }, 300);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!place) return setError("Pick your birthplace from the list.");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/human-design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, time, timezone: place.timezone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Calculation failed.");
      setResult(data.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Calculation failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <form onSubmit={submit} className="card mx-auto max-w-2xl p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="mb-1 block text-ink-700">Birth date</span>
            <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink-700">Exact time</span>
            <input type="time" required value={time} onChange={(e) => setTime(e.target.value)} className={inputCls} />
          </label>
          <label className="relative block text-sm">
            <span className="mb-1 block text-ink-700">Birthplace</span>
            <input
              required
              value={place ? place.label : placeQuery}
              onChange={(e) => onPlace(e.target.value)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="City…"
              autoComplete="off"
              className={inputCls}
            />
            {open && placeResults.length > 0 && (
              <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-pearl-400 bg-white shadow-xl">
                {placeResults.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm text-ink-700 hover:bg-rose-300/20"
                      onMouseDown={(ev) => { ev.preventDefault(); setPlace(p); setPlaceQuery(p.label); setOpen(false); }}
                    >
                      {p.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </label>
        </div>
        <div className="mt-5 flex items-center gap-4">
          <button type="submit" disabled={busy} className="btn-gold disabled:opacity-60">
            {busy ? "Weaving the bodygraph…" : "✦ Calculate my design"}
          </button>
          {error && <p className="text-sm text-rose-600">{error}</p>}
        </div>
        <p className="mt-3 text-xs text-ink-400">
          Human Design needs the exact time — even a few minutes can move a line.
        </p>
      </form>

      {result && (
        <div className="mt-10">
          {/* Free layer: type, strategy, authority, profile */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(
              [
                ["Type", result.type],
                ["Strategy", result.strategy],
                ["Authority", result.authority],
                ["Profile", result.profile],
              ] as const
            ).map(([k, v]) => (
              <div key={k} className="card p-5 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-ink-400">{k}</p>
                <p className="mt-1 font-heading text-xl leading-snug text-ink-900">{v}</p>
              </div>
            ))}
          </div>

          {/* Members layer: bodygraph + gates + channels */}
          <div className="card mt-8 p-6 sm:p-8">
            <h2 className="font-heading text-2xl text-ink-900">The bodygraph</h2>
            <PremiumGate title="The full bodygraph is a members' room">
              <div className="grid items-start gap-8 md:grid-cols-2">
                <svg viewBox="0 0 300 460" role="img" aria-label="Human Design bodygraph" className="mx-auto w-full max-w-xs">
                  {CENTERS.map((c) => (
                    <CenterShape key={c.key} c={c} defined={result.definedCenters.includes(c.key)} />
                  ))}
                </svg>
                <div className="space-y-5 text-sm">
                  <p className="text-ink-700">
                    <strong className="text-ink-900">Definition:</strong> {result.definition}
                  </p>
                  <div>
                    <p className="font-semibold text-ink-900">Active channels</p>
                    <p className="mt-1 text-ink-700">
                      {result.activeChannels.length
                        ? result.activeChannels.map(([a, b]) => `${a}–${b}`).join(" · ")
                        : "None — a Reflector's open weave."}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">Personality gates (conscious)</p>
                    <p className="mt-1 text-ink-700">
                      {result.personality.map((a) => `${a.gate}.${a.line}`).join(" · ")}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink-900">Design gates (body, ~88 days before)</p>
                    <p className="mt-1 text-ink-700">
                      {result.design.map((a) => `${a.gate}.${a.line}`).join(" · ")}
                    </p>
                  </div>
                  <p className="text-xs text-ink-400">
                    Open centers: {result.openCenters.join(", ") || "none"} — where you take the world in and learn its wisdom.
                  </p>
                </div>
              </div>
            </PremiumGate>
          </div>
        </div>
      )}
    </div>
  );
}
