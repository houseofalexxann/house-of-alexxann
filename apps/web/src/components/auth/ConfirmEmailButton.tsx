"use client";

import { useState } from "react";
import { hardNavigate } from "@/lib/navigate";

/** The last step of confirming an email: a button, on this site, by the signed-in owner. */
export function ConfirmEmailButton({
  token,
  email,
  name,
}: {
  token: string;
  email: string;
  name: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        hardNavigate("/account?confirm=done");
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error ?? "That did not go through. Try again in a moment.");
    } catch {
      setError("That did not go through. Try again in a moment.");
    }
    setBusy(false);
  }

  return (
    <>
      <p className="mt-2 text-sm leading-relaxed text-ink-700">
        You are signed in{name ? ` as ${name}` : ""}. Confirm that{" "}
        <span className="font-medium text-ink-900">{email}</span> is your inbox.
      </p>
      <button type="button" className="btn-gold mt-5 text-sm" onClick={confirm} disabled={busy}>
        {busy ? "Confirming..." : "Yes, this is my email"}
      </button>
      {error && (
        <p className="mt-3 text-xs text-rose-600" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
