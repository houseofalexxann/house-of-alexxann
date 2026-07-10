import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-pearl-300/60 bg-pearl-50/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-heading text-lg text-ink-900">
            <span aria-hidden className="text-rose-600">✦</span> House of Alexxann
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-500">
            Professional astrology, cast with the precision of the Swiss
            Ephemeris and read with warmth. Western &amp; Vedic charts, readings,
            and guidance.
          </p>
        </div>
        <nav className="text-sm">
          <p className="mb-3 font-semibold uppercase tracking-widest text-ink-400">
            Explore
          </p>
          <ul className="space-y-2 text-ink-700">
            <li><Link className="hover:text-rose-500" href="/studio">Chart Studio</Link></li>
            <li><Link className="hover:text-rose-500" href="/services">Readings &amp; pricing</Link></li>
            <li><Link className="hover:text-rose-500" href="/about">About Alexandria</Link></li>
          </ul>
        </nav>
        <div className="text-sm text-ink-500">
          <p className="mb-3 font-semibold uppercase tracking-widest text-ink-400">
            Your data
          </p>
          <p className="leading-relaxed">
            Birth date, time and place are sensitive personal data. Charts cast
            in the Studio are computed on request and never sold or shared;
            booking details are used only to prepare and deliver your reading.
          </p>
        </div>
      </div>
      <div className="border-t border-pearl-200 py-4 text-center text-xs text-ink-400">
        © {new Date().getFullYear()} House of Alexxann · Crafted under night skies
      </div>
    </footer>
  );
}
