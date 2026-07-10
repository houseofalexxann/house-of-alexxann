import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/user-auth";
import { prisma } from "@/lib/db";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { TIER_NAMES } from "@/lib/membership";

export const metadata: Metadata = { title: "Your House" };

export default async function AccountPage() {
  const user = await requireUser();
  const [profiles, bookings] = await Promise.all([
    prisma.birthProfile.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
    prisma.booking.findMany({
      where: { clientEmail: user.email, startUtc: { gte: new Date() } },
      include: { service: true },
      orderBy: { startUtc: "asc" },
      take: 5,
    }),
  ]);

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
          {user.isMember ? (
            <>
              <p className="mt-2 font-heading text-2xl text-rose-500">{TIER_NAMES.member} ✦</p>
              <p className="mt-1 text-sm text-ink-500">
                Every room is open to you — deeper chart, transits, and the
                rooms still being furnished.
              </p>
            </>
          ) : (
            <>
              <p className="mt-2 font-heading text-2xl text-ink-900">{TIER_NAMES.free}</p>
              <p className="mt-1 text-sm text-ink-500">
                Charts are yours forever-free. Membership (the deeper chart,
                transits, Human Design, tarot, the blog&#39;s inner posts)
                opens soon — readings include everything today.
              </p>
              <Link href="/services" className="btn-gold mt-4 inline-flex text-sm">
                Book a reading
              </Link>
            </>
          )}
        </section>

        <section className="card p-6">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            Upcoming sessions
          </h2>
          {bookings.length === 0 ? (
            <p className="mt-2 text-sm text-ink-500">
              Nothing booked yet — the calendar is open.
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
        </section>

        <section className="card p-6 sm:col-span-2">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            Your birth details
          </h2>
          {profiles.length === 0 ? (
            <p className="mt-2 text-sm text-ink-500">
              Cast a chart in the{" "}
              <Link href="/western" className="text-rose-600 hover:underline">Studio</Link>{" "}
              and it can live here — saved charts arrive with the dashboard&#39;s
              next furnishing.
            </p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {profiles.map((p) => (
                <li key={p.id} className="flex flex-wrap justify-between gap-2">
                  <span className="text-ink-900">{p.name}</span>
                  <span className="text-ink-500">
                    {p.birthDate}
                    {p.birthTime ? ` · ${p.birthTime}` : ""} · {p.placeLabel}
                  </span>
                  <Link
                    className="text-rose-600 hover:underline"
                    href={`/western?name=${encodeURIComponent(p.name)}&date=${p.birthDate}${p.birthTime ? `&time=${p.birthTime}` : ""}&place=${encodeURIComponent(p.placeLabel)}`}
                  >
                    Cast →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
