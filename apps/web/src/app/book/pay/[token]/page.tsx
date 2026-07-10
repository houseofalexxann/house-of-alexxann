import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { stripeEnabled } from "@/lib/stripe";
import { formatPrice } from "@/lib/services";
import { MockPayClient } from "@/components/book/MockPayClient";

export const metadata: Metadata = { title: "Checkout (test mode)" };

/**
 * Dev-only checkout simulator, used when no Stripe keys are configured.
 * Mirrors the real payment-method choices so the full booking journey is
 * testable offline. Returns 404 as soon as Stripe is live.
 */
export default async function MockPayPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  if (stripeEnabled()) notFound();
  const booking = await prisma.booking.findUnique({
    where: { token },
    include: { service: true },
  });
  if (!booking) notFound();

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-16 sm:px-6">
      <div className="card p-8">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
          Test checkout — no real charge
        </p>
        <h1 className="mt-2 text-center text-2xl text-ink-900">
          {booking.service.title}
        </h1>
        <p className="mt-1 text-center text-3xl font-semibold text-ink-900">
          {formatPrice(booking.priceCents)}
        </p>
        <p className="mt-4 text-center text-xs leading-relaxed text-ink-400">
          With live Stripe keys this page is replaced by Stripe Checkout
          offering: card, Klarna Pay in 4, Afterpay, Affirm installments,
          Cash App Pay and PayPal.
        </p>
        <MockPayClient token={booking.token} />
      </div>
    </div>
  );
}
