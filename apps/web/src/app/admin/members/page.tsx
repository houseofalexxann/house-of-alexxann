import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { MemberToggle } from "@/components/admin/MemberToggle";

export default async function AdminMembersPage() {
  await requireAdmin();
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <div>
      <h1 className="text-3xl text-ink-900">Members</h1>
      <p className="mt-1 text-sm text-ink-500">
        Everyone who has created an account. Toggle ✦ to grant or pause
        membership (until Stripe subscriptions automate it).
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-pearl-400/60 text-left text-xs uppercase tracking-widest text-ink-400">
              <th className="py-2 pr-3 font-medium">Name</th>
              <th className="py-2 pr-3 font-medium">Email</th>
              <th className="py-2 pr-3 font-medium">Joined</th>
              <th className="py-2 font-medium">Membership</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-pearl-300/50 last:border-0">
                <td className="py-2 pr-3 text-ink-900">
                  {u.name ?? "—"}
                  {u.role === "admin" && (
                    <span className="ml-2 rounded-full bg-rose-300/40 px-2 py-0.5 text-[10px] font-semibold uppercase text-rose-600">
                      admin
                    </span>
                  )}
                </td>
                <td className="py-2 pr-3 text-ink-700">{u.email}</td>
                <td className="py-2 pr-3 tabular-nums text-ink-500">
                  {u.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="py-2">
                  <MemberToggle id={u.id} isMember={u.isMember} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="mt-4 text-sm text-ink-500">No accounts yet.</p>
        )}
      </div>
    </div>
  );
}
