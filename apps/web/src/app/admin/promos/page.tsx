import type { Metadata } from "next";
import { DateTime } from "luxon";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { KIND_LABELS, promoSummary, type PromoKind } from "@/lib/promos";
import { PromoCreateForm, PromoToggle } from "@/components/admin/PromoManager";

export const metadata: Metadata = { title: "Promo codes" };

export default async function AdminPromosPage() {
  await requireAdmin();
  const promos = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <h1 className="text-3xl text-ink-900">Promo codes</h1>
      <p className="mt-1 text-sm text-ink-500">
        Discounts on readings and membership, and free-trial keys. Share a code
        anywhere — visitors enter it at booking or on the Join page.
      </p>

      <PromoCreateForm />

      <section className="mt-10">
        <h2 className="text-xl text-ink-900">Every code</h2>
        {promos.length === 0 ? (
          <p className="card mt-3 p-5 text-sm text-ink-500">
            No codes yet — the form above mints the first one. ✦
          </p>
        ) : (
          <div className="card mt-3 overflow-x-auto p-0">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-pearl-300 text-xs uppercase tracking-wide text-ink-400">
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">For</th>
                  <th className="px-4 py-3">Grants</th>
                  <th className="px-4 py-3">Used</th>
                  <th className="px-4 py-3">Expires</th>
                  <th className="px-4 py-3">Note</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {promos.map((p) => (
                  <tr
                    key={p.id}
                    className={`border-b border-pearl-200 last:border-0 ${p.active ? "" : "opacity-45"}`}
                  >
                    <td className="px-4 py-3 font-mono text-ink-900">{p.code}</td>
                    <td className="px-4 py-3 text-ink-700">
                      {KIND_LABELS[p.kind as PromoKind] ?? p.kind}
                    </td>
                    <td className="px-4 py-3 text-ink-700">{promoSummary(p)}</td>
                    <td className="px-4 py-3 tabular-nums text-ink-700">
                      {p.redemptions}
                      {p.maxRedemptions != null ? ` / ${p.maxRedemptions}` : ""}
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {p.expiresAt
                        ? DateTime.fromJSDate(p.expiresAt).toFormat("LLL d, yyyy")
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-ink-500">{p.note ?? ""}</td>
                    <td className="px-4 py-3 text-right">
                      <PromoToggle id={p.id} active={p.active} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
