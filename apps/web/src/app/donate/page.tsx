import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { directPayOptions } from "@/lib/email-templates";

export const metadata: Metadata = {
  title: "Support the House",
  description:
    "Keep the free chart free. Donations hold the community rate open and keep the Studio paywall-free for everyone.",
};

export default async function DonatePage() {
  const settings = await getSettings();
  const options = directPayOptions(settings);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6">
      <div className="card p-8 text-center">
        <div aria-hidden className="text-3xl text-rose-500">✦</div>
        <h1 className="mt-3 text-4xl text-ink-900">Support the House</h1>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-ink-500">
          The Chart Studio is free and stays free. Donations keep it that way —
          they hold the community rate open for people in tight seasons and pay
          for the quiet machinery underneath (real ephemerides included).
        </p>

        {options.length > 0 ? (
          <div className="mx-auto mt-8 max-w-md rounded-xl border border-pearl-300 bg-white/70 p-5 text-left">
            <p className="text-sm font-semibold text-ink-900">
              Send anything, any time:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {options.map((o) => (
                <li key={o.label} className="flex justify-between gap-4">
                  <span className="text-ink-500">{o.label}</span>
                  <span className="font-medium text-ink-900">{o.value}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-400">
              Add &#34;for the House&#34; in the note so it finds the right jar.
            </p>
          </div>
        ) : (
          <p className="mt-8 text-sm text-ink-500">
            Donation handles are being set up — check back soon.
          </p>
        )}

        <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-ink-500">
          The sweetest support of all:{" "}
          <Link href="/services" className="text-rose-600 underline-offset-2 hover:underline">
            book a reading
          </Link>
          , tell a friend, or share your chart from the Studio.
        </p>
      </div>
    </div>
  );
}
