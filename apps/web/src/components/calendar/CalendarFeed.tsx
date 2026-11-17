"use client";

import { useState } from "react";

/**
 * Subscribe box for the personal calendar feed. The URL is a bearer
 * credential, so it stays hidden until asked for and is labeled as private.
 */
export function CalendarFeed({ url: initialUrl }: { url: string }) {
  const [url, setUrl] = useState(initialUrl);
  const [shown, setShown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reset, setReset] = useState<"idle" | "working" | "done" | "error">("idle");

  if (!url) return null;

  async function resetAddress() {
    setReset("working");
    try {
      const res = await fetch("/api/calendar/reset", { method: "POST" });
      const data = (await res.json().catch(() => null)) as { url?: string } | null;
      if (res.ok && data?.url) {
        setUrl(data.url);
        setCopied(false);
        setReset("done");
      } else {
        setReset("error");
      }
    } catch {
      setReset("error");
    }
  }

  return (
    <section className="card mt-6 p-6">
      <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
        Carry it in your own calendar
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-700">
        Subscribe once and these moments appear in Apple Calendar, Google
        Calendar, or anything that reads a calendar feed. It refreshes itself,
        so new transits arrive without you doing anything.
      </p>
      {shown ? (
        <div className="mt-4">
          <code className="block overflow-x-auto rounded-lg border border-pearl-300 bg-pearl-100/70 px-3 py-2 text-xs text-ink-700">
            {url}
          </code>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-gold text-xs"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? "✓ Copied" : "⧉ Copy feed address"}
            </button>
            <a href={url} className="btn-ghost text-xs" download="house-of-alexxann.ics">
              Download once (.ics)
            </a>
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={resetAddress}
              disabled={reset === "working"}
            >
              {reset === "working" ? "Resetting..." : "Reset this address"}
            </button>
          </div>
          {reset === "done" && (
            <p className="mt-3 text-xs leading-relaxed text-ink-900" role="status">
              Done. The old address no longer works. Subscribe again with the new one above.
            </p>
          )}
          {reset === "error" && (
            <p className="mt-3 text-xs leading-relaxed text-rose-600" role="alert">
              The address could not be reset just now. Try again in a moment.
            </p>
          )}
          <p className="mt-3 text-xs leading-relaxed text-ink-400">
            Keep this address private: anyone who has it can read your calendar.
            If it ever gets out, reset it and the old one stops working.
            In Apple Calendar choose File, then New Calendar Subscription. In
            Google Calendar choose Other calendars, then From URL.
          </p>
        </div>
      ) : (
        <button type="button" className="btn-ghost mt-4 text-xs" onClick={() => setShown(true)}>
          Show my private feed address
        </button>
      )}
    </section>
  );
}
