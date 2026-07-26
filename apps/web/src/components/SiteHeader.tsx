"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n";
import { useUser } from "./UserProvider";
import { SiteSearch } from "./SiteSearch";
import { CosmicAtlas } from "./nav/CosmicAtlas";
import { regionFor } from "@/lib/celestial-map";

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

/** Personal rooms, shown only once there is a person to show them to. */
const MEMBER_NAV = [{ href: "/calendar", key: "nav.calendar" }];

/**
 * The Celestial Compass: the ordinary navigation the site has always had,
 * plus a way into the star atlas and a quiet note of where you are. The
 * conventional links stay first in the DOM, so nothing depends on the map.
 */
export function SiteHeader() {
  const { t } = useLocale();
  const { user } = useUser();
  const pathname = usePathname() ?? "/";
  const [atlasOpen, setAtlasOpen] = useState(false);
  const here = regionFor(pathname);

  return (
    <>
      {/* The atlas lives OUTSIDE the header on purpose: the header's
          backdrop-blur creates a containing block, which would trap a
          position:fixed overlay inside the header's own box. */}
      <CosmicAtlas
        open={atlasOpen}
        onClose={() => setAtlasOpen(false)}
        currentHref={here?.href}
      />
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

        {here && here.href !== "/" && (
          <span className="hidden items-center gap-1.5 rounded-full border border-pearl-300 bg-white/60 px-3 py-1 text-xs text-ink-500 lg:inline-flex">
            <span aria-hidden className="astro-glyph text-rose-500">{here.glyph}</span>
            <span className="italic">{here.name}</span>
          </span>
        )}

        <nav className="ml-auto flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm" aria-label="Main">
          {[...NAV, ...(user ? MEMBER_NAV : [])].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-3 py-1.5 text-ink-700 transition-colors hover:bg-pearl-200 hover:text-ink-900"
            >
              {t(item.key)}
            </Link>
          ))}

          <button
            type="button"
            onClick={() => setAtlasOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={atlasOpen}
            className="whitespace-nowrap rounded-full border border-pearl-400 bg-white/70 px-3 py-1.5 text-ink-700 transition-colors hover:border-rose-400 hover:text-ink-900"
          >
            <span aria-hidden className="text-rose-500">✧</span> Explore
          </button>

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
                className="ml-1 rounded-full px-3 py-1.5 text-ink-700 transition-colors hover:bg-pearl-200 hover:text-ink-900"
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
    </>
  );
}
