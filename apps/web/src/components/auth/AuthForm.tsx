"use client";

import { useState } from "react";
import Link from "next/link";

const inputCls =
  "w-full rounded-lg border border-pearl-400 bg-white/80 px-3 py-2 text-ink-900 focus:border-rose-400 focus:outline-none";

export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        body: JSON.stringify(
          mode === "signup" ? { mode, name, email, password } : { mode, email, password }
        ),
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
      {mode === "signup" && (
        <label className="block text-sm">
          <span className="mb-1 block text-ink-700">Name</span>
          <input required value={name} onChange={(e) => setName(e.target.value)} className={inputCls} autoComplete="name" />
        </label>
      )}
      <label className="block text-sm">
        <span className="mb-1 block text-ink-700">Email</span>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" />
      </label>
      <label className="block text-sm">
        <span className="mb-1 block text-ink-700">
          Password {mode === "signup" && <span className="text-ink-400">(8+ characters)</span>}
        </span>
        <input
          type="password"
          required
          minLength={mode === "signup" ? 8 : 1}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputCls}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />
      </label>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <button type="submit" disabled={busy} className="btn-gold w-full disabled:opacity-60">
        {busy ? "One moment…" : mode === "signup" ? "Create my account" : "Sign in"}
      </button>
      <p className="text-center text-xs text-ink-500">
        {mode === "signup" ? (
          <>Already of the House? <Link href="/login" className="text-rose-600 hover:underline">Sign in</Link></>
        ) : (
          <>New here? <Link href="/signup" className="text-rose-600 hover:underline">Create an account</Link></>
        )}
      </p>
    </form>
  );
}
