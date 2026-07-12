"use client";

import { useState } from "react";
import Link from "next/link";

const inputCls =
  "w-full rounded-lg border border-pearl-400 bg-white/80 px-3 py-2 text-ink-900 focus:border-rose-400 focus:outline-none";

export function ForgotForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "forgot", email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
    setBusy(false);
  };

  if (sent) {
    return (
      <div className="mt-6 space-y-4 text-center">
        <p className="text-sm text-ink-700">
          If that email belongs to the House, a reset link is on its way — it&apos;s
          good for 45 minutes. Check your spam folder if it hides.
        </p>
        <Link href="/login" className="text-sm text-rose-600 hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block text-ink-700">Email</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
          autoComplete="email"
        />
      </label>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button type="submit" disabled={busy} className="btn-gold w-full disabled:opacity-60">
        {busy ? "One moment…" : "Send me a reset link"}
      </button>
      <p className="text-center text-xs text-ink-500">
        Remembered after all?{" "}
        <Link href="/login" className="text-rose-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
