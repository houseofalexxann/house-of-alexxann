"use client";

/**
 * Each region of the House has its own weather: a soft wash of the region's
 * colour high in the sky behind every page of that section (the Solar
 * Constellation runs gold, the Lunar Mansions indigo, the Arcana violet).
 * It arrives with a slow fade and never moves. Observatory routes (forms,
 * payment, the admin) and the homepage, which has its own film, stay bare.
 */
import { usePathname } from "next/navigation";
import { isObservatory, regionFor } from "@/lib/celestial-map";

export function RegionAtmosphere() {
  const pathname = usePathname() ?? "/";
  if (pathname === "/" || isObservatory(pathname)) return null;
  const region = regionFor(pathname);
  if (!region) return null;
  const { glow } = region.tone;

  return (
    <div
      key={region.href}
      aria-hidden
      className="region-atmosphere"
      style={{
        background: `
          radial-gradient(ellipse 70% 42% at 50% -12%, rgba(${glow}, 0.20), transparent 68%),
          radial-gradient(ellipse 34% 26% at 92% 36%, rgba(${glow}, 0.08), transparent 70%)
        `,
      }}
    />
  );
}
