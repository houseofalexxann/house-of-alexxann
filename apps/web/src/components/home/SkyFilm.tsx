"use client";

/**
 * The opening film: a pinned, scroll-scrubbed flight through the House's
 * cosmos (inspired by scroll-cinema landings, translated into the trans-
 * pastel sky). Scrolling advances the journey — drifting starfield, the
 * zodiac ring slowly turning, one chapter per room — then releases into the
 * normal page. Honors prefers-reduced-motion with a static hero.
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

interface Star {
  x: number; // 0..1 of width
  y: number; // 0..1 of height
  r: number;
  layer: number; // parallax depth 0.2..1
  hue: "rose" | "sky" | "pearl";
  tw: number; // twinkle phase
}

function makeStars(count: number): Star[] {
  const hues: Star["hue"][] = ["rose", "sky", "pearl", "pearl"];
  return Array.from({ length: count }, (_, i) => ({
    x: Math.random(),
    y: Math.random(),
    r: 0.6 + Math.random() * 1.7,
    layer: 0.2 + Math.random() * 0.8,
    hue: hues[i % hues.length],
    tw: Math.random() * Math.PI * 2,
  }));
}

const STAR_COLORS = {
  rose: "245, 169, 184",
  sky: "91, 206, 250",
  pearl: "255, 252, 250",
} as const;

export function SkyFilm() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ringRef = useRef<SVGSVGElement>(null);
  const chapterRefs = useRef<(HTMLDivElement | null)[]>([]);
  const railRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const progress = useRef(0);
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

    // Reloads and back-navigations restore scroll into the middle of the
    // film (worst case: the near-white dawn, which reads as a blank page).
    // A film starts from its first frame: take over restoration, and watch a
    // short window after mount — the browser applies its restore at an
    // unpredictable moment — snapping any non-user jump into the film back
    // to the top. A real user scroll cancels the watch instantly.
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

    const stars = makeStars(window.innerWidth < 640 ? 90 : 170);
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

    const draw = (t: number) => {
      if (!running) return;
      const rect = wrap.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = Math.min(1, Math.max(0, total > 0 ? -rect.top / total : 0));
      progress.current = p;

      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      // Begin at dusk, deepen to full night mid-flight, dawn out at the very
      // end so the film releases gently into the pearl page below.
      const night = 0.65 + 0.35 * Math.sin(p * Math.PI);
      const dawn = p > 0.92 ? Math.max(0, 1 - (p - 0.92) / 0.08) : 1;
      const deep = night * dawn * dawn;
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, `rgba(${30 + 200 * (1 - deep)}, ${24 + 210 * (1 - deep)}, ${46 + 200 * (1 - deep)}, 1)`);
      grad.addColorStop(1, `rgba(${52 + 190 * (1 - deep)}, ${36 + 190 * (1 - deep)}, ${72 + 180 * (1 - deep)}, 1)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Stars drift upward with scroll (deeper layers slower) and twinkle.
      for (const s of stars) {
        const y = (((s.y - p * s.layer * 1.6) % 1) + 1) % 1;
        const tw = 0.55 + 0.45 * Math.sin(t / 900 + s.tw);
        const alpha = (0.25 + 0.75 * deep) * tw * (0.35 + 0.65 * s.layer);
        ctx.beginPath();
        ctx.arc(s.x * w, y * h, s.r * (0.7 + 0.6 * s.layer), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${STAR_COLORS[s.hue]}, ${alpha.toFixed(3)})`;
        ctx.fill();
      }

      // Zodiac ring: slow rotation + breath.
      if (ringRef.current) {
        const scale = 1 + 0.25 * Math.sin(p * Math.PI);
        ringRef.current.style.transform = `translate(-50%, -50%) rotate(${p * 140}deg) scale(${scale})`;
        ringRef.current.style.opacity = String(0.1 + 0.14 * deep);
      }

      // Chapters: each owns a band of the journey (compressed so the last 8%
      // of the scroll is pure textless dawn); crossfade + drift.
      const pc = Math.min(1.15, p / 0.92);
      CHAPTERS.forEach((_, i) => {
        const el = chapterRefs.current[i];
        if (!el) return;
        const center = band * i + band / 2;
        // First chapter arrives fully lit (no fade-in before scroll 0).
        const dist = i === 0 ? Math.max(0, pc - center) : Math.abs(pc - center);
        const d = dist / (band * 0.55);
        const vis = Math.max(0, 1 - d);
        const ease = vis * vis * (3 - 2 * vis);
        el.style.opacity = String(ease);
        el.style.transform = `translateY(${(1 - ease) * 26 * (p > center ? -1 : 1)}px)`;
        el.style.pointerEvents = ease > 0.5 ? "auto" : "none";
        const rail = railRefs.current[i];
        if (rail) rail.dataset.active = String(d < 0.7);
      });

      // The hint fades once the traveler starts moving.
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

  return (
    <div ref={wrapRef} className="relative" style={{ height: `${CHAPTERS.length * 92}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden />

        {/* The turning zodiac ring */}
        <svg
          ref={ringRef}
          aria-hidden
          viewBox="0 0 200 200"
          className="pointer-events-none absolute h-[620px] w-[620px]"
          style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", opacity: 0.12 }}
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
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-rose-300">{c.eyebrow}</p>
            ) : (
              <span aria-hidden className="astro-glyph mb-4 text-4xl text-rose-300">{c.glyph}</span>
            )}
            {i === 0 ? (
              <h1 className="max-w-3xl text-5xl leading-tight text-white sm:text-6xl">
                The sky you were born under
                <span className="block italic text-rose-300">still remembers you.</span>
              </h1>
            ) : (
              <h2 className="max-w-2xl text-4xl leading-tight text-white sm:text-5xl">{c.title}</h2>
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
                className="text-white/35 transition-colors data-[active=true]:text-rose-300"
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
