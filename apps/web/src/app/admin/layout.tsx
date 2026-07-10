import Link from "next/link";
import { LogoutClient } from "@/components/admin/LogoutClient";

/**
 * Admin shell. Auth is enforced per-page via requireAdmin() (the login page
 * lives inside this segment, so the layout itself stays public).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
      <nav className="mb-8 flex flex-wrap items-center gap-1 rounded-full border border-pearl-300 bg-white/70 px-2 py-1.5 text-sm">
        <span className="px-3 font-heading text-base text-rose-600">✦ Back office</span>
        {[
          ["/admin", "Bookings"],
          ["/admin/availability", "Availability & settings"],
          ["/admin/clients", "Clients"],
          ["/admin/charts", "Client charts"],
          ["/admin/blog", "Blog"],
          ["/admin/members", "Members"],
        ].map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className="rounded-full px-3 py-1 text-ink-700 transition-colors hover:bg-rose-300/30 hover:text-ink-900"
          >
            {label}
          </Link>
        ))}
        <LogoutClient />
      </nav>
      {children}
    </div>
  );
}
