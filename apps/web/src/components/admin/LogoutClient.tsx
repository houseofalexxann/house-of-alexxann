"use client";

import { hardNavigate } from "@/lib/navigate";

export function LogoutClient() {
  return (
    <button
      type="button"
      className="ml-auto rounded-full px-3 py-1 text-ink-400 transition-colors hover:text-ink-900"
      onClick={async () => {
        await fetch("/api/admin/session", { method: "DELETE" });
        hardNavigate("/admin/login");
      }}
    >
      Sign out
    </button>
  );
}
