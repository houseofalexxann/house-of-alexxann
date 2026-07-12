"use client";

import { useState } from "react";

const inputCls =
  "w-full rounded-lg border border-pearl-400 bg-white/80 px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:border-rose-400 focus:outline-none";

type Kind = "readings" | "membership" | "trial";

export function PromoCreateForm() {
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<Kind>("readings");
  const [percentOff, setPercentOff] = useState("");
  const [amountOff, setAmountOff] = useState("");
  const [trialDays, setTrialDays] = useState("14");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          code,
          kind,
          percentOff: kind !== "trial" && percentOff ? Number(percentOff) : undefined,
          amountOffCents:
            kind !== "trial" && amountOff ? Math.round(Number(amountOff) * 100) : undefined,
          trialDays: kind === "trial" ? Number(trialDays) : undefined,
          maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
          expiresAt: expiresAt || undefined,
          note: note || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Couldn't create that code.");
      location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create that code.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="card mt-4 space-y-4 p-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block text-ink-700">Code</span>
          <input
            required
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="HOUSEWARMING"
            className={`${inputCls} uppercase tracking-wider`}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-ink-700">What it&apos;s for</span>
          <select value={kind} onChange={(e) => setKind(e.target.value as Kind)} className={inputCls}>
            <option value="readings">Readings discount</option>
            <option value="membership">Membership discount</option>
            <option value="trial">Free trial (membership)</option>
          </select>
        </label>
        {kind === "trial" ? (
          <label className="block text-sm">
            <span className="mb-1 block text-ink-700">Trial length (days)</span>
            <input
              required
              type="number"
              min={1}
              max={365}
              value={trialDays}
              onChange={(e) => setTrialDays(e.target.value)}
              className={inputCls}
            />
          </label>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-sm">
              <span className="mb-1 block text-ink-700">% off</span>
              <input
                type="number"
                min={1}
                max={100}
                value={percentOff}
                onChange={(e) => setPercentOff(e.target.value)}
                placeholder="20"
                className={inputCls}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-ink-700">$ off</span>
              <input
                type="number"
                min={0.01}
                step="0.01"
                value={amountOff}
                onChange={(e) => setAmountOff(e.target.value)}
                placeholder="10.00"
                className={inputCls}
              />
            </label>
          </div>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="mb-1 block text-ink-700">Max uses (blank = unlimited)</span>
          <input
            type="number"
            min={1}
            value={maxRedemptions}
            onChange={(e) => setMaxRedemptions(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-ink-700">Expires (blank = never)</span>
          <input type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className={inputCls} />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-ink-700">Note to self</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Launch week gift"
            className={inputCls}
          />
        </label>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button type="submit" disabled={busy} className="btn-gold text-sm disabled:opacity-60">
        {busy ? "Creating…" : "✦ Create code"}
      </button>
    </form>
  );
}

export function PromoToggle({ id, active }: { id: string; active: boolean }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      className={`text-xs underline-offset-2 hover:underline disabled:opacity-60 ${
        active ? "text-rose-600" : "text-ink-400"
      }`}
      onClick={async () => {
        setBusy(true);
        const res = await fetch("/api/admin/promos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "toggle", id, active: !active }),
        });
        if (res.ok) location.reload();
        else setBusy(false);
      }}
    >
      {busy ? "…" : active ? "Retire" : "Revive"}
    </button>
  );
}
