"use client";

import { useState } from "react";

export function LoginClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Sign-in failed.");
      }
      window.location.href = "/admin";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed.");
      setBusy(false);
    }
  };

  const inputCls =
    "w-full rounded-lg border border-pearl-400 bg-white/80 px-3 py-2 text-ink-900 focus:border-rose-400 focus:outline-none";

  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <label className="block text-sm">
        <span className="mb-1 block text-ink-700">Email</span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-ink-700">Password</span>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
      </label>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button type="submit" disabled={busy} className="btn-gold w-full disabled:opacity-60">
        {busy ? "Unlocking…" : "Enter the House"}
      </button>
    </form>
  );
}
