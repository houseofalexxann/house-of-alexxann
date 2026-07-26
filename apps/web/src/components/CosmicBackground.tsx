"use client";

/**
 * The ambient cosmos, everywhere — and the site as one living constellation.
 * A fixed 3D starfield behind every page (slow drift + scroll parallax by
 * depth), the twelve zodiac constellations assembling themselves one at a
 * time among the stars — lines drawing in, glyph glowing faintly — and, on
 * pointer devices, stars near the cursor linking into a delicate traveling
 * web. Tuned for the pearl ground; static single frame under
 * prefers-reduced-motion.
 */
import { useEffect, useRef } from "react";

interface Star3D {
  x: number;
  y: number;
  z: number;
  r: number;
  color: string;
  tw: number;
}

const COLORS = ["212, 99, 143", "62, 157, 203", "159, 138, 208", "209, 168, 106"];
const LINE = "159, 138, 208"; // lilac constellation thread

/** Stylized zodiac constellations: normalized points + edge pairs + glyph. */
const ZODIAC: { glyph: string; pts: [number, number][]; edges: [number, number][] }[] = [
  { glyph: "♈︎", pts: [[0.1, 0.7], [0.35, 0.45], [0.6, 0.3], [0.82, 0.36]], edges: [[0, 1], [1, 2], [2, 3]] },
  { glyph: "♉︎", pts: [[0.2, 0.15], [0.35, 0.4], [0.5, 0.55], [0.65, 0.4], [0.8, 0.1], [0.48, 0.78]], edges: [[0, 1], [1, 2], [4, 3], [3, 2], [2, 5]] },
  { glyph: "♊︎", pts: [[0.3, 0.15], [0.3, 0.45], [0.28, 0.78], [0.62, 0.12], [0.64, 0.45], [0.66, 0.8]], edges: [[0, 1], [1, 2], [3, 4], [4, 5], [0, 3], [1, 4]] },
  { glyph: "♋︎", pts: [[0.45, 0.1], [0.5, 0.45], [0.25, 0.8], [0.75, 0.75]], edges: [[0, 1], [1, 2], [1, 3]] },
  { glyph: "♌︎", pts: [[0.78, 0.18], [0.6, 0.1], [0.45, 0.18], [0.42, 0.36], [0.52, 0.48], [0.22, 0.78], [0.72, 0.72]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 6], [6, 5], [5, 3]] },
  { glyph: "♍︎", pts: [[0.5, 0.08], [0.45, 0.34], [0.3, 0.55], [0.56, 0.6], [0.25, 0.85], [0.7, 0.82], [0.76, 0.38]], edges: [[0, 1], [1, 2], [1, 6], [2, 3], [2, 4], [3, 5]] },
  { glyph: "♎︎", pts: [[0.5, 0.14], [0.26, 0.5], [0.74, 0.46], [0.2, 0.85], [0.8, 0.8]], edges: [[0, 1], [0, 2], [1, 2], [1, 3], [2, 4]] },
  { glyph: "♏︎", pts: [[0.16, 0.1], [0.22, 0.28], [0.3, 0.46], [0.38, 0.62], [0.5, 0.76], [0.66, 0.82], [0.8, 0.74], [0.84, 0.58]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7]] },
  { glyph: "♐︎", pts: [[0.3, 0.35], [0.5, 0.24], [0.7, 0.34], [0.76, 0.6], [0.56, 0.72], [0.34, 0.64]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [1, 4]] },
  { glyph: "♑︎", pts: [[0.2, 0.4], [0.5, 0.28], [0.8, 0.44], [0.66, 0.72], [0.34, 0.66]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]] },
  { glyph: "♒︎", pts: [[0.14, 0.42], [0.34, 0.3], [0.54, 0.44], [0.74, 0.3], [0.86, 0.44], [0.3, 0.68], [0.6, 0.72]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [1, 5], [5, 6], [6, 2]] },
  { glyph: "♓︎", pts: [[0.18, 0.2], [0.3, 0.45], [0.45, 0.65], [0.65, 0.76], [0.85, 0.62], [0.8, 0.35]], edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] },
];

/** Corner placements the constellations rotate through (clear of headlines). */
const PLACES: [number, number][] = [
  [0.62, 0.08],
  [0.05, 0.42],
  [0.58, 0.55],
  [0.08, 0.06],
];

const CYCLE_MS = 15000; // one constellation's full life
const HOLD = 0.55; // fraction of cycle at full glow

