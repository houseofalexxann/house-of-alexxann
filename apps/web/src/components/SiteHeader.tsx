import Link from "next/link";

const NAV = [
  { href: "/studio", label: "Chart Studio" },
  { href: "/services", label: "Readings" },
  { href: "/about", label: "About" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-pearl-300/60 bg-pearl-50/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span aria-hidden className="text-rose-600 transition-transform group-hover:rotate-12">
            ✦
          </span>
          <span className="font-heading text-xl tracking-wide text-ink-900">
            House of Alexxann
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-ink-700 transition-colors hover:bg-pearl-200 hover:text-ink-900"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/services" className="btn-gold ml-2 !px-4 !py-1.5 text-sm">
            Book a reading
          </Link>
        </nav>
      </div>
    </header>
  );
}
