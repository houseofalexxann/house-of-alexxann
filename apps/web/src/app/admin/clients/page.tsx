import Link from "next/link";
import { DateTime } from "luxon";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/services";

/**
 * The client book: every soul who has ever booked or joined, assembled
 * automatically from bookings + accounts — contact, birth data, history,
 * spend — no manual entry, ever.
 */
export default async function AdminClientsPage() {
  await requireAdmin();
  const [settings, bookings, users] = await Promise.all([
    getSettings(),
    prisma.booking.findMany({
      include: { service: true },
      orderBy: { startUtc: "desc" },
    }),
    prisma.user.findMany({ include: { profiles: { orderBy: { createdAt: "desc" }, take: 1 } } }),
  ]);

  const userByEmail = new Map(users.map((u) => [u.email.toLowerCase(), u]));

  interface Client {
    name: string;
    email: string;
    phone: string | null;
    birthDate: string | null;
    birthTime: string | null;
    birthPlace: string | null;
    sessions: number;
    paidCents: number;
    lastSeen: Date;
    nextSession: Date | null;
    latestNote: string | null;
    isMember: boolean;
    hasAccount: boolean;
  }

  const clients = new Map<string, Client>();
  const now = new Date();

  for (const b of bookings) {
    const key = b.clientEmail.toLowerCase();
    const existing = clients.get(key);
    const c: Client = existing ?? {
      name: b.clientName,
      email: b.clientEmail,
      phone: null,
      birthDate: null,
      birthTime: null,
      birthPlace: null,
      sessions: 0,
      paidCents: 0,
      lastSeen: b.startUtc,
      nextSession: null,
      latestNote: null,
      isMember: false,
      hasAccount: false,
    };
    c.sessions += 1;
    if (b.paymentStatus === "paid") c.paidCents += b.priceCents;
    c.phone = c.phone ?? b.clientPhone;
    c.birthDate = c.birthDate ?? b.birthDate;
    c.birthTime = c.birthTime ?? b.birthTime;
    c.birthPlace = c.birthPlace ?? b.birthPlace;
    c.latestNote = c.latestNote ?? b.notes;
    if (b.startUtc > now && b.status === "confirmed" && (!c.nextSession || b.startUtc < c.nextSession)) {
      c.nextSession = b.startUtc;
    }
    clients.set(key, c);
  }

  // Accounts without bookings appear too; accounts enrich booking clients.
  for (const u of users) {
    const key = u.email.toLowerCase();
    const profile = u.profiles[0];
    const existing = clients.get(key);
    if (existing) {
      existing.hasAccount = true;
      existing.isMember = u.isMember;
      existing.birthDate = existing.birthDate ?? profile?.birthDate ?? null;
      existing.birthTime = existing.birthTime ?? profile?.birthTime ?? null;
      existing.birthPlace = existing.birthPlace ?? profile?.placeLabel ?? null;
    } else if (u.role !== "admin") {
      clients.set(key, {
        name: u.name ?? u.email,
        email: u.email,
        phone: null,
        birthDate: profile?.birthDate ?? null,
        birthTime: profile?.birthTime ?? null,
        birthPlace: profile?.placeLabel ?? null,
        sessions: 0,
        paidCents: 0,
        lastSeen: u.createdAt,
        nextSession: null,
        latestNote: null,
        isMember: u.isMember,
        hasAccount: true,
      });
    }
  }

  const list = [...clients.values()].sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());
  const tz = settings.practitionerTz;
  const fmt = (d: Date) => DateTime.fromJSDate(d).setZone(tz).toFormat("LLL d, yyyy");

  return (
    <div>
      <h1 className="text-3xl text-ink-900">The client book</h1>
      <p className="mt-1 text-sm text-ink-500">
        Every client and member, assembled automatically from bookings and
        accounts — nothing entered twice.
      </p>
      <p className="mt-2 text-xs text-ink-400">
        {list.length} people · {list.filter((c) => c.isMember).length} members ·{" "}
        {list.filter((c) => c.birthDate).length} with birth data on file
      </p>

      <div className="mt-6 space-y-3">
        {list.length === 0 && (
          <p className="card p-5 text-sm text-ink-500">No clients yet — the book is open.</p>
        )}
        {list.map((c) => (
          <div key={c.email} className="card p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-heading text-lg text-ink-900">
                {c.name}
                {c.isMember && <span className="ml-2 text-rose-600">✦</span>}
                {c.hasAccount && !c.isMember && (
                  <span className="ml-2 rounded-full bg-pearl-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-ink-500">
                    account
                  </span>
                )}
              </p>
              <p className="text-xs text-ink-400">
                {c.sessions > 0
                  ? `${c.sessions} session${c.sessions === 1 ? "" : "s"} · ${formatPrice(c.paidCents)} paid`
                  : "no sessions yet"}
              </p>
            </div>
            <div className="mt-2 grid gap-x-8 gap-y-1 text-sm text-ink-700 sm:grid-cols-2">
              <p>
                <span className="text-ink-400">Contact:</span> {c.email}
                {c.phone && ` · ${c.phone}`}
              </p>
              <p>
                <span className="text-ink-400">Birth:</span>{" "}
                {c.birthDate
                  ? `${c.birthDate}${c.birthTime ? ` · ${c.birthTime}` : " · time unknown"}${c.birthPlace ? ` · ${c.birthPlace}` : ""}`
                  : "not shared yet"}
              </p>
              {c.nextSession && (
                <p>
                  <span className="text-ink-400">Next session:</span>{" "}
                  <strong className="text-ink-900">{fmt(c.nextSession)}</strong>
                </p>
              )}
              {c.latestNote && (
                <p className="sm:col-span-2">
                  <span className="text-ink-400">Latest note:</span>{" "}
                  {c.latestNote.slice(0, 160)}
                </p>
              )}
            </div>
            {c.birthDate && (
              <div className="mt-3">
                <Link
                  className="btn-ghost text-xs"
                  href={`/western?name=${encodeURIComponent(c.name)}&date=${c.birthDate}${c.birthTime ? `&time=${c.birthTime}` : ""}${c.birthPlace ? `&place=${encodeURIComponent(c.birthPlace)}` : ""}`}
                >
                  Cast their chart →
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
