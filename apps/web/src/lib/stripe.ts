/**
 * Stripe integration — payment at booking (PRD §7.4) with flexible options:
 * card, pay-in-4 (Klarna/Afterpay) and monthly installments (Affirm).
 * BNPL methods surface automatically in Checkout once enabled on the Stripe
 * account; we also request them explicitly for USD payments.
 *
 * With no STRIPE_SECRET_KEY (local dev), the app runs in mock-checkout mode:
 * the booking flow redirects to an internal simulator page instead, so the
 * end-to-end journey (book → pay → emails) remains fully testable.
 */
import Stripe from "stripe";
import type { Booking, Service } from "@prisma/client";
import { MEMBERSHIP_PRICE_CENTS } from "./membership";

export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let client: Stripe | null = null;
export function stripe(): Stripe {
  if (!client) {
    if (!stripeEnabled()) throw new Error("Stripe is not configured");
    client = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return client;
}

/** Card + pay-over-time + wallets requested for USD checkouts. */
const PAYMENT_METHODS: Stripe.Checkout.SessionCreateParams.PaymentMethodType[] = [
  "card",
  "klarna",
  "afterpay_clearpay",
  "affirm",
  "cashapp",
  "paypal",
];

export async function createCheckoutSession(
  booking: Booking,
  service: Service,
  baseUrl: string
): Promise<{ url: string; sessionId: string }> {
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: PAYMENT_METHODS,
    customer_email: booking.clientEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: booking.priceCents,
          product_data: {
            name: service.title,
            description: `${service.durationMinutes}-minute reading with Alexandria — House of Alexxann`,
          },
        },
      },
    ],
    metadata: { bookingId: booking.id, bookingToken: booking.token },
    success_url: `${baseUrl}/book/confirmation?token=${booking.token}&paid=1`,
    cancel_url: `${baseUrl}/book/confirmation?token=${booking.token}&canceled=1`,
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // match the slot hold
  });
  if (!session.url) throw new Error("Stripe session has no URL");
  return { url: session.url, sessionId: session.id };
}

/**
 * Venusian Doll membership: $5/month subscription checkout. No explicit
 * payment_method_types — Stripe surfaces whatever recurring-capable methods
 * are enabled on the account.
 */
export async function createMembershipCheckout(
  userId: string,
  email: string,
  baseUrl: string
): Promise<{ url: string }> {
  const session = await stripe().checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: MEMBERSHIP_PRICE_CENTS,
          recurring: { interval: "month" },
          product_data: {
            name: "Venusian Doll membership",
            description:
              "Every room of the House, behind the veil — plus 10% off every reading with Alexandria.",
          },
        },
      },
    ],
    metadata: { membershipUserId: userId },
    subscription_data: { metadata: { membershipUserId: userId } },
    success_url: `${baseUrl}/join?welcome=1`,
    cancel_url: `${baseUrl}/join?canceled=1`,
  });
  if (!session.url) throw new Error("Stripe session has no URL");
  return { url: session.url };
}
