"use client";

import { useState } from "react";

export function MemberToggle({ id, isMember }: { id: string; isMember: boolean }) {
  const [on, setOn] = useState(isMember);
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      aria-pressed={on}
      onClick={async () => {
        setBusy(true);
        const res = await fetch("/api/admin/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, isMember: !on }),
        });
        if (res.ok) setOn(!on);
        setBusy(false);
      }}
      className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
        on
          ? "border-rose-500 bg-rose-500 text-white"
          : "border-pearl-400 bg-white/70 text-ink-500 hover:border-rose-400"
      }`}
    >
      {on ? "✦ member" : "free"}
    </button>
  );
}