export function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.innerWidth < 640;
    const stars: Star3D[] = Array.from({ length: mobile ? 70 : 150 }, (_, i) => ({
      x: (Math.random() * 2 - 1) * 1.3,
      y: (Math.random() * 2 - 1) * 1.3,
      z: 0.25 + Math.random() * 1.35,
      r: 0.5 + Math.random() * 1.4,
      color: COLORS[i % COLORS.length],
      tw: Math.random() * Math.PI * 2,
    }));

    // Pointer web state (desktop only).
    let mx = -9999;
    let my = -9999;
    const onPointer = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const onLeave = () => {
      mx = -9999;
      my = -9999;
    };
    if (!mobile && !reduced) {
      window.addEventListener("pointermove", onPointer, { passive: true });
      window.addEventListener("pointerleave", onLeave);
    }

    let raf = 0;
    let running = true;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const smooth = (v: number) => v * v * (3 - 2 * v);

    const drawConstellation = (t: number, w: number, h: number) => {
      const cycle = Math.floor(t / CYCLE_MS);
      const phase = (t % CYCLE_MS) / CYCLE_MS;
      const which = ZODIAC[cycle % 12];
      const place = PLACES[cycle % PLACES.length];
      const size = Math.min(w, h) * (mobile ? 0.42 : 0.34);
      const ox = place[0] * w;
      const oy = place[1] * h;

      // Alpha envelope: rise, hold, dissolve.
      const rise = 0.18;
      let env: number;
      if (phase < rise) env = smooth(phase / rise);
      else if (phase < rise + HOLD) env = 1;
      else env = 1 - smooth((phase - rise - HOLD) / (1 - rise - HOLD));
      const alpha = env * 0.5;
      if (alpha <= 0.01) return;

      // Edges draw themselves in during the rise.
      const drawn = phase < rise ? smooth(phase / rise) : 1;
      const px = which.pts.map(([x, y]) => [ox + x * size, oy + y * size] as const);

      ctx.strokeStyle = `rgba(${LINE}, ${(alpha * 0.55).toFixed(3)})`;
      ctx.lineWidth = 1;
      which.edges.forEach(([a, b], i) => {
        const edgeStart = i / which.edges.length;
        const local = Math.min(1, Math.max(0, (drawn - edgeStart) * which.edges.length));
        if (local <= 0) return;
        const [x1, y1] = px[a];
        const [x2, y2] = px[b];
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x1 + (x2 - x1) * local, y1 + (y2 - y1) * local);
        ctx.stroke();
      });

      // Constellation stars: brighter, with a soft rose bloom.
      for (const [x, y] of px) {
        ctx.fillStyle = `rgba(212, 99, 143, ${(alpha * 0.4).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 252, 250, ${Math.min(1, alpha * 1.6).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, 1.7, 0, Math.PI * 2);
        ctx.fill();
      }

      // The sign's glyph, breathing faintly beside its stars.
      ctx.font = `${Math.round(size * 0.16)}px serif`;
      ctx.fillStyle = `rgba(${LINE}, ${(alpha * 0.5).toFixed(3)})`;
      ctx.fillText(which.glyph, ox + size * 0.86, oy + size * 0.16);
    };

    const draw = (t: number) => {
      if (!running) return;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      // Two faint wandering orbs — planets at the edge of attention.
      const orbs = [
        { x: 0.82 + Math.sin(t / 23000) * 0.03, y: 0.2 + Math.cos(t / 27000) * 0.04, r: 0.09, c: "245, 169, 184" },
        { x: 0.12 + Math.cos(t / 31000) * 0.03, y: 0.72 + Math.sin(t / 26000) * 0.03, r: 0.12, c: "121, 196, 240" },
      ];
      for (const o of orbs) {
        const g = ctx.createRadialGradient(o.x * w, o.y * h, 0, o.x * w, o.y * h, o.r * h);
        g.addColorStop(0, `rgba(${o.c}, 0.14)`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, w, h);
      }

      // Parallax starfield, collecting screen positions for the cursor web.
      const travel = t / 140000;
      const scroll = window.scrollY;
      const near: [number, number][] = [];
      for (const s of stars) {
        let zt = s.z - (travel % 1.35);
        zt = ((zt - 0.25) % 1.35 + 1.35) % 1.35 + 0.25;
        const proj = 0.6 / zt;
        const nearness = Math.min(1, (1.6 - zt) / 1.1);
        const sx = cx + s.x * w * 0.5 * proj;
        const sy = cy + s.y * h * 0.5 * proj - scroll * (0.02 + 0.07 * nearness);
        const wy = ((sy % (h + 40)) + h + 40) % (h + 40) - 20;
        if (sx < -10 || sx > w + 10) continue;
        const twk = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(t / 1100 + s.tw);
        const alpha = (0.16 + 0.3 * nearness) * twk;
        const radius = s.r * (0.5 + proj * 0.7);
        if (nearness > 0.8 && !mobile) {
          ctx.fillStyle = `rgba(${s.color}, ${(alpha * 0.3).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sx, wy, radius * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(${s.color}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sx, wy, radius, 0, Math.PI * 2);
        ctx.fill();

        const dm = Math.hypot(sx - mx, wy - my);
        if (dm < 150) near.push([sx, wy]);
      }

      // The cursor gathers constellations: nearby stars link into a web.
      if (near.length > 1) {
        for (let i = 0; i < near.length; i++) {
          for (let j = i + 1; j < near.length; j++) {
            const d = Math.hypot(near[i][0] - near[j][0], near[i][1] - near[j][1]);
            if (d > 110) continue;
            const a =
              0.22 *
              (1 - d / 110) *
              (1 - Math.hypot((near[i][0] + near[j][0]) / 2 - mx, (near[i][1] + near[j][1]) / 2 - my) / 150);
            if (a <= 0.01) continue;
            ctx.strokeStyle = `rgba(${LINE}, ${a.toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(near[i][0], near[i][1]);
            ctx.lineTo(near[j][0], near[j][1]);
            ctx.stroke();
          }
        }
      }

      // One zodiac constellation at a time, assembling among the stars.
      drawConstellation(reduced ? CYCLE_MS * 0.4 : t, w, h);

      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
