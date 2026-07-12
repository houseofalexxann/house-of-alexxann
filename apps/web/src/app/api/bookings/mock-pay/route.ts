import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { finalizePaidBooking } from "@/lib/bookings";
import { stripeEnabled } from "@/lib/stripe";

/**
 * Dev-only payment simulator endpoint. Never available in production — with
 * or without Stripe keys — and disabled locally once real keys exist, so it
 * can never bypass live payments.
 */
export async function POST(request: NextRequest) {
  if (stripeEnabled() || process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Mock payment disabled." }, { status: 403 });
  }
  const { token } = (await request.json().catch(() => ({}))) as { token?: string };
  if (!token) return NextResponse.json({ error: "Missing token." }, { status: 400 });

  const booking = await prisma.booking.findUnique({ where: { token } });
  if (!booking) return NextResponse.json({ error: "Unknown booking." }, { status: 404 });

  await finalizePaidBooking(booking.id);
  return NextResponse.json({ ok: true });
}
