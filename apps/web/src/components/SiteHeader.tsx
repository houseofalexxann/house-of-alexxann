"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { useUser } from "./UserProvider";
import { SiteSearch } from "./SiteSearch";

/** One tab per system, then the practice, then learning. */
const NAV = [
  { href: "/western", key: "nav.western" },
  { href: "/vedic", key: "nav.vedic" },
  { href: "/human-design", key: "nav.humanDesign" },
  { href: "/tarot", key: "nav.tarot" },
  { href: "/blog", key: "nav.blog" },
  { href: "/services", key: "nav.readings" },
  { href: "/codex", key: "nav.learn" },
];

export function SiteHeader() {
  const { t } = useLocale();
  const { user } = useUser();
  return (
    <header className="sticky top-0 z-40 border-b border-pearl-300/60 bg-pearl-50/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span aria-hidden className="text-rose-500 transition-transform group-hover:rotate-12">
            ✦
          </span>
          <span className="font-heading text-xl tracking-wide text-ink-900">
            House of Alexxann
          </span>
        </Link>
        <nav className="ml-auto flex flex-wrap items-center gap-0.5 text-sm" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-2.5 py-1.5 text-ink-700 transition-colors hover:bg-pearl-200 hover:text-ink-900"
            >
              {t(item.key)}
            </Link>
          ))}
          <SiteSearch />
          {user ? (
            <Link
              href={user.role === "admin" ? "/admin" : "/account"}
              className="ml-1 rounded-full border border-pearl-400 bg-white/70 px-3 py-1.5 text-ink-900 transition-colors hover:border-rose-400"
            >
              {user.role === "admin" ? "✦ Admin" : `✦ ${user.name?.split(" ")[0] ?? "You"}`}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="ml-1 rounded-full px-2.5 py-1.5 text-ink-700 transition-colors hover:bg-pearl-200 hover:text-ink-900"
              >
                {t("nav.signIn")}
              </Link>
              <Link href="/signup" className="btn-gold !px-4 !py-1.5 text-sm">
                {t("nav.join")}
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
