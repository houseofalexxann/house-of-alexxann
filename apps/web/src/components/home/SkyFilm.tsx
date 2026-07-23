"use client";

/**
 * The opening film: a pinned, scroll-scrubbed swim UP through the universe —
 * a 3D perspective starfield streaming past, pastel nebulae, a drifting
 * spiral galaxy, and the luminaries themselves (Moon, Sun, Venus, Saturn,
 * Jupiter) escorting the traveler chapter by chapter, dusk into deep space
 * and out into dawn. Trans-pastel palette throughout. Honors
 * prefers-reduced-motion with a static hero.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Chapter {
  key: string;
  rail: string;
  glyph: string;
  eyebrow?: string;
  title: string;
  line: string;
  href?: string;
  cta?: string;
}

// Copy reused verbatim from the existing hero + door blurbs (copy-audit safe).
const CHAPTERS: Chapter[] = [
  {
    key: "arrival",
    rail: "The sky",
    glyph: "✦",
    eyebrow: "Western · Vedic · Modern & Mystical",
    title: "The sky you were born under still remembers you.",
    line: "Cast your natal chart free — Western or Vedic, computed with professional-grade precision — then sit with Alexandria for a reading that makes it yours.",
  },
  {
    key: "western",
    rail: "The chart",
    glyph: "♈︎",
    title: "Western astrology",
    line: "Your tropical natal chart — wheel, houses, aspects, the deeper dignities. Free, always.",
    href: "/western",
    cta: "Cast your chart — free",
  },
  {
    key: "vedic",
    rail: "Jyotish",
    glyph: "☽︎",
    title: "Vedic · Jyotish",
    line: "The sidereal sky: nakshatras with padas & lords, Rasi & Navamsa, your dasha timeline.",
    href: "/vedic",
    cta: "Enter the sidereal sky",
  },
  {
    key: "now",
    rail: "The sky now",
    glyph: "☉︎",
    title: "The sky now",
    line: "Today's astro weather free — the 7-day forecast for Venusian Dolls.",
    href: "/transits",
    cta: "Read today's sky",
  },
  {
    key: "house",
    rail: "The House",
    glyph: "✧",
    title: "Sit with Alexandria",
    line: "Natal, Vedic, transits, solar return. Sliding scale, every way to pay.",
    href: "/services",
    cta: "Book a reading",
  },
];

/* ————— 3D world ————— */

interface Star3D {
  x: number; // -1..1 world
  y: number; // -1..1 world
  z: number; // depth 0.14..1.7
  r: number;
  hue: "rose" | "sky" | "pearl" | "gold";
  tw: number;
}

const STAR_COLORS = {
  rose: "245, 169, 184",
  sky: "121, 216, 252",
  pearl: "255, 252, 250",
  gold: "250, 226, 188",
} as const;

function makeStars(count: number): Star3D[] {
  const hues: Star3D["hue"][] = ["pearl", "sky", "rose", "pearl", "gold", "sky", "pearl"];
  return Array.from({ length: count }, (_, i) => ({
    x: (Math.random() * 2 - 1) * 1.4,
    y: (Math.random() * 2 - 1) * 1.4,
    z: 0.14 + Math.random() * 1.56,
    r: 0.5 + Math.random() * 1.6,
    hue: hues[i % hues.length],
    tw: Math.random() * Math.PI * 2,
  }));
}

