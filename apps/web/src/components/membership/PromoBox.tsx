"use client";

import { useState } from "react";

/**
 * "Have a code?" on /join: trial codes lift the veil on the spot; membership
 * codes reveal the discounted monthly price (and carry into card checkout
 * when it's open).
 */
export function PromoBox({
  signedIn,
  checkoutEnabled,
}: {
  signedIn: boolean;
  checkoutEnabled: boolean;
}) {
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const apply = async () => {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      if (data.kind === "trial") {
        const until = new Date(data.memberUntil).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
        });
        setMessage(`✦ The veil is lifted — every room is yours through ${until}.`);
        setTimeout(() => window.location.reload(), 1800);
      } else {
        const price = `$${(data.priceCents / 100).toFixed(2)}`;
        setAppliedCode(code);
        setMessage(
          checkoutEnabled
            ? `✦ Code applied — your price is ${price}/month. Check out below.`
            : `✦ Code applied — send ${price} instead of the usual $5.`
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
    setBusy(false);
  };

  const checkout = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/membership/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: appliedCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error ?? "Something went wrong.");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  };

  if (!signedIn) {
    return (
      <p className="text-xs text-ink-400">
        Have a promo or trial code? Sign in first, then redeem it here.
      </p>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="PROMO CODE"
          className="w-44 rounded-lg border border-pearl-400 bg-white/80 px-3 py-2 text-sm uppercase tracking-wider text-ink-900 placeholder:text-ink-400 focus:border-rose-400 focus:outline-none"
        />
        <button
          type="button"
          onClick={apply}
          disabled={busy || !code.trim()}
          className="btn-ghost text-sm disabled:opacity-50"
        >
          {busy ? "One moment…" : "Apply"}
        </button>
        {appliedCode && checkoutEnabled && (
          <button type="button" onClick={checkout} disabled={busy} className="btn-gold text-sm disabled:opacity-50">
            Check out with code
          </button>
        )}
      </div>
      {message && <p className="mt-2 text-sm text-rose-600">{message}</p>}
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
