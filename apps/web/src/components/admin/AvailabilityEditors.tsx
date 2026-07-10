"use client";

import { useState } from "react";
import type { SchedulerSettings } from "@/lib/settings";

export interface RuleDto {
  id: string;
  weekday: number; // 0 = Sunday … 6 = Saturday
  startMinute: number;
  endMinute: number;
  active: boolean;
}

export interface ExceptionDto {
  id: string;
  date: string; // YYYY-MM-DD
  blocked: boolean;
  startMinute: number | null;
  endMinute: number | null;
  note: string | null;
}

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const US_TIMEZONES = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
];

const inputCls =
  "w-full rounded-lg border border-pearl-400 bg-white/80 px-3 py-2 text-ink-900 focus:border-rose-400 focus:outline-none";

/** "HH:mm" → minutes from midnight (NaN when malformed). */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Minutes from midnight → "HH:mm" (for <input type="time"> values). */
function toHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Minutes from midnight → friendly 12-hour label, e.g. "9:30 AM". */
function fmtTime(minutes: number): string {
  const h24 = Math.floor(minutes / 60);
  const m = minutes % 60;
  const suffix = h24 < 12 ? "AM" : "PM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${suffix}`;
}

async function postAvailability(body: Record<string, unknown>): Promise<string | null> {
  const res = await fetch("/api/admin/availability", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return (data as { error?: string }).error ?? "Something went wrong.";
  }
  return null;
}

/* ————— Weekly rules ————— */

export function WeeklyRulesEditor({ rules }: { rules: RuleDto[] }) {
  const [weekday, setWeekday] = useState(1);
  const [start, setStart] = useState("10:00");
  const [end, setEnd] = useState("17:00");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const send = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    const err = await postAvailability({ kind: "rule", ...body });
    if (err) {
      setError(err);
      setBusy(false);
    } else {
      location.reload();
    }
  };

  const addRule = (e: React.FormEvent) => {
    e.preventDefault();
    void send({
      action: "create",
      weekday,
      startMinute: toMinutes(start),
      endMinute: toMinutes(end),
    });
  };

  return (
    <section className="card p-6">
      <h2 className="text-xl text-ink-900">Weekly hours</h2>
      <p className="mt-1 text-sm text-ink-500">
        Recurring windows, in your practitioner timezone. Toggle a row off to pause it without deleting.
      </p>

      {rules.length === 0 ? (
        <p className="mt-4 text-sm text-ink-400">No weekly windows yet — add one below.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-pearl-300 text-xs uppercase tracking-wider text-ink-500">
                <th className="py-2 pr-4">Day</th>
                <th className="py-2 pr-4">Start</th>
                <th className="py-2 pr-4">End</th>
                <th className="py-2 pr-4">Active</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className="border-b border-pearl-300/60">
                  <td className="py-2 pr-4 text-ink-900">{WEEKDAYS[rule.weekday]}</td>
                  <td className="py-2 pr-4 text-ink-700">{fmtTime(rule.startMinute)}</td>
                  <td className="py-2 pr-4 text-ink-700">{fmtTime(rule.endMinute)}</td>
                  <td className="py-2 pr-4">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void send({ action: "update", id: rule.id, active: !rule.active })}
                      className={`rounded-full border px-3 py-0.5 text-xs transition-colors ${
                        rule.active
                          ? "border-rose-400 bg-rose-300/30 text-rose-600"
                          : "border-pearl-400 bg-white/60 text-ink-400"
                      }`}
                    >
                      {rule.active ? "On" : "Off"}
                    </button>
                  </td>
                  <td className="py-2 text-right">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void send({ action: "delete", id: rule.id })}
                      className="text-xs text-ink-400 transition-colors hover:text-rose-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={addRule} className="mt-4 flex flex-wrap items-end gap-3 text-sm">
        <label className="block">
          <span className="mb-1 block text-ink-700">Day</span>
          <select
            value={weekday}
            onChange={(e) => setWeekday(Number(e.target.value))}
            className={inputCls}
          >
            {WEEKDAYS.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-ink-700">Start</span>
          <input type="time" required value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-ink-700">End</span>
          <input type="time" required value={end} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
        </label>
        <button type="submit" disabled={busy} className="btn-gold disabled:opacity-60">
          Add window
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </section>
  );
}

/* ————— Date exceptions ————— */

