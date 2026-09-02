"use client";

/**
 * A location trail drawn as a flight path — semantically an ordinary
 * breadcrumb (<nav aria-label="Breadcrumb"> with an ordered list), visually
 * a dotted line between lit points. "✦ The House → ◐ The Living Orbit".
 * Hidden on the home page (you are at the center) and in the admin.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HOUSE_CENTER, regionFor } from "@/lib/celestial-map";

function humanize(segment: string): string {
  const s = decodeURIComponent(segment).replace(/[-_]+/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function Path() {
  return (
    <svg aria-hidden width="28" height="10" viewBox="0 0 28 10" className="mx-1 shrink-0 text-pearl-500">
      <line x1="1" y1="5" x2="27" y2="5" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
      <circle cx="27" cy="5" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function CelestialBreadcrumbs() {
  const pathname = usePathname() ?? "/";
  if (pathname === "/" || pathname.startsWith("/admin")) return null;
  const region = regionFor(pathname);
  if (!region) return null;

  const leafSegments = pathname
    .slice(region.href.length)
    .split("/")
    .filter(Boolean);
  const leaf = leafSegments.length > 0 ? humanize(leafSegments[leafSegments.length - 1]) : null;

  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
      <ol className="flex flex-wrap items-center text-xs text-ink-500">
        <li className="flex items-center">
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:text-ink-900">
            <span aria-hidden className="astro-glyph text-rose-400">{HOUSE_CENTER.glyph}</span>
            The House
          </Link>
          <Path />
        </li>
        <li className="flex items-center">
          {leaf ? (
            <>
              <Link
                href={region.href}
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:text-ink-900"
              >
                <span aria-hidden className="astro-glyph text-rose-400">{region.glyph}</span>
                <span className="italic">{region.name}</span>
              </Link>
              <Path />
            </>
          ) : (
            <span aria-current="page" className="inline-flex items-center gap-1.5 px-2 py-1 text-ink-900">
              <span aria-hidden className="astro-glyph text-rose-400">{region.glyph}</span>
              <span className="italic">{region.name}</span>
            </span>
          )}
        </li>
        {leaf && (
          <li>
            <span aria-current="page" className="px-2 py-1 text-ink-900">
              {leaf}
            </span>
          </li>
        )}
      </ol>
    </nav>
  );
}
