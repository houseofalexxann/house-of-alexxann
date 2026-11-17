"use client";

import { useState } from "react";
import { hardNavigate } from "@/lib/navigate";

/**
 * Shown on the account page until the address is confirmed. Sends the
 * confirmation link; the link itself does the confirming.
 */
export function ConfirmEmailPrompt({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [problem, setProblem] = useState("That did not send. Give it a moment and try again.");

  async function send() {
    setState("sending");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (res.ok) {
        const done = (await res.json().catch(() => null)) as { already?: boolean } | null;
        if (done?.already) {
          // Confirmed in another tab or on another device: show the real state.
          hardNavigate("/account?confirm=done");
          return;
        }
        setState("sent");
        return;
      }
      const data = (await res.json().catch(() => null)) as { error?: string } | null;
      if (data?.error) setProblem(data.error);
      setState("error");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-pearl-300 bg-pearl-100/70 p-3 text-xs leading-relaxed text-ink-700">
      <p>
        Confirm that <span className="font-medium text-ink-900">{email}</span> is
        yours, and any session booked with this address appears here.
      </p>
      {state === "sent" ? (
        <p className="mt-2 text-ink-900" role="status">
          Sent. Open the link in your inbox to finish.
        </p>
      ) : (
        <button
          type="button"
          className="btn-ghost mt-2 text-xs"
          onClick={send}
          disabled={state === "sending"}
        >
          {state === "sending" ? "Sending..." : "Send me the link"}
        </button>
      )}
      {state === "error" && (
        <p className="mt-2 text-rose-600" role="alert">
          {problem}
        </p>
      )}
    </div>
  );
}
