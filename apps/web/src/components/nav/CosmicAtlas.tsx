"use client";

/**
 * The Cosmic Atlas: a full-screen star map of the House.
 *
 * Accessibility is structural here, not decorative:
 * - every node is a real <Link> with a real href, tabbable in reading order
 * - the star field is inert SVG behind them, aria-hidden, holding no meaning
 * - a plain list renders alongside the map on every viewport, so nobody is
 *   required to read a constellation to navigate
 * - focus is trapped while open, Escape closes, and focus returns to the
 *   trigger; hover and keyboard focus produce the identical highlight
 */
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ALL_REGIONS, CELESTIAL_MAP, HOUSE_CENTER, type CelestialRegion } from "@/lib/celestial-map";

const FOCUSABLE = 'a[href], button:not([disabled])';

export function CosmicAtlas({
  open,
  onClose,
  currentHref,
}: {
  open: boolean;
  onClose: () => void;
  currentHref?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);

  // Focus management: first node on open, restore to the opener on close.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      opener?.focus?.();
    };
  }, [open]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const items = panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!items || items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [onClose]
  );

  if (!open) return null;

  const lit = (r: CelestialRegion) =>
    !active || active === r.href || r.neighbors.includes(active);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Explore the universe"
      onKeyDown={onKeyDown}
      style={{
        // The night itself, painted on the dialog so it always covers the
        // page beneath (a negatively-stacked child would sit behind it).
        background:
          "radial-gradient(ellipse 70% 55% at 30% 20%, rgba(245,169,184,0.16), transparent 62%)," +
          "radial-gradient(ellipse 60% 50% at 76% 72%, rgba(91,206,250,0.14), transparent 60%)," +
          "linear-gradient(180deg, #17121F 0%, #241B30 100%)",
      }}
    >

      <div ref={panelRef} className="mx-auto min-h-full max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-rose-300">
            Explore the universe
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/25 px-4 py-2 text-sm text-white/85 transition-colors hover:border-rose-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
          >
            Close
          </button>
        </div>

        {/* ——— The star map (decorative canvas + real links on top) ——— */}
        <div className="relative mt-5 hidden aspect-[16/10] w-full sm:block">
          <svg
            aria-hidden
            viewBox="0 0 1000 625"
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
          >
            {ALL_REGIONS.flatMap((r) =>
              r.neighbors.map((n) => {
                const to = ALL_REGIONS.find((x) => x.href === n);
                if (!to || to.href < r.href) return null;
                const on = !active || active === r.href || active === to.href;
                return (
                  <line
                    key={`${r.href}-${n}`}
                    x1={r.x * 1000}
                    y1={r.y * 625}
                    x2={to.x * 1000}
                    y2={to.y * 625}
                    stroke="#B8A6DC"
                    strokeOpacity={on ? 0.5 : 0.14}
                    strokeWidth="1"
                    style={{ transition: "stroke-opacity 180ms ease" }}
                  />
                );
              })
            )}
          </svg>

          {[HOUSE_CENTER, ...CELESTIAL_MAP].map((r) => {
            const isHere = currentHref === r.href;
            return (
              <Link
                key={r.href}
                href={r.href}
                onClick={onClose}
                onMouseEnter={() => setActive(r.href)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(r.href)}
                onBlur={() => setActive(null)}
                aria-current={isHere ? "page" : undefined}
                className="group absolute flex w-40 -translate-x-1/2 -translate-y-1/2 flex-col items-center rounded-2xl px-3 py-2 text-center transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-rose-300"
                style={{
                  left: `${r.x * 100}%`,
                  top: `${r.y * 100}%`,
                  opacity: lit(r) ? 1 : 0.35,
                }}
              >
                <span
                  aria-hidden
                  className="astro-glyph transition-transform group-hover:scale-110 group-focus-visible:scale-110"
                  style={{
                    fontSize: `${1 + r.magnitude * 0.9}rem`,
                    color: isHere ? "#F5A9B8" : "#FDFCFC",
                    textShadow: `0 0 ${8 + r.magnitude * 16}px rgba(245,169,184,${0.35 + r.magnitude * 0.4})`,
                  }}
                >
                  {r.glyph}
                </span>
                <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                  {r.plain}
                </span>
                <span className="text-[10px] italic leading-tight text-rose-200/80">{r.name}</span>
                {isHere && (
                  <span className="mt-0.5 text-[9px] uppercase tracking-widest text-rose-300">
                    you are here
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* ——— The list: a peer, not a fallback ——— */}
        <div className="mt-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-white/60">
            Every destination
          </h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {[HOUSE_CENTER, ...CELESTIAL_MAP].map((r) => {
              const isHere = currentHref === r.href;
              return (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    onClick={onClose}
                    aria-current={isHere ? "page" : undefined}
                    className="flex min-h-14 items-start gap-3 rounded-xl border border-white/12 bg-white/5 px-4 py-3 transition-colors hover:border-rose-300/60 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
                  >
                    <span aria-hidden className="astro-glyph mt-0.5 text-lg text-rose-300">
                      {r.glyph}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-white">
                        {r.plain}
                        {isHere && (
                          <span className="ml-2 text-[10px] uppercase tracking-widest text-rose-300">
                            you are here
                          </span>
                        )}
                      </span>
                      <span className="block text-xs leading-relaxed text-white/60">{r.blurb}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