/** Pre-rendered glowing sphere sprite: the 3D look, drawn once. */
function makeOrb(
  size: number,
  core: string,
  mid: string,
  glow: string,
  opts?: { ring?: string; craters?: boolean; bands?: string }
): HTMLCanvasElement {
  const c = document.createElement("canvas");
  const pad = size; // room for the halo
  c.width = c.height = size * 2 + pad * 2;
  const ctx = c.getContext("2d")!;
  const cx = c.width / 2;
  const R = size;

  // Halo
  const halo = ctx.createRadialGradient(cx, cx, R * 0.4, cx, cx, R * 1.9);
  halo.addColorStop(0, glow);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, c.width, c.height);

  // Ring behind (drawn before sphere, upper arc hidden by it)
  if (opts?.ring) {
    ctx.save();
    ctx.translate(cx, cx);
    ctx.rotate(-0.35);
    ctx.strokeStyle = opts.ring;
    ctx.lineWidth = R * 0.22;
    ctx.beginPath();
    ctx.ellipse(0, 0, R * 1.75, R * 0.55, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // Sphere, lit from upper-left — this gradient is what reads as 3D.
  const sph = ctx.createRadialGradient(cx - R * 0.42, cx - R * 0.45, R * 0.1, cx, cx, R);
  sph.addColorStop(0, core);
  sph.addColorStop(0.62, mid);
  sph.addColorStop(1, "rgba(20, 12, 34, 0.92)");
  ctx.fillStyle = sph;
  ctx.beginPath();
  ctx.arc(cx, cx, R, 0, Math.PI * 2);
  ctx.fill();

  if (opts?.bands) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cx, R, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = opts.bands;
    ctx.fillRect(cx - R, cx - R * 0.28, R * 2, R * 0.16);
    ctx.fillRect(cx - R, cx + R * 0.1, R * 2, R * 0.12);
    ctx.fillRect(cx - R, cx + R * 0.42, R * 2, R * 0.08);
    ctx.restore();
  }

  if (opts?.craters) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cx, R, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = "rgba(160, 150, 175, 0.25)";
    [[-0.25, 0.1, 0.16], [0.28, -0.2, 0.11], [0.05, 0.42, 0.09], [0.42, 0.3, 0.07]].forEach(
      ([dx, dy, dr]) => {
        ctx.beginPath();
        ctx.arc(cx + dx * R, cx + dy * R, dr * R, 0, Math.PI * 2);
        ctx.fill();
      }
    );
    ctx.restore();
  }

  // Ring front (lower arc over the sphere)
  if (opts?.ring) {
    ctx.save();
    ctx.translate(cx, cx);
    ctx.rotate(-0.35);
    ctx.strokeStyle = opts.ring;
    ctx.lineWidth = R * 0.22;
    ctx.beginPath();
    ctx.ellipse(0, 0, R * 1.75, R * 0.55, 0, 0, Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  return c;
}

/** Soft nebula cloud sprite. */
function makeNebula(size: number, rgb: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  for (let i = 0; i < 7; i++) {
    const x = size / 2 + (Math.random() - 0.5) * size * 0.5;
    const y = size / 2 + (Math.random() - 0.5) * size * 0.5;
    const r = size * (0.18 + Math.random() * 0.28);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${rgb}, 0.16)`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return c;
}

/** Spiral galaxy sprite — two logarithmic arms of pastel points. */
function makeGalaxy(size: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const cx = size / 2;
  const core = ctx.createRadialGradient(cx, cx, 0, cx, cx, size * 0.16);
  core.addColorStop(0, "rgba(255, 250, 240, 0.9)");
  core.addColorStop(1, "rgba(245, 169, 184, 0)");
  ctx.fillStyle = core;
  ctx.fillRect(0, 0, size, size);
  for (let arm = 0; arm < 2; arm++) {
    for (let i = 0; i < 260; i++) {
      const t = i / 260;
      const angle = arm * Math.PI + t * 4.4 + (Math.random() - 0.5) * 0.5;
      const radius = size * 0.06 + t * size * 0.42 * (0.85 + Math.random() * 0.3);
      const x = cx + Math.cos(angle) * radius;
      const y = cx + Math.sin(angle) * radius * 0.42; // inclined disc
      const cols = ["255,252,250", "121,216,252", "245,169,184"];
      ctx.fillStyle = `rgba(${cols[i % 3]}, ${(0.55 * (1 - t)).toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, (1 - t) * 1.8 + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  return c;
}

/** A luminary's flight: enters far away in its band, swims past and exits. */
interface Flight {
  sprite: HTMLCanvasElement;
  p0: number; // progress where it appears (far)
  p1: number; // progress where it has passed (near, off-edge)
  fromX: number; // world x at far
  toX: number; // world x at near (off to a side)
  toY: number; // vertical exit (we swim up — things pass downward)
  base: number; // size at z=1 (as a fraction of viewport height)
}

export function SkyFilm() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringRef = useRef<SVGSVGElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const [reduced, setReduced] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reduced !== false) return;
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Reloads/back-navigations restore scroll into the middle of the film —
    // a film starts from its first frame. Take over restoration and watch a
    // short window; a real user scroll cancels instantly.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    const navEntry = performance.getEntriesByType?.("navigation")[0] as
      | PerformanceNavigationTiming
      | undefined;
    const isRestore = navEntry?.type === "reload" || navEntry?.type === "back_forward";
    let userMoved = false;
    const mark = () => {
      userMoved = true;
    };
    window.addEventListener("wheel", mark, { once: true, passive: true });
    window.addEventListener("touchstart", mark, { once: true, passive: true });
    window.addEventListener("keydown", mark, { once: true });
    const snapIfRestored = () => {
      if (
        isRestore &&
        !userMoved &&
        window.scrollY > 0 &&
        window.scrollY < wrap.offsetHeight - window.innerHeight
      ) {
        window.scrollTo(0, 0);
      }
    };
    snapIfRestored();
    const snapTimers = [150, 400, 800].map((ms) => setTimeout(snapIfRestored, ms));

    const mobile = window.innerWidth < 640;
    const stars = makeStars(mobile ? 210 : 420);

    // The escort: Moon greets you, the Sun crowns the Western chapter,
    // Venus attends Jyotish, Saturn keeps time for the sky-now, Jupiter
    // blesses the House. Sizes are fractions of viewport height at z=1.
    const flights: Flight[] = [
      {
        sprite: makeOrb(mobile ? 40 : 64, "#FFFDF8", "#E7E2EC", "rgba(200, 214, 255, 0.35)", { craters: true }),
        p0: 0.0, p1: 0.26, fromX: 0.38, toX: 0.95, toY: 0.85, base: 0.34,
      },
      {
        sprite: makeOrb(mobile ? 52 : 84, "#FFF7E8", "#FFD9A8", "rgba(255, 214, 170, 0.45)"),
        p0: 0.16, p1: 0.46, fromX: -0.35, toX: -1.0, toY: 0.75, base: 0.46,
      },
      {
        sprite: makeOrb(mobile ? 30 : 46, "#FFF0F4", "#F5A9B8", "rgba(245, 169, 184, 0.5)"),
        p0: 0.38, p1: 0.64, fromX: 0.3, toX: 0.9, toY: 0.7, base: 0.24,
      },
      {
        sprite: makeOrb(mobile ? 36 : 56, "#FDF3DF", "#E5CB9A", "rgba(229, 203, 154, 0.4)", { ring: "rgba(240, 222, 190, 0.65)" }),
        p0: 0.56, p1: 0.8, fromX: -0.3, toX: -0.92, toY: 0.72, base: 0.3,
      },
      {
        sprite: makeOrb(mobile ? 42 : 66, "#F4EFFB", "#C9B2E8", "rgba(201, 178, 232, 0.45)", { bands: "rgba(150, 122, 190, 0.35)" }),
        p0: 0.72, p1: 0.96, fromX: 0.32, toX: 0.9, toY: 0.65, base: 0.36,
      },
    ];

    const nebulae = [
      { sprite: makeNebula(mobile ? 380 : 640, "245, 169, 184"), x: 0.72, y: 0.28, drift: 0.5 },
      { sprite: makeNebula(mobile ? 380 : 640, "121, 216, 252"), x: 0.2, y: 0.55, drift: 0.75 },
      { sprite: makeNebula(mobile ? 320 : 560, "190, 165, 235"), x: 0.55, y: 0.82, drift: 0.6 },
    ];
    const galaxy = makeGalaxy(mobile ? 300 : 520);

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

    const n = CHAPTERS.length;
    const band = 1 / n;
    const smooth = (v: number) => v * v * (3 - 2 * v);

    const draw = (t: number) => {
      if (!running) return;
      const rect = wrap.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, total > 0 ? -rect.top / total : 0));

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const cx = w / 2;
      const cy = h / 2;
      ctx.clearRect(0, 0, w, h);

      // Dusk → deep space → dawn. The void is darker than before: futuristic
      // depth needs true black-violet behind the glow.
      const night = 0.7 + 0.3 * Math.sin(p * Math.PI);
      const dawn = p > 0.92 ? Math.max(0, 1 - (p - 0.92) / 0.08) : 1;
      const deep = night * dawn * dawn;
      const mix = (a: number, b: number) => Math.round(a + (b - a) * deep);
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, `rgb(${mix(250, 14)}, ${mix(247, 8)}, ${mix(251, 26)})`);
      grad.addColorStop(1, `rgb(${mix(246, 32)}, ${mix(240, 18)}, ${mix(248, 52)})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Gentle camera sway — the "alive" of the 3D vision.
      const swayX = Math.sin(t / 5200) * w * 0.006;
      const swayY = Math.cos(t / 6400) * h * 0.005;

      // Nebulae (screen blend — they glow rather than paint).
      ctx.globalCompositeOperation = "screen";
      for (const nb of nebulae) {
        const size = nb.sprite.width;
        const y = ((nb.y - p * nb.drift * 1.3) % 1.4 + 1.4) % 1.4 - 0.2;
        ctx.globalAlpha = 0.75 * deep;
        ctx.drawImage(nb.sprite, nb.x * w - size / 2 + swayX * 2, y * h - size / 2 + swayY * 2);
      }

      // The galaxy crosses the deep-space middle of the flight.
      {
        const gp = (p - 0.3) / 0.45; // visible ~0.3 → 0.75
        if (gp > 0 && gp < 1) {
          const size = galaxy.width;
          const gx = cx + (0.5 - gp) * w * 0.7 + swayX * 3;
          const gy = h * (0.9 - gp * 0.85) + swayY * 3;
          ctx.globalAlpha = Math.sin(gp * Math.PI) * 0.85 * deep;
          ctx.save();
          ctx.translate(gx, gy);
          ctx.rotate(-0.4 + gp * 0.3);
          const s = 0.6 + gp * 0.8;
          ctx.drawImage(galaxy, (-size / 2) * s, (-size / 2) * s, size * s, size * s);
          ctx.restore();
        }
      }
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;

      // 3D starfield: we swim UP — depth advances with scroll, stars streaming
      // past and recycling from afar. Projection: screen = center + world/z.
      const travel = p * 1.15;
      for (const s of stars) {
        let zt = s.z - travel;
        zt = ((zt - 0.14) % 1.56 + 1.56) % 1.56 + 0.14; // wrap 0.14..1.7
        const proj = 0.72 / zt;
        const sx = cx + s.x * w * 0.5 * proj + swayX * proj;
        const sy = cy + s.y * h * 0.5 * proj + h * 0.06 * proj * (travel % 1) + swayY * proj;
        if (sx < -12 || sx > w + 12 || sy < -12 || sy > h + 12) continue;
        const near = Math.min(1, (1.7 - zt) / 1.2);
        const tw = 0.6 + 0.4 * Math.sin(t / 800 + s.tw);
        const alpha = (0.2 + 0.8 * deep) * tw * (0.25 + 0.75 * near);
        const radius = s.r * (0.5 + proj * 0.8);
        // Near stars get a soft glow — cheap bloom.
        if (near > 0.75 && !mobile) {
          ctx.fillStyle = `rgba(${STAR_COLORS[s.hue]}, ${(alpha * 0.25).toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(sx, sy, radius * 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = `rgba(${STAR_COLORS[s.hue]}, ${alpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // The luminaries swim past.
      for (const f of flights) {
        const u = (p - f.p0) / (f.p1 - f.p0);
        if (u <= 0 || u >= 1) continue;
        const e = smooth(u);
        const z = 1.5 - e * 1.15; // approaches from far
        const scale = (f.base * h) / (f.sprite.width / 3.4) / z;
        const x = cx + (f.fromX + (f.toX - f.fromX) * e) * w * 0.5;
        const y = cy + (-0.28 + f.toY * e) * h * 0.6 + swayY * 2;
        const size = f.sprite.width * scale * 0.32;
        ctx.globalAlpha = Math.min(1, Math.sin(u * Math.PI) * 1.6) * (0.35 + 0.65 * deep);
        ctx.drawImage(f.sprite, x - size / 2, y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;

      // Zodiac ring: farther back among the stars now, still turning.
      if (ringRef.current) {
        const scale = 0.9 + 0.35 * Math.sin(p * Math.PI);
        ringRef.current.style.transform = `translate(-50%, -50%) rotate(${p * 160}deg) scale(${scale})`;
        ringRef.current.style.opacity = String(0.05 + 0.09 * deep);
      }

      // Chapters (compressed so the last 8% of scroll is pure textless dawn).
      const pc = Math.min(1.15, p / 0.92);
      CHAPTERS.forEach((_, i) => {
        const el = chapterRefs.current[i];
        if (!el) return;
        const center = band * i + band / 2;
        const dist = i === 0 ? Math.max(0, pc - center) : Math.abs(pc - center);
        const d = dist / (band * 0.55);
        const vis = Math.max(0, 1 - d);
        const ease = smooth(vis);
        el.style.opacity = String(ease);
        el.style.transform = `translateY(${(1 - ease) * 26 * (pc > center ? -1 : 1)}px)`;
        el.style.pointerEvents = ease > 0.5 ? "auto" : "none";
        const rail = railRefs.current[i];
        if (rail) rail.dataset.active = String(d < 0.7);
      });

      if (hintRef.current) {
        hintRef.current.style.opacity = String(Math.max(0, 1 - p * 12));
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("wheel", mark);
      window.removeEventListener("touchstart", mark);
      window.removeEventListener("keydown", mark);
      snapTimers.forEach(clearTimeout);
    };
  }, [reduced]);

  // Static hero for reduced-motion (and the SSR frame before we know).
  if (reduced !== false) {
    const c = CHAPTERS[0];
    return (
      <section className="relative flex flex-col items-center px-4 pb-20 pt-24 text-center sm:pt-32">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-rose-600">{c.eyebrow}</p>
        <h1 className="max-w-3xl text-5xl leading-tight text-ink-900 sm:text-6xl">
          The sky you were born under
          <span className="block italic text-rose-500">still remembers you.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-700">{c.line}</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/studio" className="btn-gold">✦ Cast your chart — free</Link>
          <Link href="/services" className="btn-ghost">Book a reading</Link>
        </div>
      </section>
    );
  }

  const glow = {
    textShadow:
      "0 0 22px rgba(245, 169, 184, 0.45), 0 0 60px rgba(121, 216, 252, 0.25)",
  };

  return (
    <div ref={wrapRef} className="relative" style={{ height: `${CHAPTERS.length * 92}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

        {/* The turning zodiac ring — deep in the field now */}
        <svg
          ref={ringRef}
          aria-hidden
          viewBox="0 0 200 200"
          className="pointer-events-none absolute h-[680px] w-[680px]"
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.07 }}
        >
          <circle cx="100" cy="100" r="98" fill="none" stroke="#F5A9B8" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="78" fill="none" stroke="#5BCEFA" strokeWidth="0.35" />
          <circle cx="100" cy="100" r="58" fill="none" stroke="#fdfcfc" strokeWidth="0.3" />
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return (
              <line
                key={i}
                x1={100 + 78 * Math.cos(a)}
                y1={100 + 78 * Math.sin(a)}
                x2={100 + 98 * Math.cos(a)}
                y2={100 + 98 * Math.sin(a)}
                stroke="#F5A9B8"
                strokeWidth="0.4"
              />
            );
          })}
        </svg>

        {/* Chapters */}
        {CHAPTERS.map((c, i) => (
          <div
            key={c.key}
            ref={(el) => {
              chapterRefs.current[i] = el;
            }}
            className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
            style={{ opacity: i === 0 ? 1 : 0 }}
          >
            {c.eyebrow ? (
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-rose-300" style={glow}>
                {c.eyebrow}
              </p>
            ) : (
              <span aria-hidden className="astro-glyph mb-4 text-4xl text-rose-300" style={glow}>
                {c.glyph}
              </span>
            )}
            {i === 0 ? (
              <h1 className="max-w-3xl text-5xl leading-tight text-white sm:text-6xl" style={glow}>
                The sky you were born under
                <span className="block italic text-rose-300">still remembers you.</span>
              </h1>
            ) : (
              <h2 className="max-w-2xl text-4xl leading-tight text-white sm:text-5xl" style={glow}>
                {c.title}
              </h2>
            )}
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-pearl-300/90">{c.line}</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              {i === 0 ? (
                <>
                  <Link href="/studio" className="btn-gold">✦ Cast your chart — free</Link>
                  <Link href="/services" className="btn-ghost !border-white/40 !text-white hover:!border-rose-300">
                    Book a reading
                  </Link>
                </>
              ) : (
                c.href && (
                  <Link href={c.href} className="btn-gold">
                    {c.cta} →
                  </Link>
                )
              )}
            </div>
          </div>
        ))}

        {/* Chapter rail — the film's map */}
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.22em] sm:left-8 sm:translate-x-0">
          {CHAPTERS.map((c, i) => (
            <span key={c.key} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden className="text-white/30">→</span>}
              <span
                ref={(el) => {
                  railRefs.current[i] = el;
                }}
                className="text-white/35 transition-all data-[active=true]:text-rose-300 data-[active=true]:[text-shadow:0_0_14px_rgba(245,169,184,0.8)]"
              >
                {c.rail}
              </span>
            </span>
          ))}
        </div>

        <p
          ref={hintRef}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-[0.35em] text-white/50 sm:bottom-6 sm:left-auto sm:right-8 sm:translate-x-0"
        >
          ✦ Scroll the sky
        </p>
      </div>
    </div>
  );
}
