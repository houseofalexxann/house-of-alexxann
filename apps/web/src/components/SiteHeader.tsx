"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { SiteSearch } from "./SiteSearch";

const NAV = [
  { href: "/studio", key: "nav.studio" },
  { href: "/transits", key: "nav.transits" },
  { href: "/human-design", key: "nav.humanDesign" },
  { href: "/tarot", key: "nav.tarot" },
  { href: "/services", key: "nav.readings" },
  { href: "/codex", key: "nav.codex" },
];

export function SiteHeader() {
  const { t } = useLocale();
  return (
    <header className="sticky top-0 z-40 border-b border-pearl-300/60 bg-pearl-50/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
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
          <Link href="/services" className="btn-gold ml-1.5 !px-4 !py-1.5 text-sm">
            {t("nav.book")}
          </Link>
        </nav>
      </div>
    </header>
  );
}
