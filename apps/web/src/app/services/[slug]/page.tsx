import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES, FORMAT_LABELS, formatPrice, serviceBySlug } from "@/lib/services";

export async function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) return { title: "Reading not found" };
  return {
    title: service.title,
    description: service.description,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) notFound();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-16 sm:px-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-ink-400">
        <Link href="/services" className="hover:text-ink-700">
          Readings
        </Link>{" "}
        <span aria-hidden>/</span>{" "}
        <span className="text-ink-500">{service.title}</span>
      </nav>

      {/* Header */}
      <header className="mt-10 max-w-3xl">
        <h1 className="text-4xl text-ink-900 sm:text-5xl">{service.title}</h1>
        <p className="mt-3 text-xl italic text-rose-500">{service.tagline}</p>
      </header>

      <hr className="gold-rule mt-12" />

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_20rem]">
        {/* The reading */}
        <div className="max-w-2xl">
          <p className="text-lg leading-relaxed text-ink-700">
            {service.description}
          </p>

          <h2 className="mt-12 text-2xl text-ink-900">What we&apos;ll do</h2>
          <ul className="mt-6 space-y-4">
            {service.bullets.map((b) => (
              <li key={b} className="flex gap-3 leading-relaxed text-ink-700">
                <span aria-hidden className="mt-0.5 text-rose-600">
                  ✦
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Booking card */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-8">
            <p className="text-4xl text-ink-900">
              {formatPrice(service.priceCents)}
            </p>
            <p className="mt-1 text-ink-500">
              {service.durationMinutes} minutes, one-on-one
            </p>

            <h2 className="mt-8 text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
              Session formats
            </h2>
            <ul className="mt-3 space-y-2">
              {service.formats.map((f) => (
                <li key={f} className="flex gap-3 text-sm text-ink-700">
                  <span aria-hidden className="text-rose-600">
                    ✦
                  </span>
                  {FORMAT_LABELS[f]}
                </li>
              ))}
            </ul>

            <Link
              href={`/book/${service.slug}`}
              className="btn-gold mt-8 block w-full text-center"
            >
              Choose a time
            </Link>
            <p className="mt-4 text-center text-xs leading-relaxed text-ink-400">
              You&apos;ll pick a format and share your birth details at booking.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
