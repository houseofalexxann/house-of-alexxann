"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

/** Static site index: pages, features, and Codex terms. */
const INDEX: { label: string; href: string; keywords: string }[] = [
  { label: "Western astrology — cast a free chart", href: "/western", keywords: "natal birth chart free western tropical wheel studio" },
  { label: "Vedic astrology — Jyotish charts", href: "/vedic", keywords: "vedic sidereal jyotish rasi navamsa dasha nakshatra studio" },
  { label: "The daily sky — blog", href: "/blog", keywords: "blog posts astro weather history facts daily notes" },
  { label: "Create an account", href: "/signup", keywords: "sign up join account register login" },
  { label: "Sign in", href: "/login", keywords: "log in login account" },
  { label: "Readings & pricing", href: "/services", keywords: "book reading price sliding scale natal transit vedic session" },
  { label: "Transits — the sky right now", href: "/transits", keywords: "today current sky transit forecast" },
  { label: "Human Design", href: "/human-design", keywords: "bodygraph type strategy authority gates centers" },
  { label: "Tarot room", href: "/tarot", keywords: "cards draw spread decans" },
  { label: "The Codex — glossary & legend", href: "/codex", keywords: "glossary definitions glyphs symbols key legend meaning" },
  { label: "Decans (the 36 faces)", href: "/codex#decans", keywords: "decan face chaldean ten degrees" },
  { label: "Egyptian bounds (terms)", href: "/codex#bounds", keywords: "bound term egyptian dignity ptolemy" },
  { label: "Zodiacal releasing", href: "/codex#zr", keywords: "valens lot spirit fortune timing periods chapters" },
  { label: "Sect — day & night charts", href: "/codex#glossary", keywords: "sect diurnal nocturnal light leader" },
  { label: "Nakshatras — lunar mansions", href: "/codex#glossary", keywords: "nakshatra pada lord moon vedic mansion deity" },
  { label: "Vimshottari dasha", href: "/codex#glossary", keywords: "dasha mahadasha antardasha timeline vedic periods" },
  { label: "Essential dignities", href: "/codex#glossary", keywords: "domicile exaltation detriment fall peregrine rulership" },
  { label: "Lots of Fortune & Spirit", href: "/codex#glossary", keywords: "lot fortune spirit arabic part" },
  { label: "About Alexandria", href: "/about", keywords: "practitioner story philosophy approach" },
  { label: "FAQ", href: "/faq", keywords: "questions answers birth time payment gift queer trans" },
  { label: "Support the House (donate)", href: "/donate", keywords: "donate support tip venmo cashapp zelle paypal" },
  { label: "Accessibility", href: "/accessibility", keywords: "access screen reader keyboard contrast motion disability" },
  { label: "Book a reading", href: "/services", keywords: "schedule appointment calendar availability booking" },
];

export function SiteSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2) return [];
    return INDEX.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.keywords.includes(query)
    ).slice(0, 7);
  }, [q]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, []);

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        aria-label="Search the House (⌘K)"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-pearl-200 hover:text-ink-900"
      >
        <svg viewBox="0 0 20 20" width="16" height="16" fill="none" aria-hidden>
          <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
          <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-10 z-50 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-pearl-300 bg-white/95 shadow-xl backdrop-blur">
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search charts, terms, pages…"
            aria-label="Search"
            className="w-full border-b border-pearl-200 bg-transparent px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
          <ul role="listbox">
            {results.map((r) => (
              <li key={r.label}>
                <Link
                  href={r.href}
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2.5 text-sm text-ink-700 hover:bg-rose-300/20 hover:text-ink-900"
                >
                  {r.label}
                </Link>
              </li>
            ))}
            {q.trim().length >= 2 && results.length === 0 && (
              <li className="px-4 py-3 text-sm text-ink-400">
                Nothing yet — try &#34;decan&#34;, &#34;dasha&#34;, &#34;booking&#34;…
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
