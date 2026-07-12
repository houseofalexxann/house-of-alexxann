"use client";

import { useState } from "react";
import Link from "next/link";

const inputCls =
  "w-full rounded-lg border border-pearl-400 bg-white/80 px-3 py-2 text-ink-900 focus:border-rose-400 focus:outline-none";

export function ResetForm({ token }: { token: string }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Those passwords don't match — try again.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "reset", token, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      window.location.href = "/account";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block text-ink-700">
          New password <span className="text-ink-400">(8+ characters)</span>
        </span>
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
          autoComplete="new-password"
        />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-ink-700">Type it once more</span>
        <input
          type="password"
          required
          minLength={8}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className={inputCls}
          autoComplete="new-password"
        />
      </label>
      {error && (
        <p className="text-sm text-rose-600">
          {error}{" "}
          <Link href="/forgot" className="underline underline-offset-2">
            Request a fresh link
          </Link>
        </p>
      )}
      <button type="submit" disabled={busy} className="btn-gold w-full disabled:opacity-60">
        {busy ? "One moment…" : "Set my new password"}
      </button>
    </form>
  );
}
