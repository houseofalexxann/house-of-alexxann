import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ confirm?: string }>;
}) {
  const { confirm = "" } = await searchParams;
  // Only a token-shaped value is carried through sign-in, and only ever to
  // the fixed /confirm page: this is not a general "return to" address.
  const confirmToken = /^[\w.-]{20,400}$/.test(confirm) ? confirm : undefined;
  return (
    <div className="mx-auto max-w-sm px-4 pb-24 pt-20">
      <div className="card p-8">
        <div className="text-center">
          <span aria-hidden className="text-2xl text-rose-500">✦</span>
          <h1 className="mt-2 text-2xl text-ink-900">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-500">
            {confirmToken ? "Sign in to finish confirming your email." : "The House kept your place."}
          </p>
        </div>
        <AuthForm mode="login" confirmToken={confirmToken} />
      </div>
    </div>
  );
}
