import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { finalizePaidBooking } from "@/lib/bookings";
import { prisma } from "@/lib/db";

/**
 * Stripe webhook, signature-verified with STRIPE_WEBHOOK_SECRET.
 * - checkout.session.completed (payment) → mark the booking paid + email.
 * - checkout.session.completed (subscription) → lift the member's veil.
 * - customer.subscription.deleted → membership lapses, veil settles back.
 */
export async function POST(request: NextRequest) {
  if (!stripeEnabled() || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe not configured." }, { status: 501 });
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 400 });
  }
  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.bookingId;
    if (bookingId && session.payment_status === "paid") {
      await finalizePaidBooking(bookingId);
    }
    const memberId = session.metadata?.membershipUserId;
    if (memberId && session.mode === "subscription" && session.payment_status === "paid") {
      await prisma.user
        .update({ where: { id: memberId }, data: { isMember: true } })
        .catch(() => {}); // user row deleted since checkout — nothing to lift
      const promoId = session.metadata?.promoId;
      if (promoId) {
        await prisma.promoCode
          .update({ where: { id: promoId }, data: { redemptions: { increment: 1 } } })
          .catch(() => {});
      }
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const memberId = sub.metadata?.membershipUserId;
    if (memberId) {
      await prisma.user
        .update({ where: { id: memberId }, data: { isMember: false } })
        .catch(() => {});
    }
  }

  return NextResponse.json({ received: true });
}
