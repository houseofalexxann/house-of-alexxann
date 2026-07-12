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
          The House Mother key can&apos;t be emailed — it lives in Vercel. Forgot
          it? Overwrite ADMIN_PASSWORD under Settings → Environment Variables,
          then redeploy.
        </p>
      </div>
    </div>
  );
}
