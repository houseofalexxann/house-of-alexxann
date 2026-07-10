import type { Metadata } from "next";
import { DateTime } from "luxon";
import type { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { FORMAT_LABELS, formatPrice, type SessionFormat } from "@/lib/services";
import { MarkPaidButton, CancelButton } from "@/components/admin/BookingActions";

export const metadata: Metadata = { title: "Bookings" };

type BookingWithService = Prisma.BookingGetPayload<{ include: { service: true } }>;

function formatLabel(format: string): string {
  return FORMAT_LABELS[format.replace("_", "-") as SessionFormat] ?? format;
}

function whenIn(startUtc: Date, zone: string): string {
  return DateTime.fromJSDate(startUtc)
    .setZone(zone)
    .toFormat("ccc, LLL d 'at' h:mm a ZZZZ");
}

const PAYMENT_BADGE: Record<string, string> = {
  paid: "bg-rose-300/30 text-rose-600",
  unpaid: "bg-pearl-300/60 text-ink-500",
  refunded: "bg-pearl-300/40 text-ink-400",
};

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-pearl-300/60 text-ink-500",
  confirmed: "bg-rose-300/30 text-rose-600",
  completed: "bg-pearl-300/40 text-ink-500",
  canceled: "bg-pearl-300/40 text-ink-400",
};

function Badge({ label, classes }: { label: string; classes: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${classes}`}>{label}</span>
  );
}

function ClientLine({ b }: { b: BookingWithService }) {
  return (
    <div>
      <p className="font-medium text-ink-900">{b.clientName}</p>
      <p className="text-sm text-ink-500">
        {b.clientEmail}
        {b.clientPhone ? ` · ${b.clientPhone}` : ""}
      </p>
    </div>
  );
}

function SessionLines({
  b,
  practitionerTz,
}: {
  b: BookingWithService;
  practitionerTz: string;
}) {
  const showClientTz = b.clientTz !== practitionerTz;
  return (
    <div className="mt-3 space-y-1 text-sm text-ink-700">
      <p>
        {b.service.title} · {formatLabel(b.format)}
      </p>
      <p>{whenIn(b.startUtc, practitionerTz)}</p>
      {showClientTz && (
        <p className="text-ink-400">
          {whenIn(b.startUtc, b.clientTz)} — client&apos;s local time
        </p>
      )}
      <p>
        {formatPrice(b.priceCents)}
        <span className="text-ink-500"> · {b.priceTier} rate</span>
      </p>
    </div>
  );
}

export default async function AdminBookingsPage() {
  await requireAdmin();

  const settings = await getSettings();
  const now = DateTime.utc();
  const monthStart = now.setZone(settings.practitionerTz).startOf("month");
  const monthEnd = monthStart.plus({ months: 1 });

  const [awaiting, upcoming, recent, paidThisMonth] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: "pending",
        paymentMode: "direct",
        startUtc: { gt: now.toJSDate() },
      },
      orderBy: { startUtc: "asc" },
      include: { service: true },
    }),
    prisma.booking.findMany({
      where: {
        status: "confirmed",
        startUtc: { gte: now.toJSDate(), lte: now.plus({ days: 30 }).toJSDate() },
      },
      orderBy: { startUtc: "asc" },
      include: { service: true },
    }),
    prisma.booking.findMany({
      where: {
        OR: [
          { startUtc: { lt: now.toJSDate() } },
          { status: { in: ["canceled", "completed"] } },
        ],
      },
      orderBy: { startUtc: "desc" },
      take: 10,
      include: { service: true },
    }),
    prisma.booking.aggregate({
      _sum: { priceCents: true },
      where: {
        paymentStatus: "paid",
        startUtc: { gte: monthStart.toJSDate(), lt: monthEnd.toJSDate() },
      },
    }),
  ]);

  const stats: Array<[string, string]> = [
    ["Upcoming", String(upcoming.length)],
    ["Awaiting payment", String(awaiting.length)],
    ["Revenue this month", formatPrice(paidThisMonth._sum.priceCents ?? 0)],
  ];

  return (
    <div>
      <h1 className="text-3xl text-ink-900">Bookings</h1>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {stats.map(([label, value]) => (
          <div key={label} className="card px-5 py-4">
            <p className="text-xs uppercase tracking-wide text-ink-400">{label}</p>
            <p className="mt-1 text-2xl text-ink-900">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <h2 className="text-xl text-ink-900">Awaiting payment</h2>
        <p className="mt-1 text-sm text-ink-500">
          Direct payments (Venmo / Cash App / Zelle / PayPal) to confirm once
          the money lands. Marking paid sends the confirmation email.
        </p>
        {awaiting.length === 0 ? (
          <p className="card mt-4 p-5 text-sm text-ink-500">
            Nothing waiting on payment — every held slot is settled. ✦
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {awaiting.map((b) => (
              <li key={b.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <ClientLine b={b} />
                  <div className="flex items-center gap-4">
                    <MarkPaidButton bookingId={b.id} />
                    <CancelButton bookingId={b.id} />
                  </div>
                </div>
                <SessionLines b={b} practitionerTz={settings.practitionerTz} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl text-ink-900">Upcoming</h2>
        <p className="mt-1 text-sm text-ink-500">
          Confirmed readings over the next 30 days.
        </p>
        {upcoming.length === 0 ? (
          <p className="card mt-4 p-5 text-sm text-ink-500">
            A quiet stretch ahead — no confirmed readings on the books yet.
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {upcoming.map((b) => (
              <li key={b.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <ClientLine b={b} />
                  <Badge
                    label={b.paymentStatus}
                    classes={PAYMENT_BADGE[b.paymentStatus] ?? PAYMENT_BADGE.unpaid}
                  />
                </div>
                <SessionLines b={b} practitionerTz={settings.practitionerTz} />
                {(b.birthDate || b.birthTime || b.birthPlace) && (
                  <p className="mt-2 text-sm text-ink-500">
                    Birth:{" "}
                    {[b.birthDate, b.birthTime, b.birthPlace]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
                {b.notes && (
                  <p className="mt-2 text-sm italic text-ink-400">
                    &ldquo;{b.notes}&rdquo;
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl text-ink-900">Recent</h2>
        {recent.length === 0 ? (
          <p className="card mt-4 p-5 text-sm text-ink-500">
            No past bookings yet — your history will gather here.
          </p>
        ) : (
          <div className="card mt-4 divide-y divide-pearl-300/70">
            {recent.map((b) => (
              <div
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm"
              >
                <div>
                  <span className="font-medium text-ink-900">{b.clientName}</span>
                  <span className="text-ink-500"> · {b.service.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-ink-500">
                    {whenIn(b.startUtc, settings.practitionerTz)}
                  </span>
                  <Badge
                    label={b.status}
                    classes={STATUS_BADGE[b.status] ?? STATUS_BADGE.pending}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
