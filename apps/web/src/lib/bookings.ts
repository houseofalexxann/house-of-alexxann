/**
 * Booking orchestration: create (slot re-check + payment handoff),
 * finalize after payment, and reminder dispatch.
 */
import { DateTime } from "luxon";
import type { Booking } from "@prisma/client";
import { prisma } from "./db";
import { isSlotFree } from "./slots";
import { getSettings } from "./settings";
import { priceTiers, serviceBySlug, type PriceTierKey, type SessionFormat } from "./services";
import { createCheckoutSession, stripeEnabled } from "./stripe";
import { confirmationEmail, directPayEmail, reminderEmail } from "./email-templates";
import { sendMail } from "./email";

export function baseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}

export interface CreateBookingInput {
  serviceSlug: string;
  startUtc: string;
  format: SessionFormat;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientTz: string;
  priceTier: PriceTierKey;
  /**
   * "checkout": Stripe (card / pay-in-4 / installments / Cash App Pay /
   * PayPal wallet) — or the mock simulator without keys.
   * "direct": Venmo / Cash App / Zelle / PayPal.me sent person-to-person;
   * Alexandria confirms receipt in the admin.
   */
  paymentMethod: "checkout" | "direct";
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  notes?: string;
}

export async function createBooking(
  input: CreateBookingInput
): Promise<{ booking: Booking; paymentUrl: string }> {
  const serviceDef = serviceBySlug(input.serviceSlug);
  const service = await prisma.service.findUnique({ where: { slug: input.serviceSlug } });
  if (!service || !serviceDef) throw new Error("Unknown service.");

  if (!serviceDef.formats.includes(input.format)) {
    throw new Error("That session format isn't offered for this reading.");
  }

  const tier = priceTiers(serviceDef).find((t) => t.key === input.priceTier);
  if (!tier) throw new Error("Unknown price tier.");

  if (!(await isSlotFree(input.serviceSlug, input.startUtc))) {
    throw new Error("That time was just taken — please pick another slot.");
  }

  const start = DateTime.fromISO(input.startUtc, { zone: "utc" });
  const end = start.plus({ minutes: service.durationMinutes });

  const booking = await prisma.booking.create({
    data: {
      serviceId: service.id,
      clientName: input.clientName,
      clientEmail: input.clientEmail,
      clientPhone: input.clientPhone ?? null,
      format: input.format.replace("-", "_") as never,
      startUtc: start.toJSDate(),
      endUtc: end.toJSDate(),
      clientTz: input.clientTz,
      priceCents: tier.priceCents,
      priceTier: tier.key,
      paymentMode:
        input.paymentMethod === "direct"
          ? "direct"
          : stripeEnabled()
            ? "stripe"
            : "mock",
      birthDate: input.birthDate ?? null,
      birthTime: input.birthTime ?? null,
      birthPlace: input.birthPlace ?? null,
      notes: input.notes ?? null,
    },
  });

  if (input.paymentMethod === "direct") {
    // Send payment instructions; the slot is held while Alexandria awaits
    // the Venmo/Cash App/Zelle/PayPal transfer.
    const settings = await getSettings();
    try {
      await sendMail(directPayEmail(booking, service, settings, baseUrl()));
    } catch (err) {
      console.error("[bookings] direct-pay email failed:", err);
    }
    return {
      booking,
      paymentUrl: `${baseUrl()}/book/confirmation?token=${booking.token}`,
    };
  }

  if (stripeEnabled()) {
    const { url, sessionId } = await createCheckoutSession(booking, service, baseUrl());
    await prisma.booking.update({
      where: { id: booking.id },
      data: { stripeSessionId: sessionId },
    });
    return { booking, paymentUrl: url };
  }

  // Mock mode: internal simulator keeps the full journey testable offline.
  return { booking, paymentUrl: `${baseUrl()}/book/pay/${booking.token}` };
}

/** Mark a booking paid + confirmed and send the confirmation email. Idempotent. */
export async function finalizePaidBooking(bookingId: string): Promise<Booking> {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { service: true },
  });
  if (booking.paymentStatus === "paid" && booking.confirmationSentAt) return booking;

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { paymentStatus: "paid", status: "confirmed" },
    include: { service: true },
  });

  const settings = await getSettings();
  try {
    await sendMail(confirmationEmail(updated, updated.service, settings, baseUrl()));
    await prisma.booking.update({
      where: { id: booking.id },
      data: { confirmationSentAt: new Date() },
    });
  } catch (err) {
    console.error("[bookings] confirmation email failed:", err);
  }
  return updated;
}

/**
 * Send 24-hour reminders for confirmed bookings starting within the window.
 * Called by the reminder scheduler (dev interval / production cron).
 */
export async function sendDueReminders(): Promise<number> {
  const now = DateTime.utc();
  const due = await prisma.booking.findMany({
    where: {
      status: "confirmed",
      reminderSentAt: null,
      startUtc: {
        gt: now.toJSDate(),
        lt: now.plus({ hours: 24 }).toJSDate(),
      },
    },
    include: { service: true },
  });
  if (due.length === 0) return 0;

  const settings = await getSettings();
  let sent = 0;
  for (const b of due) {
    try {
      await sendMail(reminderEmail(b, b.service, settings, baseUrl()));
      await prisma.booking.update({
        where: { id: b.id },
        data: { reminderSentAt: new Date() },
      });
      sent++;
    } catch (err) {
      console.error(`[bookings] reminder failed for ${b.id}:`, err);
    }
  }
  return sent;
}