export function ExceptionsEditor({ exceptions }: { exceptions: ExceptionDto[] }) {
  const [date, setDate] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [note, setNote] = useState("");
  const [blocked, setBlocked] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const send = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError(null);
    const err = await postAvailability({ kind: "exception", ...body });
    if (err) {
      setError(err);
      setBusy(false);
    } else {
      location.reload();
    }
  };

  const addException = (e: React.FormEvent) => {
    e.preventDefault();
    void send({
      action: "create",
      date,
      blocked,
      startMinute: start ? toMinutes(start) : null,
      endMinute: end ? toMinutes(end) : null,
      note: note.trim() || null,
    });
  };

  return (
    <section className="card p-6">
      <h2 className="text-xl text-ink-900">Date exceptions</h2>
      <p className="mt-1 text-sm text-ink-500">
        Block a specific day (or part of one), or open extra hours outside the weekly pattern. Past dates are
        hidden automatically.
      </p>

      {exceptions.length === 0 ? (
        <p className="mt-4 text-sm text-ink-400">No upcoming exceptions.</p>
      ) : (
        <ul className="mt-4 divide-y divide-pearl-300/60 text-sm">
          {exceptions.map((ex) => (
            <li key={ex.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2">
              <span className="font-medium text-ink-900">{ex.date}</span>
              <span className={ex.blocked ? "text-rose-600" : "text-ink-700"}>
                {ex.startMinute != null && ex.endMinute != null
                  ? `${ex.blocked ? "Blocked" : "Open"} ${fmtTime(ex.startMinute)} – ${fmtTime(ex.endMinute)}`
                  : ex.blocked
                    ? "Blocked all day"
                    : "Open all day"}
              </span>
              {ex.note && <span className="text-ink-500">{ex.note}</span>}
              <button
                type="button"
                disabled={busy}
                onClick={() => void send({ action: "delete", id: ex.id })}
                className="ml-auto text-xs text-ink-400 transition-colors hover:text-rose-600"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={addException} className="mt-4 flex flex-wrap items-end gap-3 text-sm">
        <label className="block">
          <span className="mb-1 block text-ink-700">Date</span>
          <input type="date" required value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-ink-700">Start (optional)</span>
          <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={inputCls} />
        </label>
        <label className="block">
          <span className="mb-1 block text-ink-700">End (optional)</span>
          <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={inputCls} />
        </label>
        <label className="block grow">
          <span className="mb-1 block text-ink-700">Note</span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Retreat weekend"
            className={inputCls}
          />
        </label>
        <label className="flex items-center gap-2 pb-2 text-ink-700">
          <input
            type="checkbox"
            checked={blocked}
            onChange={(e) => setBlocked(e.target.checked)}
            className="h-4 w-4 accent-rose-500"
          />
          Block
        </label>
        <button type="submit" disabled={busy} className="btn-gold disabled:opacity-60">
          Add exception
        </button>
      </form>
      <p className="mt-2 text-xs text-ink-400">
        Leave the times empty to apply the whole day. Uncheck “Block” to open extra hours instead.
      </p>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </section>
  );
}

/* ————— Scheduler settings ————— */

export function SettingsEditor({ settings }: { settings: SchedulerSettings }) {
  const [form, setForm] = useState<SchedulerSettings>(settings);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof SchedulerSettings>(key: K, value: SchedulerSettings[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Save failed.");
      }
      location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
      setBusy(false);
    }
  };

  const numberField = (
    label: string,
    key: "bufferMinutes" | "leadTimeHours" | "horizonDays" | "slotStepMinutes"
  ) => (
    <label className="block text-sm">
      <span className="mb-1 block text-ink-700">{label}</span>
      <input
        type="number"
        min={0}
        required
        value={form[key]}
        onChange={(e) => set(key, Number(e.target.value))}
        className={inputCls}
      />
    </label>
  );

  const textField = (
    label: string,
    key: "videoLink" | "phoneNumber" | "inPersonAddress" | "venmoHandle" | "cashAppTag" | "zelleContact" | "paypalMeLink",
    placeholder?: string
  ) => (
    <label className="block text-sm">
      <span className="mb-1 block text-ink-700">{label}</span>
      <input
        type="text"
        value={form[key]}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </label>
  );

  return (
    <section className="card p-6">
      <h2 className="text-xl text-ink-900">Scheduler settings</h2>
      <p className="mt-1 text-sm text-ink-500">Timing, delivery details and payment handles.</p>

      <form onSubmit={submit} className="mt-4 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="mb-1 block text-ink-700">Practitioner timezone (IANA)</span>
            <input
              type="text"
              required
              list="hoa-tz-options"
              value={form.practitionerTz}
              onChange={(e) => set("practitionerTz", e.target.value)}
              className={inputCls}
            />
            <datalist id="hoa-tz-options">
              {US_TIMEZONES.map((tz) => (
                <option key={tz} value={tz} />
              ))}
            </datalist>
          </label>
          {numberField("Buffer between sessions (minutes)", "bufferMinutes")}
          {numberField("Minimum lead time (hours)", "leadTimeHours")}
          {numberField("Booking horizon (days)", "horizonDays")}
          {numberField("Slot step (minutes)", "slotStepMinutes")}
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-500">Delivery details</h3>
          <div className="mt-3 grid gap-4">
            {textField("Video link", "videoLink")}
            {textField("Phone number", "phoneNumber")}
            {textField("In-person address", "inPersonAddress")}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-rose-500">Payment handles</h3>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {textField("Venmo handle", "venmoHandle", "@alexxann")}
            {textField("Cash App tag", "cashAppTag", "$alexxann")}
            {textField("Zelle contact", "zelleContact", "email or phone")}
            {textField("PayPal.me link", "paypalMeLink", "https://paypal.me/…")}
          </div>
          <p className="mt-2 text-xs text-ink-400">
            These appear to clients choosing Venmo / Cash App / Zelle / PayPal at checkout.
          </p>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button type="submit" disabled={busy} className="btn-gold disabled:opacity-60">
          {busy ? "Saving…" : "Save settings"}
        </button>
      </form>
    </section>
  );
}
