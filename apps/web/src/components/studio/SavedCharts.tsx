"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { sameBirth, type SavedProfile } from "@/lib/saved-charts";

/** The birth details a chart on screen was cast from. */
export interface CastDetails {
  name: string;
  birthDate: string;
  birthTime: string | null;
  placeLabel: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/** How many saved charts show as buttons before the rest move to the account page. */
const PICKER_CHIPS = 6;

/** A row of the account's saved charts; choosing one casts it. */
export function SavedChartPicker({
  profiles,
  onPick,
  disabled,
}: {
  profiles: SavedProfile[];
  onPick: (p: SavedProfile) => void;
  disabled?: boolean;
}) {
  if (profiles.length === 0) return null;
  const shown = profiles.slice(0, PICKER_CHIPS);
  const more = profiles.length - shown.length;
  return (
    <div className="mx-auto mb-4 flex max-w-3xl flex-wrap items-center gap-2 text-sm">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">Your charts</span>
      {shown.map((p) => (
        <button
          key={p.id}
          type="button"
          disabled={disabled}
          onClick={() => onPick(p)}
          className="rounded-full border border-pearl-400 bg-pearl-100/70 px-3 py-1 text-ink-700 transition-colors hover:border-rose-400 disabled:opacity-60"
        >
          {p.isSelf ? `${p.name} (you)` : p.name}
        </button>
      ))}
      {more > 0 && (
        <Link href="/account" className="text-xs text-rose-600 hover:underline">
          and {more} more on your account
        </Link>
      )}
    </div>
  );
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Under a freshly cast chart: keep it, on purpose. Nothing is saved until
 * one of these buttons is pressed, and the account's own chart (the one the
 * other rooms read) is only ever set or replaced by name, and replaced only
 * after a second, explicit yes.
 */
export function SaveChartControl({
  mode,
  accountName,
  details,
  profiles,
  ownFallback,
  onSaved,
}: {
  /** "visitor" is signed out; "keyholder" is the admin key with no account behind it. */
  mode: "account" | "visitor" | "keyholder";
  accountName: string | null;
  details: CastDetails;
  profiles: SavedProfile[];
  /** The own chart as the session knows it, for the moment before the list has loaded. */
  ownFallback: SavedProfile | null;
  onSaved: (kind: "self" | "other") => void | Promise<void>;
}) {
  const [name, setName] = useState(details.name);
  const [busy, setBusy] = useState<"self" | "other" | null>(null);
  const [problem, setProblem] = useState<{ text: string; join?: boolean } | null>(null);
  const [copying, setCopying] = useState(false);
  const [confirmingReplace, setConfirmingReplace] = useState(false);
  // What this control itself just saved: the status line does not wait on,
  // or depend on, the saved list being fetched again.
  const [savedAs, setSavedAs] = useState<{ kind: "self" | "other"; name: string } | null>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  if (mode === "visitor") {
    return (
      <p className="mx-auto mb-6 max-w-3xl text-center text-xs text-ink-500">
        <Link href="/signup" className="text-rose-600 hover:underline">
          Make a free account
        </Link>{" "}
        to keep this chart and come back to it.
      </p>
    );
  }
  if (mode === "keyholder") {
    return (
      <p className="mx-auto mb-6 max-w-3xl text-center text-xs text-ink-500">
        Saved charts live in an account. Sign in with your own account to keep this one.
      </p>
    );
  }

  const mine = profiles.find((p) => p.isSelf) ?? ownFallback;
  const isMine = savedAs?.kind === "self" || Boolean(mine && sameBirth(mine, details));
  // The name this chart is settled under: what it was cast as, or what this
  // control saved it as. Never the half-typed text in the box.
  const settledName = savedAs?.kind === "other" ? savedAs.name : details.name;
  const savedOther =
    savedAs?.kind === "other"
      ? { name: savedAs.name }
      : (profiles.find((p) => !p.isSelf && sameBirth(p, details) && same(p.name, settledName)) ?? null);
  // The same moment and place under another name (twins, a same-day pair).
  const twin = profiles.find((p) => sameBirth(p, details) && !same(p.name, name)) ?? null;

  let status = "";
  if (!copying) {
    if (isMine && savedOther) status = `This is your own chart. A copy is also saved as ${savedOther.name}.`;
    else if (savedOther) status = `Saved to your account as ${savedOther.name}.`;
    else if (isMine) status = "This is your own chart, saved to your account.";
  }

  async function save(kind: "self" | "other") {
    const label = name.trim();
    if (kind === "other" && !label) {
      setProblem({ text: "Give this chart a name first, so you can find it again." });
      nameRef.current?.focus();
      return;
    }
    setBusy(kind);
    setProblem(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          name: label,
          birthDate: details.birthDate,
          birthTime: details.birthTime,
          placeLabel: details.placeLabel,
          latitude: details.latitude,
          longitude: details.longitude,
          timezone: details.timezone,
        }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string; limit?: boolean } | null;
      if (res.ok) {
        setSavedAs({ kind, name: label || accountName || "My chart" });
        setCopying(false);
        setConfirmingReplace(false);
        // The buttons are about to be replaced by the status line: keep
        // keyboard and screen-reader focus on something that still exists.
        statusRef.current?.focus();
        await onSaved(kind);
      } else {
        setProblem({
          text: data?.error ?? "That did not save. Try again in a moment.",
          join: Boolean(data?.limit),
        });
      }
    } catch {
      setProblem({ text: "That did not save. Try again in a moment." });
    }
    setBusy(null);
  }

  /** Setting the own chart is one press; replacing an existing one asks first. */
  function ownPressed() {
    if (mine && !confirmingReplace) {
      setConfirmingReplace(true);
      return;
    }
    void save("self");
  }

  // Which button leads. A blank name, the account holder's name, or the
  // name on her saved chart all read as "this is me"; anyone else's name
  // leads with keeping it for them.
  const blank = !name.trim();
  const nameIsMine =
    blank || (accountName !== null && same(name, accountName)) || (mine !== null && same(name, mine.name));
  const looksLikeMe = nameIsMine || (!mine && accountName === null);
  const showForm = !status;

  const replaceConfirm = confirmingReplace && (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs" role="group" aria-label="Replace your own chart">
      <span className="text-ink-700">Your own chart will be replaced with this one. Replace it?</span>
      <button type="button" className="font-medium text-rose-600 hover:underline" onClick={() => save("self")} disabled={busy !== null}>
        {busy === "self" ? "Saving..." : "Yes, replace"}
      </button>
      <button
        type="button"
        autoFocus
        className="text-ink-500 hover:underline"
        onClick={() => setConfirmingReplace(false)}
        disabled={busy !== null}
      >
        Keep mine
      </button>
    </div>
  );

  return (
    <div className="mx-auto mb-6 max-w-3xl rounded-xl border border-pearl-300 bg-pearl-100/60 p-4 text-sm">
      {/* Always mounted, so what it says is announced when it changes. */}
      <p
        ref={statusRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className={status ? "text-center text-xs text-ink-700 outline-none" : "sr-only"}
      >
        {status}
      </p>

      {status && !confirmingReplace && (
        <div className="mt-2 flex flex-wrap justify-center gap-3 text-xs">
          {savedOther && !isMine && (
            <button type="button" className="text-rose-600 hover:underline" onClick={ownPressed} disabled={busy !== null}>
              {busy === "self" ? "Saving..." : mine ? "Replace my own chart with this one" : "This is me: make it my own chart"}
            </button>
          )}
          {isMine && !savedOther && (
            <button
              type="button"
              className="text-ink-500 hover:underline"
              onClick={() => {
                setName("");
                setCopying(true);
                requestAnimationFrame(() => nameRef.current?.focus());
              }}
            >
              Someone else born at this same moment? Keep a copy for them
            </button>
          )}
        </div>
      )}
      {status && replaceConfirm}

      {showForm && (
        <>
          <div className="flex flex-wrap items-end justify-center gap-3">
            <label className="block text-xs text-ink-700">
              <span className="mb-1 block">Save this chart as</span>
              <input
                ref={nameRef}
                type="text"
                value={name}
                maxLength={120}
                onChange={(e) => setName(e.target.value)}
                placeholder="A name for this chart"
                className="w-56 rounded-lg border border-pearl-500 bg-pearl-100 px-3 py-1.5 text-sm text-ink-900 placeholder:text-ink-400 focus:border-rose-600 focus:outline-none"
              />
            </label>
            {!copying && (
              <button
                type="button"
                className={`${looksLikeMe ? "btn-gold" : "btn-ghost"} text-xs`}
                onClick={ownPressed}
                disabled={busy !== null || confirmingReplace}
              >
                {busy === "self" ? "Saving..." : mine ? "Replace my own chart with this" : "This is my chart"}
              </button>
            )}
            <button
              type="button"
              className={`${looksLikeMe && !copying ? "btn-ghost" : "btn-gold"} text-xs`}
              onClick={() => save("other")}
              disabled={busy !== null}
            >
              {busy === "other" ? "Saving..." : "Keep for someone else"}
            </button>
            {copying && (
              <button
                type="button"
                className="text-xs text-ink-500 hover:underline"
                onClick={() => {
                  setName(details.name);
                  setCopying(false);
                  setProblem(null);
                }}
              >
                Never mind
              </button>
            )}
          </div>
          {replaceConfirm}
          <p className="mt-3 text-center text-xs text-ink-400">
            {twin && !copying ? `Same birth details as ${twin.isSelf ? "your own chart" : twin.name}. ` : ""}
            Your own chart is the one the House reads for you: it fills in the other rooms, and for members the
            calendar and weather follow it. Keep charts for other people only with their blessing.
          </p>
        </>
      )}

      {problem && (
        <p className="mt-2 text-center text-xs text-rose-600" role="alert">
          {problem.text}{" "}
          {problem.join && (
            <Link href="/join" className="underline">
              See membership
            </Link>
          )}
        </p>
      )}
    </div>
  );
}
