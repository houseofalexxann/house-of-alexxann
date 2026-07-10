"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { DateTime } from "luxon";
import {
  FORMAT_LABELS,
  formatPrice,
  priceTiers,
  type PriceTier,
  type ServiceDef,
  type SessionFormat,
} from "@/lib/services";

interface Slot {
  startUtc: string;
  endUtc: string;
}

interface Props {
  service: ServiceDef;
  /** Direct-pay options actually configured (empty → option hidden). */
  directPayAvailable: boolean;
}

export function BookingClient({ service, directPayAvailable }: Props) {
  const tiers = useMemo(() => priceTiers(service), [service]);
  const clientTz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone ?? "America/New_York",
    []
  );

  // Steps: 1 time → 2 details → payment handoff
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  const [format, setFormat] = useState<SessionFormat>(service.formats[0]);
  const [tier, setTier] = useState<PriceTier>(tiers[1]);
  const [payMethod, setPayMethod] = useState<"checkout" | "direct">("checkout");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSlots = useCallback(async () => {
    setSlotsLoading(true);
    setSlotsError(null);
    try {
      const from = DateTime.utc().toISO();
      const to = DateTime.utc().plus({ days: 30 }).toISO();
      const res = await fetch(
        `/api/slots?service=${service.slug}&from=${encodeURIComponent(from!)}&to=${encodeURIComponent(to!)}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not load times.");
      setSlots(data.slots ?? []);
    } catch (e) {
      setSlotsError(e instanceof Error ? e.message : "Could not load times.");
    } finally {
      setSlotsLoading(false);
    }
  }, [service.slug]);

  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  // Group slots by client-local day.
  const byDay = useMemo(() => {
    const map = new Map<string, Slot[]>();
    for (const s of slots) {
      const key = DateTime.fromISO(s.startUtc).setZone(clientTz).toFormat("yyyy-MM-dd");
      (map.get(key) ?? map.set(key, []).get(key)!).push(s);
    }
    return map;
  }, [slots, clientTz]);

  const days = [...byDay.keys()].sort();
  const activeDay = selectedDay && byDay.has(selectedDay) ? selectedDay : days[0] ?? null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError("Pick a time first — the calendar is at the top.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceSlug: service.slug,
          startUtc: selectedSlot.startUtc,
          format,
          clientName: name,
          clientEmail: email,
          clientPhone: phone || undefined,
          clientTz,
          priceTier: tier.key,
          paymentMethod: payMethod,
          birthDate: birthDate || undefined,
          birthTime: birthTime || undefined,
          birthPlace: birthPlace || undefined,
          notes: notes || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409) void loadSlots();
        throw new Error(data.error ?? "Booking failed.");
      }
      window.location.href = data.paymentUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed.");
      setSubmitting(false);
    }
  };

  const fmtDay = (d: string) =>
    DateTime.fromISO(d, { zone: clientTz }).toFormat("ccc, LLL d");
  const fmtTime = (s: Slot) =>
    DateTime.fromISO(s.startUtc).setZone(clientTz).toFormat("h:mm a");

  const inputCls =
    "w-full rounded-lg border border-pearl-400 bg-white/80 px-3 py-2 text-ink-900 placeholder:text-ink-400 focus:border-rose-400 focus:outline-none";

  return (
    <form onSubmit={submit} className="space-y-8">
      {/* ——— 1 · Pick a time ——— */}
      <section className="card p-6">
        <h2 className="font-heading text-xl text-ink-900">
          <span className="mr-2 text-rose-500">1 ·</span> Choose a time
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          Times shown in your timezone — {clientTz.replace(/_/g, " ")}.
        </p>
        {slotsLoading ? (
          <p className="mt-6 text-sm text-ink-500">Consulting the calendar…</p>
        ) : slotsError ? (
          <p className="mt-6 text-sm text-rose-600">{slotsError}</p>
        ) : days.length === 0 ? (
          <p className="mt-6 text-sm text-ink-500">
            No open times in the next month — please check back soon.
          </p>
        ) : (
          <>
            <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
              {days.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    setSelectedDay(d);
                    setSelectedSlot(null);
                  }}
                  className={`shrink-0 rounded-full border px-4 py-1.5 text-sm transition-colors ${
                    d === activeDay
                      ? "border-rose-500 bg-rose-500 text-white"
                      : "border-pearl-400 bg-white/70 text-ink-700 hover:border-rose-400"
                  }`}
                >
                  {fmtDay(d)}
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {(activeDay ? byDay.get(activeDay) ?? [] : []).map((s) => (
                <button
                  key={s.startUtc}
                  type="button"
                  onClick={() => setSelectedSlot(s)}
                  className={`rounded-lg border px-4 py-2 text-sm tabular-nums transition-colors ${
                    selectedSlot?.startUtc === s.startUtc
                      ? "border-rose-500 bg-rose-500 text-white"
                      : "border-pearl-400 bg-white/70 text-ink-700 hover:border-rose-400"
                  }`}
                >
                  {fmtTime(s)}
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ——— 2 · Format ——— */}
      <section className="card p-6">
        <h2 className="font-heading text-xl text-ink-900">
          <span className="mr-2 text-rose-500">2 ·</span> How shall we meet?
        </h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {service.formats.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFormat(f)}
              className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                format === f
                  ? "border-rose-500 bg-rose-500 text-white"
                  : "border-pearl-400 bg-white/70 text-ink-700 hover:border-rose-400"
              }`}
            >
              {FORMAT_LABELS[f]}
            </button>
          ))}
        </div>
      </section>

      {/* ——— 3 · Sliding scale ——— */}
      <section className="card p-6">
        <h2 className="font-heading text-xl text-ink-900">
          <span className="mr-2 text-rose-500">3 ·</span> Choose your rate
        </h2>
        <p className="mt-1 text-xs text-ink-500">
          Sliding scale, honor system — the reading is identical at every tier.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {tiers.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTier(t)}
              className={`rounded-xl border p-4 text-left transition-colors ${
                tier.key === t.key
                  ? "border-rose-500 bg-rose-300/30"
                  : "border-pearl-400 bg-white/70 hover:border-rose-400"
              }`}
            >
              <span className="block text-lg font-semibold text-ink-900">
                {formatPrice(t.priceCents)}
              </span>
              <span className="block text-sm text-rose-600">{t.label}</span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-500">
                {t.blurb}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ——— 4 · Details ——— */}
      <section className="card p-6">
        <h2 className="font-heading text-xl text-ink-900">
          <span className="mr-2 text-rose-500">4 ·</span> Your details
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-ink-700">Name</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-ink-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-ink-700">
              Phone {format === "phone" ? "(Alexandria will call this number)" : "(optional)"}
            </span>
            <input
              type="tel"
              required={format === "phone"}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputCls}
            />
          </label>
        </div>
        <details className="mt-5 rounded-lg border border-pearl-300 bg-white/50 p-4">
          <summary className="cursor-pointer text-sm font-medium text-ink-700">
            Add your birth details so your chart is ready (optional)
          </summary>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1 block text-ink-700">Birth date</span>
              <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className={inputCls} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-ink-700">Birth time</span>
              <input type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className={inputCls} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-ink-700">Birthplace</span>
              <input
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="City, country"
                className={inputCls}
              />
            </label>
          </div>
          <p className="mt-3 text-xs text-ink-400">
            Held in confidence, used only to prepare your reading.
          </p>
        </details>
        <label className="mt-5 block text-sm">
          <span className="mb-1 block text-ink-700">
            Anything you&apos;d like Alexandria to know? (optional)
          </span>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={inputCls}
          />
        </label>
      </section>

      {/* ——— 5 · Payment method ——— */}
      <section className="card p-6">
        <h2 className="font-heading text-xl text-ink-900">
          <span className="mr-2 text-rose-500">5 ·</span> How would you like to pay?
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setPayMethod("checkout")}
            className={`rounded-xl border p-4 text-left transition-colors ${
              payMethod === "checkout"
                ? "border-rose-500 bg-rose-300/30"
                : "border-pearl-400 bg-white/70 hover:border-rose-400"
            }`}
          >
            <span className="block font-semibold text-ink-900">Card & pay-over-time</span>
            <span className="mt-1 block text-xs leading-relaxed text-ink-500">
              Secure checkout: card, Pay in 4 (Klarna / Afterpay), monthly
              installments (Affirm), Cash App Pay, PayPal.
            </span>
          </button>
          {directPayAvailable && (
            <button
              type="button"
              onClick={() => setPayMethod("direct")}
              className={`rounded-xl border p-4 text-left transition-colors ${
                payMethod === "direct"
                  ? "border-rose-500 bg-rose-300/30"
                  : "border-pearl-400 bg-white/70 hover:border-rose-400"
              }`}
            >
              <span className="block font-semibold text-ink-900">
                Venmo · Cash App · Zelle · PayPal
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-ink-500">
                Send it directly — your slot is held for 24 hours and confirms
                the moment your payment arrives.
              </span>
            </button>
          )}
        </div>
      </section>

      <div className="flex flex-col items-center gap-3">
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button type="submit" disabled={submitting || !selectedSlot} className="btn-gold text-base disabled:opacity-50">
          {submitting
            ? "Holding your slot…"
            : selectedSlot
              ? `Book ${fmtDay(DateTime.fromISO(selectedSlot.startUtc).setZone(clientTz).toFormat("yyyy-MM-dd"))} at ${fmtTime(selectedSlot)} · ${formatPrice(tier.priceCents)}`
              : "Pick a time to continue"}
        </button>
        <p className="text-xs text-ink-400">
          {payMethod === "direct"
            ? "You'll receive payment instructions by email."
            : "You'll be taken to secure payment to complete the booking."}
        </p>
      </div>
    </form>
  );
}
