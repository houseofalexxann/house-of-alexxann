"use client";

import { hardNavigate } from "@/lib/navigate";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="btn-ghost text-sm"
      onClick={async () => {
        await fetch("/api/auth", { method: "DELETE" });
        hardNavigate("/");
      }}
    >
      Sign out
    </button>
  );
}
