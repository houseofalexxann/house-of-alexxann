/**
 * Transparent celestial decor: oversized planetary glyphs and tarot-card
 * silhouettes floating at whisper opacity in the flag palette. Pure
 * decoration — fixed, non-interactive, hidden from assistive tech.
 */
const GLYPHS: { g: string; x: string; y: string; size: number; color: string; rotate: number }[] = [
  { g: "☽", x: "6%", y: "16%", size: 130, color: "#5bcefa", rotate: -12 },
  { g: "☉", x: "88%", y: "12%", size: 110, color: "#f5a9b8", rotate: 8 },
  { g: "♀", x: "12%", y: "62%", size: 100, color: "#f5a9b8", rotate: -6 },
  { g: "☿", x: "82%", y: "48%", size: 95, color: "#b8a6dc", rotate: 10 },
  { g: "♃", x: "45%", y: "84%", size: 120, color: "#5bcefa", rotate: -8 },
  { g: "♄", x: "68%", y: "78%", size: 90, color: "#f5a9b8", rotate: 14 },
];

const CARDS: { x: string; y: string; rotate: number; color: string; motif: string }[] = [
  { x: "24%", y: "28%", rotate: -14, color: "#f5a9b8", motif: "✶" },
  { x: "72%", y: "26%", rotate: 10, color: "#5bcefa", motif: "☽" },
  { x: "30%", y: "72%", rotate: 8, color: "#b8a6dc", motif: "☉" },
];

export function CosmicDecor() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-[1] select-none overflow-hidden">
      {GLYPHS.map((item, i) => (
        <span
          key={`g${i}`}
          className="astro-glyph absolute"
          style={{
            left: item.x,
            top: item.y,
            fontSize: item.size,
            color: item.color,
            opacity: 0.07,
            transform: `rotate(${item.rotate}deg)`,
            lineHeight: 1,
          }}
        >
          {item.g}︎
        </span>
      ))}
      {CARDS.map((c, i) => (
        <span
          key={`c${i}`}
          className="absolute flex items-center justify-center rounded-xl border-2"
          style={{
            left: c.x,
            top: c.y,
            width: 84,
            height: 132,
            borderColor: c.color,
            opacity: 0.06,
            transform: `rotate(${c.rotate}deg)`,
          }}
        >
          <span className="astro-glyph" style={{ fontSize: 34, color: c.color }}>
            {c.motif}︎
          </span>
        </span>
      ))}
    </div>
  );
}
