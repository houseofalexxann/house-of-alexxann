/**
 * A drawn moon: the eight phases as real geometry (lit region between the
 * limb and the terminator ellipse), never an emoji. Light grows on the
 * right while waxing, retreats to the left while waning — the northern-sky
 * convention used throughout the House.
 */
export function MoonPhaseIcon({ phase, size = 22 }: { phase: string; size?: number }) {
  const lit = "#f6e9d8";
  const dark = "#251c31";
  const rim = "rgba(246, 233, 216, 0.4)";

  const p = phase.toLowerCase();
  let litPath: string | null = null;
  let full = false;

  if (p.startsWith("full")) full = true;
  else if (p.startsWith("waxing crescent")) litPath = "M12,2 A10,10 0 0 1 12,22 A6.5,10 0 0 0 12,2";
  else if (p.startsWith("first quarter")) litPath = "M12,2 A10,10 0 0 1 12,22 L12,2";
  else if (p.startsWith("waxing gibbous")) litPath = "M12,2 A10,10 0 0 1 12,22 A6.5,10 0 0 1 12,2";
  else if (p.startsWith("waning gibbous")) litPath = "M12,2 A10,10 0 0 0 12,22 A6.5,10 0 0 0 12,2";
  else if (p.startsWith("last quarter") || p.startsWith("third quarter"))
    litPath = "M12,2 A10,10 0 0 0 12,22 L12,2";
  else if (p.startsWith("waning crescent")) litPath = "M12,2 A10,10 0 0 0 12,22 A6.5,10 0 0 1 12,2";
  // "new moon" and anything unrecognized: dark disc.

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <circle cx="12" cy="12" r="10" fill={full ? lit : dark} stroke={rim} strokeWidth="1" />
      {litPath && <path d={litPath} fill={lit} />}
    </svg>
  );
}
