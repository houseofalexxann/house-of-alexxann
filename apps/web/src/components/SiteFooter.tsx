"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n";
import { LOCALES } from "@/lib/i18n/dictionaries";

export function SiteFooter() {
  const { t, locale, setLocale } = useLocale();
  return (
    <footer className="mt-24 border-t border-pearl-300/60 bg-pearl-50/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-heading text-lg text-ink-900">
            <span aria-hidden className="text-rose-600">✦</span> House of Alexxann
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-500">
            {t("footer.tagline")}
          </p>
          <label className="mt-4 flex items-center gap-2 text-sm text-ink-500">
            <span aria-hidden>🌐</span>
            <span className="sr-only">Language</span>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as typeof locale)}
              className="rounded-lg border border-pearl-400 bg-white/80 px-2 py-1 text-sm text-ink-900"
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
          {locale !== "en" && (
            <p className="mt-2 max-w-xs text-xs text-ink-400">{t("footer.langNote")}</p>
          )}
        </div>
        <nav className="text-sm" aria-label="Footer">
          <p className="mb-3 font-semibold uppercase tracking-widest text-ink-400">
            {t("footer.explore")}
          </p>
          <ul className="space-y-2 text-ink-700">
            <li><Link className="hover:text-rose-600" href="/studio">{t("nav.studio")}</Link></li>
            <li><Link className="hover:text-rose-600" href="/services">{t("footer.pricing")}</Link></li>
            <li><Link className="hover:text-rose-600" href="/codex">{t("nav.codex")}</Link></li>
            <li><Link className="hover:text-rose-600" href="/about">{t("footer.aboutAlexandria")}</Link></li>
            <li><Link className="hover:text-rose-600" href="/faq">{t("footer.faq")}</Link></li>
            <li><Link className="hover:text-rose-600" href="/donate">{t("footer.donate")}</Link></li>
            <li><Link className="hover:text-rose-600" href="/accessibility">{t("footer.accessibility")}</Link></li>
          </ul>
        </nav>
        <div className="text-sm text-ink-500">
          <p className="mb-3 font-semibold uppercase tracking-widest text-ink-400">
            {t("footer.yourData")}
          </p>
          <p className="leading-relaxed">{t("footer.dataNote")}</p>
        </div>
      </div>
      <div className="border-t border-pearl-200 py-4 text-center text-xs text-ink-400">
        © {new Date().getFullYear()} House of Alexxann · {t("footer.crafted")}
      </div>
    </footer>
  );
}
