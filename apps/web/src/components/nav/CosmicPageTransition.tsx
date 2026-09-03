"use client";

/**
 * Arrival, not departure: each page fades up as it mounts (about half a
 * second, opacity only, so nothing fixed or sticky inside is disturbed and
 * the back button behaves exactly as native). There is deliberately no exit
 * animation: outgoing pages leave instantly, which keeps navigation feeling
 * fast and keeps scroll restoration honest. Reduced motion turns it off.
 */
import { usePathname } from "next/navigation";

export function CosmicPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  return (
    <div key={pathname} className="page-arrive">
      {children}
    </div>
  );
}
