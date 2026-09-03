"use client";

import { useState } from "react";
import { useUser } from "@/components/UserProvider";
import { formatMembershipPrice } from "@/lib/membership";

/**
 * Starts the monthly subscription checkout and follows Stripe's URL. The
 * price on the button is the live one from settings, so a change in the
 * admin shows here without a deploy.
 */
export function JoinCheckoutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { membershipPriceCents } = useUser();
  const price = formatMembershipPrice(membershipPriceCents);

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
        {busy ? "Opening checkout…" : `Become a Venusian Doll for ${price} a month`}
      </button>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </span>
  );
}
