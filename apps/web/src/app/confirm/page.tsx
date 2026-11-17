import type { Metadata } from "next";
import Link from "next/link";
import { sessionUser } from "@/lib/user-auth";
import { verifyTokenMatches } from "@/lib/email-verify";
import { ConfirmEmailButton } from "@/components/auth/ConfirmEmailButton";

export const metadata: Metadata = {
  title: "Confirm your email",
  robots: { index: false, follow: false },
};

/**
 * Where the confirmation link lands. Opening this page changes nothing: it
 * names the account that is signed in and finishes with a button, so the
 * person confirming can see which account they are confirming.
 */
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token = "" } = await searchParams;
  const user = await sessionUser();
  const wellFormed = /^[\w.-]{20,400}$/.test(token);

  let body: React.ReactNode;
  if (!user) {
    body = (
      <>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">
          Sign in to the account you made, and the House brings you straight back here to finish.
        </p>
        <Link
          href={wellFormed ? `/login?confirm=${encodeURIComponent(token)}` : "/login"}
          className="btn-gold mt-5 inline-flex text-sm"
        >
          Sign in
        </Link>
      </>
    );
  } else if (user.emailVerifiedAt) {
    body = (
      <>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">
          Your email is already confirmed. Nothing more to do.
        </p>
        <Link href="/account" className="btn-gold mt-5 inline-flex text-sm">
          Back to your House
        </Link>
      </>
    );
  } else if (!wellFormed || !verifyTokenMatches(token, user)) {
    body = (
      <>
        <p className="mt-2 text-sm leading-relaxed text-ink-700">
          This link has expired, or it was made for a different account than the one signed in
          here. Send a fresh one from your account page.
        </p>
        <Link href="/account" className="btn-gold mt-5 inline-flex text-sm">
          Go to your account
        </Link>
      </>
    );
  } else {
    body = <ConfirmEmailButton token={token} email={user.email} name={user.name} />;
  }

  return (
    <div className="mx-auto max-w-sm px-4 pb-24 pt-20">
      <div className="card p-8 text-center">
        <h1 className="text-2xl text-ink-900">Confirm your email</h1>
        {body}
      </div>
    </div>
  );
}
