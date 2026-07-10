"use client";

import { useState } from "react";

const METHODS = [
  { key: "card", label: "💳 Card" },
  { key: "klarna", label: "Klarna · Pay in 4" },
  { key: "afterpay", label: "Afterpay · Pay in 4" },
  { key: "affirm", label: "Affirm · monthly" },
  { key: "cashapp", label: "Cash App Pay" },
  { key: "paypal", label: "PayPal" },
];

export function MockPayClient({ token }: { token: string }) {
  const [method, setMethod] = useState("card");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings/mock-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment failed.");
      window.location.href = `/book/confirmation?token=${token}&paid=1`;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed.");
      setBusy(false);
    }
  };

  return (
    <div className="mt-6">
      <div className="grid gap-2">
        {METHODS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMethod(m.key)}
            className={`rounded-lg border px-4 py-2.5 text-left text-sm transition-colors ${
              method === m.key
                ? "border-rose-500 bg-rose-300/30 text-ink-900"
                : "border-pearl-400 bg-white/70 text-ink-700 hover:border-rose-400"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-center text-sm text-rose-600">{error}</p>}
      <button
        type="button"
        onClick={pay}
        disabled={busy}
        className="btn-gold mt-5 w-full disabled:opacity-60"
      >
        {busy ? "Processing…" : "Simulate successful payment"}
      </button>
    </div>
  );
}
