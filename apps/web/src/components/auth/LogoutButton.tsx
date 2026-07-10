"use client";

export function LogoutButton() {
  return (
    <button
      type="button"
      className="btn-ghost text-sm"
      onClick={async () => {
        await fetch("/api/auth", { method: "DELETE" });
        window.location.href = "/";
      }}
    >
      Sign out
    </button>
  );
}
