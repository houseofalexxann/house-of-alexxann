/**
 * Booking orchestration: create (slot re-check + payment handoff),
 * finalize after payment, and reminder dispatch.
 */
import { DateTime } from "luxon";
import { type Booking, Prisma } from "@prisma/client";
import { prisma } from "./db";
import { isSlotFree, PENDING_HOLD_MINUTES } from "./slots";
import { getSettings } from "./settings";
import { priceTiers, serviceBySlug, type PriceTierKey, type SessionFormat } from "./services";
import { createCheckoutSession, stripeEnabled } from "./stripe";
import { confirmationEmail, directPayEmail, reminderEmail } from "./email-templates";
import { sessionUser } from "./user-auth";
import { isActiveMember, MEMBER_DISCOUNT } from "./membership";
import { discountedCents, findValidPromo, normalizeCode, redeemPromo } from "./promos";
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
  promoCode?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  notes?: string;
}

/** A refusal written for the person booking; anything else is an internal fault. */
export class BookingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BookingError";
  }
}

async function releaseStaleHolds(serviceId: string, startUtc: Date): Promise<void> {
  const now = Date.now();
  await prisma.booking.updateMany({
    where: {
      serviceId,
      startUtc,
      status: "pending",
      paymentStatus: "unpaid",
      OR: [
        { paymentMode: "direct", createdAt: { lt: new Date(now - 24 * 3600_000) } },
        { paymentMode: { not: "direct" }, createdAt: { lt: new Date(now - PENDING_HOLD_MINUTES * 60_000) } },
        { paymentMode: null, createdAt: { lt: new Date(now - PENDING_HOLD_MINUTES * 60_000) } },
      ],
    },
    data: { status: "canceled" },
  });
}

export async function createBooking(
  input: CreateBookingInput
): Promise<{ booking: Booking; paymentUrl: string }> {
  const serviceDef = serviceBySlug(input.serviceSlug);
  const service = await prisma.service.findUnique({ where: { slug: input.serviceSlug } });
  if (!service || !serviceDef) throw new BookingError("Unknown service.");

  if (!serviceDef.formats.includes(input.format)) {
    throw new BookingError("That session format isn't offered for this reading.");
  }

  // In production, card checkout only exists once Stripe is configured —
  // the dev simulator must never stand in for real payment there.
  if (
    input.paymentMethod === "checkout" &&
    !stripeEnabled() &&
    process.env.NODE_ENV === "production"
  ) {
    throw new BookingError(
      "Card checkout isn't open quite yet. Choose the direct-pay option (Venmo / Cash App / Zelle / PayPal)."
    );
  }

  const tier = priceTiers(serviceDef).find((t) => t.key === input.priceTier);
  if (!tier) throw new BookingError("Unknown price tier.");

  const start = DateTime.fromISO(input.startUtc, { zone: "utc" });
  const end = start.plus({ minutes: service.durationMinutes });

  // A visitor may hold a few times while they decide, not the whole calendar.
  const openHolds = await prisma.booking.count({
    where: {
      clientEmail: { equals: input.clientEmail, mode: "insensitive" },
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: { gt: new Date(Date.now() - 24 * 3600_000) },
    },
  });
  if (openHolds >= 3) {
    throw new BookingError(
      "You already have a few times held. Settle one of those first, or write to the House and Alexandria will sort it out."
    );
  }

  // A hold whose grace period has lapsed is released before the slot is
  // checked, so the unique index that guards the race never keeps a dead
  // hold alive on a time the calendar is offering.
  await releaseStaleHolds(service.id, start.toJSDate());

  if (!(await isSlotFree(input.serviceSlug, input.startUtc))) {
    throw new BookingError("That time was just taken. Please pick another slot.");
  }

  // Venusian Dolls (members) get their discount on every reading, applied server-side.
  const member = await sessionUser().catch(() => null);
  let discounted = isActiveMember(member)
    ? Math.round((tier.priceCents * (1 - MEMBER_DISCOUNT)) / 100) * 100
    : tier.priceCents;

  // Promo codes stack after the member discount; validated server-side.
  let promo = null;
  if (input.promoCode?.trim()) {
    const found = await findValidPromo(input.promoCode, "readings");
    if ("error" in found) throw new BookingError(found.error);
    promo = found.promo;
    discounted = discountedCents(discounted, promo);
  }

  // The redemption is taken first, atomically against the cap; a booking
  // that then fails to hold its slot gives it back.
  if (promo && !(await redeemPromo(promo))) {
    throw new BookingError("That code has reached its limit.");
  }

  let booking: Booking;
  try {
    booking = await prisma.booking.create({
      data: {
        serviceId: service.id,
        clientName: input.clientName,
        clientEmail: input.clientEmail,
        clientPhone: input.clientPhone ?? null,
        format: input.format.replace("-", "_") as never,
        startUtc: start.toJSDate(),
        endUtc: end.toJSDate(),
        clientTz: input.clientTz,
        priceCents: discounted,
        priceTier: tier.key,
        promoCode: promo ? normalizeCode(input.promoCode!) : null,
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
  } catch (err) {
    if (promo) {
      await prisma.promoCode
        .update({ where: { id: promo.id }, data: { redemptions: { decrement: 1 } } })
        .catch(() => undefined);
    }
    // The partial unique index (serviceId, startUtc) on active bookings is
    // the atomic backstop for the check-then-create race: a concurrent second
    // insert for the same slot fails here even though isSlotFree passed.
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      throw new BookingError("That time was just taken. Please pick another slot.");
    }
    throw err;
  }

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

/**
 * Mark a booking paid + confirmed and send the confirmation email. Idempotent.
 *
 * Handles the late/async-payment edge: a canceled booking is never resurrected
 * (it's recorded paid but left canceled for the admin to refund), and a slot
 * taken by someone else while payment was pending is recorded paid but held at
 * "pending" so the admin can reschedule or refund rather than double-book.
 */
export async function finalizePaidBooking(bookingId: string): Promise<Booking> {
  const booking = await prisma.booking.findUniqueOrThrow({
    where: { id: bookingId },
    include: { service: true },
  });
  if (booking.paymentStatus === "paid" && booking.confirmationSentAt) return booking;

  // Payment landed on a booking the practitioner already canceled: bank the
  // payment, but don't un-cancel and don't email a confirmation — the admin
  // sees a paid+canceled booking and can refund.
  if (booking.status === "canceled") {
    return prisma.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: "paid" },
      include: { service: true },
    });
  }

  // Slot was taken by another confirmed booking while this payment was
  // pending (only possible on delayed/async payment methods): record the
  // payment but keep this one pending for the admin to resolve.
  const service = await prisma.service.findUniqueOrThrow({ where: { id: booking.serviceId } });
  const stillFree = await isSlotFree(
    service.slug,
    DateTime.fromJSDate(booking.startUtc).toUTC().toISO()!,
    booking.id
  );
  if (!stillFree) {
    return prisma.booking.update({
      where: { id: booking.id },
      data: { paymentStatus: "paid" },
      include: { service: true },
    });
  }

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
