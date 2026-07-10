import type { Metadata } from "next";
import Link from "next/link";
import { DateTime } from "luxon";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Admin — client charts" };

interface ClientRow {
  clientName: string;
  clientEmail: string;
  birthDate: string;
  birthTime: string | null;
  birthPlace: string | null;
  serviceTitle: string;
  nextSessionUtc: Date | null;
}

/** /studio href with the client's birth data prefilled (only params that exist). */
function studioHref(c: ClientRow): string {
  const params: Array<[string, string]> = [
    ["name", c.clientName],
    ["date", c.birthDate],
  ];
  if (c.birthTime) params.push(["time", c.birthTime]);
  if (c.birthPlace) params.push(["place", c.birthPlace]);
  const query = params
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return `/studio?${query}`;
}

function birthSummary(c: ClientRow): string {
  const date = DateTime.fromISO(c.birthDate).toFormat("LLL d, yyyy");
  const time = c.birthTime
    ? DateTime.fromFormat(c.birthTime, "HH:mm").toFormat("h:mm a")
    : "time unknown";
  return c.birthPlace ? `${date} · ${time} · ${c.birthPlace}` : `${date} · ${time}`;
}

export default async function AdminChartsPage() {
  await requireAdmin();

  const [settings, bookings] = await Promise.all([
    getSettings(),
    prisma.booking.findMany({
      where: { birthDate: { not: null } },
      orderBy: { createdAt: "desc" },
      select: {
        clientName: true,
        clientEmail: true,
        birthDate: true,
        birthTime: true,
        birthPlace: true,
        startUtc: true,
        service: { select: { title: true } },
      },
    }),
  ]);

  // Dedupe by email, keeping the most recent booking's details (rows are
  // createdAt desc). Track each client's soonest upcoming session as we go.
  const now = new Date();
  const clients = new Map<string, ClientRow>();
  for (const b of bookings) {
    const key = b.clientEmail.toLowerCase();
    let row = clients.get(key);
    if (!row) {
      row = {
        clientName: b.clientName,
        clientEmail: b.clientEmail,
        birthDate: b.birthDate!,
        birthTime: b.birthTime,
        birthPlace: b.birthPlace,
        serviceTitle: b.service.title,
        nextSessionUtc: null,
      };
      clients.set(key, row);
    }
    if (b.startUtc > now && (!row.nextSessionUtc || b.startUtc < row.nextSessionUtc)) {
      row.nextSessionUtc = b.startUtc;
    }
  }
  const rows = [...clients.values()];

  return (
    <div>
      <h1 className="text-3xl text-ink-900">Client charts</h1>
      <p className="mt-2 text-ink-700">
        Cast any client&apos;s chart on demand — charts open in the Chart Studio
        with the client&apos;s birth details prefilled.
      </p>

      {rows.length === 0 ? (
        <div className="card mt-8 p-8 text-center">
          <span aria-hidden className="text-2xl text-rose-500">
            ✦
          </span>
          <p className="mt-2 text-ink-700">
            No clients have shared their birth data yet — the stars are patient,
            and so are we.
          </p>
          <p className="mt-4">
            <Link href="/studio" className="btn-gold text-sm">
              Open the Chart Studio →
            </Link>
          </p>
        </div>
      ) : (
        <div className="card mt-8 divide-y divide-pearl-300">
          {rows.map((c) => (
            <div
              key={c.clientEmail.toLowerCase()}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="text-ink-900">{c.clientName}</span>
                  <span className="truncate text-sm text-ink-500">
                    {c.clientEmail}
                  </span>
                </div>
                <p className="mt-1 text-sm text-ink-700">{birthSummary(c)}</p>
                <p className="mt-0.5 text-xs text-ink-400">
                  {c.serviceTitle}
                  {c.nextSessionUtc && (
                    <>
                      {" · "}
                      <span className="text-rose-600">
                        next session{" "}
                        {DateTime.fromJSDate(c.nextSessionUtc, {
                          zone: settings.practitionerTz,
                        }).toFormat("ccc, LLL d 'at' h:mm a")}
                      </span>
                    </>
                  )}
                </p>
              </div>
              <div className="shrink-0">
                <Link href={studioHref(c)} className="btn-gold text-xs">
                  Cast chart →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card mt-6 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg text-ink-900">Cast a fresh chart</h2>
          <p className="mt-1 text-sm text-ink-500">
            Any birth data can be entered manually in the Chart Studio.
          </p>
        </div>
        <Link href="/studio" className="btn-ghost text-sm">
          Open Chart Studio
        </Link>
      </div>
    </div>
  );
}
