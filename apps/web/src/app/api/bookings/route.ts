import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BookingError, createBooking } from "@/lib/bookings";
import { rateLimit } from "@/lib/rate-limit";

const BookingRequest = z.object({
  serviceSlug: z.string().min(1),
  startUtc: z.string().datetime({ offset: true }).or(z.string().datetime()),
  format: z.enum(["video", "phone", "in-person"]),
  clientName: z.string().min(1).max(120),
  clientEmail: z.string().email().max(200),
  clientPhone: z.string().max(40).optional(),
  clientTz: z.string().min(1).max(64),
  priceTier: z.enum(["community", "standard", "sustainer"]),
  paymentMethod: z.enum(["checkout", "direct"]).default("checkout"),
  promoCode: z.string().max(60).optional(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  birthPlace: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export async function POST(request: NextRequest) {
  // Each hold sends an email and blocks a slot: a handful per quarter hour
  // is a person, more is a script.
  const limited = rateLimit(request, "bookings", 6, 900);
  if (limited) return limited;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const parsed = BookingRequest.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the booking details.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  try {
    const { booking, paymentUrl } = await createBooking(parsed.data);
    return NextResponse.json({
      bookingToken: booking.token,
      paymentUrl,
    });
  } catch (err) {
    if (err instanceof BookingError) {
      return NextResponse.json({ error: err.message }, { status: 409 });
    }
    console.error("[bookings] failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "The booking could not be made just now. Nothing was held; please try again in a moment." },
      { status: 500 }
    );
  }
}
