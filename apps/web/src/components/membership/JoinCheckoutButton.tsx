"use client";

import { useState } from "react";

/** Starts the $5/month subscription checkout and follows Stripe's URL. */
export function JoinCheckoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={busy}
        className="btn-gold text-sm disabled:opacity-60"
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            const res = await fetch("/api/membership/checkout", { method: "POST" });
            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data.url) throw new Error(data.error ?? "Something went wrong.");
            window.location.href = data.url;
          } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong.");
            setBusy(false);
          }
        }}
      >
        {busy ? "Opening checkout…" : "Become a Venusian Doll — $5/month"}
      </button>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </span>
  );
}
