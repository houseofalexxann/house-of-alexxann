import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/ForgotForm";

export const metadata: Metadata = { title: "Forgot password" };

export default function ForgotPage() {
  return (
    <div className="mx-auto max-w-sm px-4 pb-24 pt-20">
      <div className="card p-8">
        <div className="text-center">
          <span aria-hidden className="text-2xl text-rose-500">✦</span>
          <h1 className="mt-2 text-2xl text-ink-900">Lost your key?</h1>
          <p className="mt-1 text-sm text-ink-500">
            Tell us your email and we&apos;ll send a link to choose a new password.
          </p>
        </div>
        <ForgotForm />
      </div>
    </div>
  );
}
