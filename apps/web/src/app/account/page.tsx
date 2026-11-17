import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/user-auth";
import { prisma } from "@/lib/db";
import { exactEmail } from "@/lib/bookings";
import { getSettings } from "@/lib/settings";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { ConfirmEmailPrompt } from "@/components/auth/ConfirmEmailPrompt";
import { isActiveMember, TIER_NAMES, formatMembershipPrice } from "@/lib/membership";
import { savedProfiles } from "@/lib/profiles";
import { FREE_OTHER_CHARTS } from "@/lib/saved-charts";
import { SavedChartsShelf } from "@/components/account/SavedChartsShelf";
import { isAdmin } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Your House" };

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ confirm?: string }>;
}) {
  const user = await requireUser();
  const { confirm } = await searchParams;
  // The House Mother's key counts as membership here, as it does everywhere.
  const adminKey = await isAdmin().catch(() => false);
  // Sessions booked while signed in to this account are always shown.
  // Sessions that only share the address are shown once the address has
  // proved it is this person's: anyone can type any email into a sign-up
  // form, and a session is nobody else's business.
  const mine = [
    { userId: user.id },
    ...(user.emailVerifiedAt ? [{ clientEmail: exactEmail(user.email) }] : []),
  ];
  const [profiles, bookings, settings] = await Promise.all([
    savedProfiles(user.id),
    prisma.booking.findMany({
      where: { OR: mine, startUtc: { gte: new Date() } },
      include: { service: true },
      orderBy: { startUtc: "asc" },
      take: 5,
    }),
    getSettings(),
  ]);
  const priceLabel = formatMembershipPrice(settings.membershipPriceCents);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
            Your House
          </p>
          <h1 className="mt-1 text-4xl text-ink-900">
            Welcome, {user.name ?? "traveler"}.
          </h1>
        </div>
        <LogoutButton />
      </header>

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="card p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            Membership
          </h2>
          {isActiveMember(user) ? (
            <>
              <p className="mt-2 font-heading text-2xl text-rose-500">
                {TIER_NAMES.member} ✦
                {!user.isMember && user.memberUntil && (
                  <span className="ml-2 align-middle text-sm text-ink-400">
                    trial through{" "}
                    {user.memberUntil.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm text-ink-500">
                Every room is open to you: the deeper chart, transits, and your
                own timing calendar.
                {!user.isMember && user.memberUntil && (
                  <>
                    {" "}
                    <Link href="/join" className="text-rose-600 hover:underline">
                      Stay behind the veil for {priceLabel} a month →
                    </Link>
                  </>
                )}
              </p>
              <Link href="/calendar" className="btn-gold mt-4 inline-flex text-sm">
                ✦ My calendar
              </Link>
            </>
          ) : (
            <>
              <p className="mt-2 font-heading text-2xl text-ink-900">{TIER_NAMES.free}</p>
              <p className="mt-1 text-sm text-ink-500">
                Charts are yours forever-free. The{" "}
                <strong className="text-ink-700">{TIER_NAMES.member}</strong>{" "}
                membership, {priceLabel} a month, lifts the veil on everything: the
                deeper chart, transits, Human Design, tarot, and the blog&#39;s
                inner posts.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/join" className="btn-gold inline-flex text-sm">
                  Become a {TIER_NAMES.member} for {priceLabel}
                </Link>
                <Link href="/services" className="btn-ghost inline-flex text-sm">
                  Book a reading
                </Link>
              </div>
            </>
          )}
        </section>

        <section className="card p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            Upcoming sessions
          </h2>
          {confirm === "done" && user.emailVerifiedAt && (
            <p className="mt-2 text-xs text-ink-900" role="status">
              Your email is confirmed.
            </p>
          )}
          {bookings.length === 0 ? (
            <p className="mt-2 text-sm text-ink-500">
              {user.emailVerifiedAt
                ? "Nothing booked yet. The calendar is open."
                : "Any session you have booked is safe. Confirm your email and the ones booked with this address appear here."}
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {bookings.map((b) => (
                <li key={b.id} className="flex justify-between gap-3">
                  <span className="text-ink-900">{b.service.title}</span>
                  <span className="tabular-nums text-ink-500">
                    {b.startUtc.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {!user.emailVerifiedAt && <ConfirmEmailPrompt email={user.email} />}
        </section>

        <section className="card p-6 sm:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            Your charts
          </h2>
          <SavedChartsShelf
            initial={profiles}
            othersAllowed={isActiveMember(user) || adminKey ? null : FREE_OTHER_CHARTS}
          />
        </section>
      </div>
    </div>
  );
}
