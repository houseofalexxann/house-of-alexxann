import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "@/components/auth/ResetForm";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <div className="mx-auto max-w-sm px-4 pb-24 pt-20">
      <div className="card p-8">
        <div className="text-center">
          <span aria-hidden className="text-2xl text-rose-500">✦</span>
          <h1 className="mt-2 text-2xl text-ink-900">A new key</h1>
          <p className="mt-1 text-sm text-ink-500">Choose your new password below.</p>
        </div>
        {token ? (
          <ResetForm token={token} />
        ) : (
          <p className="mt-6 text-center text-sm text-ink-700">
            This page needs the link from your reset email.{" "}
            <Link href="/forgot" className="text-rose-600 hover:underline">
              Request one here
            </Link>
            .
          </p>
        )}
      </div>
    </div>
  );
}
