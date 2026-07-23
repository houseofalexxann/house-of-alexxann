"use client";

/**
 * The ambient cosmos, everywhere: a fixed 3D starfield behind every page —
 * slow forward drift plus scroll parallax by depth, pastel stars tuned for
 * the pearl ground, two faint wandering orbs. The homepage's opening film is
 * the grand version; this is the same universe at rest. Static single frame
 * under prefers-reduced-motion.
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

      // Parallax starfield: slow forward drift + page scroll moving the
      // depths at different speeds — the site floats in a dimensional sky.
      const travel = t / 140000;
      const scroll = window.scrollY;
      for (const s of stars) {
        let zt = s.z - (travel % 1.35);
        zt = ((zt - 0.25) % 1.35 + 1.35) % 1.35 + 0.25;
        const proj = 0.6 / zt;
        const near = Math.min(1, (1.6 - zt) / 1.1);
        const sx = cx + s.x * w * 0.5 * proj;
        const sy = cy + s.y * h * 0.5 * proj - scroll * (0.02 + 0.07 * near);
        const wy = ((sy % (h + 40)) + h + 40) % (h + 40) - 20;
        if (sx < -10 || sx > w + 10) continue;
        const twk = reduced ? 0.8 : 0.55 + 0.45 * Math.sin(t / 1100 + s.tw);
        const alpha = (0.16 + 0.3 * near) * twk;
        const radius = s.r * (0.5 + proj * 0.7);
        if (near > 0.8 && !mobile) {
          ctx.fillStyle = `rgba(${s.color}, ${(alpha * 0.3).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sx, wy, radius * 3.2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(${s.color}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sx, wy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
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
