import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-night-700/60 bg-night-950/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-heading text-lg text-moon-100">
            <span aria-hidden className="text-gold-400">✦</span> House of Alexxann
          </p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-moon-400">
            Professional astrology, cast with the precision of the Swiss
            Ephemeris and read with warmth. Western &amp; Vedic charts, readings,
            and guidance.
          </p>
        </div>
        <nav className="text-sm">
          <p className="mb-3 font-semibold uppercase tracking-widest text-moon-500">
            Explore
          </p>
          <ul className="space-y-2 text-moon-300">
            <li><Link className="hover:text-gold-300" href="/studio">Chart Studio</Link></li>
            <li><Link className="hover:text-gold-300" href="/services">Readings &amp; pricing</Link></li>
            <li><Link className="hover:text-gold-300" href="/about">About Alexandria</Link></li>
          </ul>
        </nav>
        <div className="text-sm text-moon-400">
          <p className="mb-3 font-semibold uppercase tracking-widest text-moon-500">
            Your data
          </p>
          <p className="leading-relaxed">
            Birth date, time and place are sensitive personal data. Charts cast
            in the Studio are computed on request and never sold or shared;
            booking details are used only to prepare and deliver your reading.
          </p>
        </div>
      </div>
      <div className="border-t border-night-800 py-4 text-center text-xs text-moon-500">
        © {new Date().getFullYear()} House of Alexxann · Crafted under night skies
      </div>
    </footer>
  );
}
