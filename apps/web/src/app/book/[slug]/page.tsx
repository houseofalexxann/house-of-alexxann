import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SERVICES, serviceBySlug } from "@/lib/services";
import { getSettings } from "@/lib/settings";
import { directPayOptions } from "@/lib/email-templates";
import { BookingClient } from "@/components/book/BookingClient";

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
  return { title: service ? `Book — ${service.title}` : "Book a reading" };
}

export default async function BookPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = serviceBySlug(slug);
  if (!service) notFound();

  const settings = await getSettings();
  const directPayAvailable = directPayOptions(settings).length > 0;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-10 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
          Book a reading
        </p>
        <h1 className="text-4xl text-ink-900">{service.title}</h1>
        <p className="mt-2 text-ink-500">
          {service.durationMinutes} minutes with Alexandria · {service.tagline}
        </p>
      </header>
      <BookingClient service={service} directPayAvailable={directPayAvailable} />
    </div>
  );
}
