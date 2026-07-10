import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, stripeEnabled } from "@/lib/stripe";
import { finalizePaidBooking } from "@/lib/bookings";

/**
 * Stripe webhook: checkout.session.completed → mark the booking paid and
 * send the confirmation email. Signature-verified with STRIPE_WEBHOOK_SECRET.
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
  }

  return NextResponse.json({ received: true });
}
