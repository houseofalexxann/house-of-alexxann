import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  return (
    <div className="mx-auto max-w-sm px-4 pb-24 pt-20">
      <div className="card p-8">
        <div className="text-center">
          <span aria-hidden className="text-2xl text-rose-500">✦</span>
          <h1 className="mt-2 text-2xl text-ink-900">Join the House</h1>
          <p className="mt-1 text-sm text-ink-500">
            Save your chart, keep your birth details safe, and unlock the
            members&#39; rooms as they open.
          </p>
        </div>
        <AuthForm mode="signup" />
      </div>
    </div>
  );
}
