"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SavedProfile } from "@/lib/saved-charts";
import { useUser } from "@/components/UserProvider";

/**
 * The account's saved charts: her own first, then the ones she keeps for
 * other people. Each opens in either room of the Studio with its exact
 * place and time, and can be removed.
 */
export function SavedChartsShelf({
  initial,
  othersAllowed,
}: {
  initial: SavedProfile[];
  /** How many charts beyond her own a free account keeps; null for members. */
  othersAllowed: number | null;
}) {
  const router = useRouter();
  const { refresh: refreshSession } = useUser();
  const [profiles, setProfiles] = useState(initial);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [announce, setAnnounce] = useState("");
  const statusRef = useRef<HTMLParagraphElement>(null);
  const removeButtons = useRef(new Map<string, HTMLButtonElement>());

  // This page can be restored from the browser's history with an old list
  // (a chart saved or removed in the Studio since). Ask once for the truth.
  useEffect(() => {
    let alive = true;
    fetch("/api/profile")
      .then((res) => (res.ok ? (res.json() as Promise<{ profiles?: SavedProfile[] }>) : null))
      .then((data) => {
        if (alive && data?.profiles) setProfiles(data.profiles);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  async function remove(target: SavedProfile) {
    setBusy(target.id);
    setError(null);
    try {
      const res = await fetch(`/api/profile?id=${encodeURIComponent(target.id)}`, { method: "DELETE" });
      // 404 means it is already gone (removed in another tab): either way
      // it leaves the shelf.
      if (res.ok || res.status === 404) {
        setProfiles((list) => list.filter((p) => p.id !== target.id));
        setConfirming(null);
        setAnnounce(`Removed the chart saved as ${target.name}.`);
        statusRef.current?.focus();
        if (target.isSelf) await refreshSession();
        router.refresh();
      } else {
        setError("That chart could not be removed just now. Try again in a moment.");
      }
    } catch {
      setError("That chart could not be removed just now. Try again in a moment.");
    }
    setBusy(null);
  }

  function keep(id: string) {
    setConfirming(null);
    // The confirm buttons are about to go: return focus to where it came from.
    requestAnimationFrame(() => removeButtons.current.get(id)?.focus());
  }

  const others = profiles.filter((p) => !p.isSelf).length;
  const hasOwn = profiles.some((p) => p.isSelf);

  return (
    <>
      {/* One status line, always in the same place, so removals are announced. */}
      <p
        ref={statusRef}
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className={announce ? "mt-2 text-xs text-ink-700 outline-none" : "sr-only"}
      >
        {announce}
      </p>

      {profiles.length === 0 ? (
        <p className="mt-2 text-sm text-ink-500">
          Cast a chart in the{" "}
          <Link href="/western" className="text-rose-600 hover:underline">
            Studio
          </Link>{" "}
          and save it: yours first, then anyone you keep a chart for.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-pearl-300 text-sm">
          {profiles.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2.5">
              <div className="min-w-0">
                <p className="text-ink-900">
                  {p.name}
                  {p.isSelf && (
                    <span className="ml-2 rounded-full bg-pearl-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-500">
                      You
                    </span>
                  )}
                </p>
                <p className="text-xs text-ink-500">
                  {p.birthDate}
                  {p.birthTime ? ` · ${p.birthTime}` : " · time unknown"} · {p.placeLabel}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <Link className="text-rose-600 hover:underline" href={`/western?profile=${p.id}`}>
                  Western
                </Link>
                <Link className="text-rose-600 hover:underline" href={`/vedic?profile=${p.id}`}>
                  Vedic
                </Link>
                {confirming === p.id ? (
                  <>
                    {p.isSelf && (
                      <span className="basis-full text-right text-ink-700">
                        The other rooms fill in from this chart, and for members the calendar and weather follow it.
                        Remove it?
                      </span>
                    )}
                    <button
                      type="button"
                      // For any other chart the yes is one key away; for her own, the safe answer is.
                      autoFocus={!p.isSelf}
                      className="font-medium text-rose-600 hover:underline"
                      onClick={() => remove(p)}
                      disabled={busy === p.id}
                    >
                      {busy === p.id ? "Removing..." : "Yes, remove"}
                    </button>
                    <button
                      type="button"
                      autoFocus={p.isSelf}
                      className="text-ink-500 hover:underline"
                      onClick={() => keep(p.id)}
                      disabled={busy === p.id}
                    >
                      Keep
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    ref={(el) => {
                      if (el) removeButtons.current.set(p.id, el);
                      else removeButtons.current.delete(p.id);
                    }}
                    className="text-ink-500 hover:underline"
                    onClick={() => setConfirming(p.id)}
                    aria-label={`Remove the chart saved as ${p.name}`}
                  >
                    Remove
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {error && (
        <p className="mt-2 text-xs text-rose-600" role="alert">
          {error}
        </p>
      )}
      {profiles.length > 0 && (
        <p className="mt-3 text-xs text-ink-400">
          {hasOwn ? (
            "Your own chart is the one the House reads for you: it fills in the other rooms, and for members the calendar and weather follow it. "
          ) : (
            <>
              None of these is marked as your own yet. Cast yours in the{" "}
              <Link href="/western" className="text-rose-600 hover:underline">
                Studio
              </Link>{" "}
              and choose &quot;This is my chart&quot; so the other rooms have something to read.{" "}
            </>
          )}
          {othersAllowed === null
            ? "Keep charts for as many others as you need."
            : `You are keeping ${others} of ${othersAllowed} others. Members keep as many as they need.`}
        </p>
      )}
    </>
  );
}
