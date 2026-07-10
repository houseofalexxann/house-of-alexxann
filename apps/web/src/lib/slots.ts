/**
 * Slot computation: weekly availability rules + date exceptions + buffers +
 * lead time + existing bookings → bookable UTC instants. Rules are stored in
 * the practitioner's timezone; clients see slots in their own.
 */
import { DateTime, Interval } from "luxon";
import { prisma } from "./db";
import { getSettings } from "./settings";

export interface Slot {
  /** ISO UTC start. */
  startUtc: string;
  endUtc: string;
}

/** Pending bookings hold their slot this long before expiring. */
const PENDING_HOLD_MINUTES = 30;

export async function availableSlots(
  serviceSlug: string,
  fromIso: string,
  toIso: string
): Promise<{ slots: Slot[]; durationMinutes: number }> {
  const service = await prisma.service.findUnique({ where: { slug: serviceSlug } });
  if (!service || !service.active) throw new Error("Unknown service");

  const settings = await getSettings();
  const tz = settings.practitionerTz;
  const now = DateTime.utc();
  const earliest = DateTime.max(
    DateTime.fromISO(fromIso, { zone: "utc" }),
    now.plus({ hours: settings.leadTimeHours })
  );
  const latest = DateTime.min(
    DateTime.fromISO(toIso, { zone: "utc" }),
    now.plus({ days: settings.horizonDays })
  );
  if (!earliest.isValid || !latest.isValid || earliest >= latest) {
    return { slots: [], durationMinutes: service.durationMinutes };
  }

  const [rules, exceptions, bookings] = await Promise.all([
    prisma.availabilityRule.findMany({ where: { active: true } }),
    prisma.availabilityException.findMany(),
    prisma.booking.findMany({
      where: {
        status: { in: ["pending", "confirmed"] },
        startUtc: { lt: latest.plus({ days: 1 }).toJSDate() },
        endUtc: { gt: earliest.minus({ days: 1 }).toJSDate() },
      },
      select: {
        startUtc: true,
        endUtc: true,
        status: true,
        paymentStatus: true,
        paymentMode: true,
        createdAt: true,
      },
    }),
  ]);

  // Busy intervals: confirmed bookings and fresh pending holds, padded by
  // buffer. Direct-pay (Venmo/Zelle/…) holds last 24h since the client pays
  // outside the app; checkout holds expire with the Stripe session.
  const buffer = settings.bufferMinutes;
  const busy: Interval[] = bookings
    .filter(
      (b) =>
        b.status === "confirmed" ||
        b.paymentStatus === "paid" ||
        DateTime.fromJSDate(b.createdAt).plus({
          minutes: b.paymentMode === "direct" ? 24 * 60 : PENDING_HOLD_MINUTES,
        }) > now
    )
    .map((b) =>
      Interval.fromDateTimes(
        DateTime.fromJSDate(b.startUtc).minus({ minutes: buffer }),
        DateTime.fromJSDate(b.endUtc).plus({ minutes: buffer })
      )
    );

  const byDateException = new Map(exceptions.map((e) => [e.date, e]));
  const slots: Slot[] = [];
  const duration = service.durationMinutes;

  // Walk each practitioner-local day in range.
  let day = earliest.setZone(tz).startOf("day");
  const lastDay = latest.setZone(tz).endOf("day");
  while (day <= lastDay) {
    const dateKey = day.toFormat("yyyy-MM-dd");
    const exception = byDateException.get(dateKey);

    // Windows for this day, minutes from local midnight.
    let windows: { start: number; end: number }[] = [];
    if (exception?.blocked && exception.startMinute == null) {
      windows = []; // whole day blocked
    } else {
      windows = rules
        .filter((r) => r.weekday === day.weekday % 7) // luxon: 1=Mon..7=Sun → 0=Sun
        .map((r) => ({ start: r.startMinute, end: r.endMinute }));
      if (exception && !exception.blocked && exception.startMinute != null && exception.endMinute != null) {
        windows.push({ start: exception.startMinute, end: exception.endMinute });
      }
      if (exception?.blocked && exception.startMinute != null && exception.endMinute != null) {
        // Partial-day block: subtract the interval from each window.
        windows = windows.flatMap((w) => {
          const parts: { start: number; end: number }[] = [];
          if (exception.startMinute! > w.start)
            parts.push({ start: w.start, end: Math.min(w.end, exception.startMinute!) });
          if (exception.endMinute! < w.end)
            parts.push({ start: Math.max(w.start, exception.endMinute!), end: w.end });
          return parts.filter((p) => p.end - p.start >= duration);
        });
      }
    }

    for (const w of windows) {
      for (
        let m = w.start;
        m + duration <= w.end;
        m += settings.slotStepMinutes
      ) {
        const start = day.plus({ minutes: m });
        const end = start.plus({ minutes: duration });
        if (start.toUTC() < earliest || start.toUTC() > latest) continue;
        const candidate = Interval.fromDateTimes(start, end);
        if (busy.some((b) => b.overlaps(candidate))) continue;
        slots.push({
          startUtc: start.toUTC().toISO({ suppressMilliseconds: true })!,
          endUtc: end.toUTC().toISO({ suppressMilliseconds: true })!,
        });
      }
    }
    day = day.plus({ days: 1 });
  }

  slots.sort((a, b) => a.startUtc.localeCompare(b.startUtc));
  return { slots, durationMinutes: duration };
}

/** Re-validate one candidate slot right before booking (race protection). */
export async function isSlotFree(
  serviceSlug: string,
  startUtcIso: string
): Promise<boolean> {
  const start = DateTime.fromISO(startUtcIso, { zone: "utc" });
  const { slots } = await availableSlots(
    serviceSlug,
    start.minus({ hours: 1 }).toISO()!,
    start.plus({ hours: 25 }).toISO()!
  );
  return slots.some((s) => s.startUtc === start.toISO({ suppressMilliseconds: true }));
}
