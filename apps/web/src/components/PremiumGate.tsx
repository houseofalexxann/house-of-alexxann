"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "./UserProvider";

/**
 * Wraps premium content. Non-members see a soft-locked preview: the content
 * is rendered blurred and inert underneath an invitation card, so people
 * know exactly what membership holds (honest paywall, no dark patterns).
 */
export function PremiumGate({
  title,
  children,
  member = false,
  preview = true,
}: {
  title: string;
  children: React.ReactNode;
  member?: boolean;
  preview?: boolean;
}) {
  const [peek, setPeek] = useState(false);
  const { user } = useUser();
  if (member || user?.isMember || user?.role === "admin") return <>{children}</>;

  return (
    <div className="relative">
      {preview && (
        <div
          aria-hidden
          className={`pointer-events-none select-none transition-all ${
            peek ? "blur-[2px] opacity-60" : "blur-md opacity-35"
          }`}
        >
          {children}
        </div>
      )}
      <div
        className={`${preview ? "absolute inset-0" : ""} flex items-center justify-center p-6`}
      >
        <div className="max-w-md rounded-2xl border border-pearl-300 bg-white/90 p-6 text-center shadow-lg backdrop-blur">
          <div aria-hidden className="text-2xl text-rose-500">✦</div>
          <h3 className="mt-2 font-heading text-xl text-ink-900">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-ink-500">
            This lives in the members&#39; House.{" "}
            {user
              ? "Membership unlocks it the moment it opens — and every reading with Alexandria includes all of it today."
              : "Create a free account to be first through the door — and every reading with Alexandria includes all of it today."}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {!user && (
              <Link href="/signup" className="btn-gold text-sm">
                Create an account
              </Link>
            )}
            <Link href="/services" className={user ? "btn-gold text-sm" : "btn-ghost text-sm"}>
              Book a reading
            </Link>
            {preview && (
              <button
                type="button"
                onClick={() => setPeek((p) => !p)}
                className="btn-ghost text-sm"
              >
                {peek ? "Soften the veil" : "Peek behind the veil"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
