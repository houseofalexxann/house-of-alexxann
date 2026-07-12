import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createBooking } from "@/lib/bookings";

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
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Booking failed." },
      { status: 409 }
    );
  }
}
