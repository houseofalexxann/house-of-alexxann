import type { Metadata } from "next";
import Link from "next/link";
import { DateTime } from "luxon";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { directPayOptions } from "@/lib/email-templates";
import { FORMAT_LABELS, formatPrice, type SessionFormat } from "@/lib/services";

export const metadata: Metadata = { title: "Your booking" };

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; canceled?: string }>;
}) {
  const { token, canceled } = await searchParams;
  const booking = token
    ? await prisma.booking.findUnique({
        where: { token },
        include: { service: true },
      })
    : null;

  if (!booking) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl text-ink-900">Booking not found</h1>
        <p className="mt-3 text-ink-500">
          That link doesn&apos;t match a booking — check the link in your email.
        </p>
        <Link href="/services" className="btn-gold mt-8 inline-flex">
          Browse readings
        </Link>
      </div>
    );
  }

  const settings = await getSettings();
  const when = DateTime.fromJSDate(booking.startUtc)
    .setZone(booking.clientTz)
    .toFormat("cccc, LLLL d, yyyy 'at' h:mm a ZZZZ");
  const paid = booking.paymentStatus === "paid";
  const direct = booking.paymentMode === "direct";
  const options = directPayOptions(settings);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6">
      <div className="card p-8 text-center">
        <div aria-hidden className="text-3xl text-rose-500">
          {paid ? "✦" : "☽"}
        </div>
        <h1 className="mt-3 text-3xl text-ink-900">
          {paid
            ? "Your reading is confirmed"
            : direct
              ? "One step left — send your payment"
              : canceled
                ? "Payment didn't complete"
                : "Almost there"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-500">
          {paid
            ? "A confirmation email is on its way with everything you need. A reminder will follow the day before."
            : direct
              ? "Your slot is held for 24 hours. Send the amount below and Alexandria will confirm the moment it arrives."
              : canceled
                ? "No charge was made and your slot was released. You're welcome to pick a new time."
                : "Complete payment to confirm your slot."}
        </p>

        <dl className="mx-auto mt-8 max-w-md space-y-2 text-left text-sm">
          {[
            ["Reading", booking.service.title],
            ["When", when],
            ["Length", `${booking.service.durationMinutes} minutes`],
            ["Format", FORMAT_LABELS[booking.format.replace("_", "-") as SessionFormat]],
            [
              paid ? "Paid" : "Amount",
              `${formatPrice(booking.priceCents)}${booking.priceTier !== "standard" ? ` · ${booking.priceTier} rate` : ""}`,
            ],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-6 border-b border-pearl-300/70 pb-2">
              <dt className="text-ink-400">{k}</dt>
              <dd className="text-right text-ink-900">{v}</dd>
            </div>
          ))}
        </dl>

        {!paid && direct && options.length > 0 && (
          <div className="mx-auto mt-8 max-w-md rounded-xl border border-rose-400/50 bg-rose-300/20 p-5 text-left">
            <p className="text-sm font-semibold text-ink-900">
              Send {formatPrice(booking.priceCents)} via any of these:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {options.map((o) => (
                <li key={o.label} className="flex justify-between gap-4">
                  <span className="text-ink-500">{o.label}</span>
                  <span className="font-medium text-ink-900">{o.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-500">
              Include your name in the payment note so it matches your booking.
            </p>
          </div>
        )}

        <div className="mt-10 border-t border-pearl-300/70 pt-6">
          <p className="text-sm text-ink-500">
            While you wait — your chart is free to explore.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href="/studio" className="btn-gold text-sm">
              ✦ Cast your chart
            </Link>
            <Link href="/" className="btn-ghost text-sm">
              Back home
            </Link>
          </div>
          <p className="mx-auto mt-6 max-w-sm text-xs leading-relaxed text-ink-400">
            Client accounts — with saved charts and session history — are
            coming soon. Your booking email is all you need for now.
          </p>
        </div>
      </div>
    </div>
  );
}
