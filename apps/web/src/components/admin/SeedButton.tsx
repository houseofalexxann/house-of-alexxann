"use client";

import { useState } from "react";

/**
 * One-click first-time setup: creates the offerings, default weekly
 * availability, scheduler settings, and the admin user row. Idempotent —
 * safe to press again; it never overwrites values you've since edited.
 */
export function SeedButton({ seeded }: { seeded: boolean }) {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (seeded && !result) return null;

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        className="btn-gold text-xs disabled:opacity-60"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setResult(null);
          try {
            const res = await fetch("/api/admin/seed", { method: "POST" });
            const data = await res.json().catch(() => null);
            if (res.ok && data?.ok) {
              setResult(
                `✦ The House is set: ${data.services} offerings, ${data.availabilityRules} weekly availability windows.`
              );
            } else {
              setResult("Something went sideways — try again in a moment.");
            }
          } catch {
            setResult("Something went sideways — try again in a moment.");
          }
          setBusy(false);
        }}
      >
        {busy ? "Setting the table…" : "✦ Seed the House (first-time setup)"}
      </button>
      {result && <span className="text-xs text-ink-500">{result}</span>}
    </span>
  );
}
