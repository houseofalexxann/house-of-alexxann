import type { Metadata } from "next";
import { LoginClient } from "@/components/admin/LoginClient";

export const metadata: Metadata = { title: "Admin — sign in" };

export default function AdminLoginPage() {
  return (
    <div className="mx-auto max-w-sm px-4 pb-24 pt-20">
      <div className="card p-8">
        <div className="text-center">
          <span aria-hidden className="text-2xl text-rose-500">✦</span>
          <h1 className="mt-2 text-2xl text-ink-900">The House keys</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to the back office.</p>
        </div>
        <LoginClient />
        <p className="mt-4 text-center text-xs text-ink-400">
          This door opens with your House Mother account password — the same
          one you use to sign in on the main site, resettable anytime via{" "}
          <a href="/forgot" className="text-rose-600 hover:underline">
            Forgot password
          </a>
          . (The ADMIN_PASSWORD in Vercel still works as a spare key.)
        </p>
      </div>
    </div>
  );
}
