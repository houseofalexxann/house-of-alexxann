import type { Metadata } from "next";
import Link from "next/link";
import { sessionUser } from "@/lib/user-auth";
import { getSettings } from "@/lib/settings";
import { stripeEnabled } from "@/lib/stripe";
import { JoinCheckoutButton } from "@/components/membership/JoinCheckoutButton";
import {
  MEMBERSHIP_PRICE_LABEL,
  PREMIUM_FEATURES,
  TIER_NAMES,
} from "@/lib/membership";

export const metadata: Metadata = {
  title: "Become a Venusian Doll",
  description:
    "The Venusian Doll membership — $5 a month lifts the veil on every room of the House.",
};

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; canceled?: string }>;
}) {
  const [user, settings, params] = await Promise.all([
    sessionUser(),
    getSettings(),
    searchParams,
  ]);
  const isMember = !!user && (user.isMember || user.role === "admin");
  const cardCheckout = stripeEnabled();

  const handles: Array<[string, string]> = [
    ["Venmo", settings.venmoHandle],
    ["Cash App", settings.cashAppTag],
    ["Zelle", settings.zelleContact],
    ["PayPal", settings.paypalMeLink],
  ].filter((h): h is [string, string] => !!h[1]);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-14 sm:px-6">
      <header className="text-center">
        <span aria-hidden className="text-3xl text-rose-500">✦</span>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
          {TIER_NAMES.member} membership
        </p>
        <h1 className="mt-2 text-4xl text-ink-900">Step behind the veil</h1>
        <p className="mx-auto mt-3 max-w-md text-ink-500">
          <strong className="text-ink-900">{MEMBERSHIP_PRICE_LABEL} a month</strong>{" "}
          opens every room of the House — and a 10% embrace on every reading
          with Alexandria.
        </p>
      </header>

      {params.welcome && !isMember && (
        <div className="card mt-8 border-rose-300/60 p-5 text-center text-sm text-ink-700">
          ✦ Thank you — your payment is settling. The veil lifts within moments;
          refresh this page and it will greet you properly.
        </div>
      )}
      {params.canceled && (
        <div className="card mt-8 p-5 text-center text-sm text-ink-500">
          No pressure at all — the House isn&#39;t going anywhere. The free rooms
          stay open, and this page will be here when you&#39;re ready.
        </div>
      )}

      <section className="card mt-10 p-8">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
          Behind the veil lives
        </h2>
        <ul className="mt-4 space-y-2.5 text-sm text-ink-700">
          {PREMIUM_FEATURES.map((f) => (
            <li key={f} className="flex gap-2.5">
              <span aria-hidden className="text-rose-400">✦</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </section>

      {isMember ? (
        <section className="card mt-6 border-rose-300/60 p-8 text-center">
          <p className="font-heading text-2xl text-rose-500">
            The veil is already lifted for you ✦
          </p>
          <p className="mt-2 text-sm text-ink-500">
            Every room is open. Wander freely.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Link href="/western" className="btn-gold text-sm">The Studio</Link>
            <Link href="/tarot" className="btn-ghost text-sm">Tarot room</Link>
            <Link href="/human-design" className="btn-ghost text-sm">Human Design</Link>
          </div>
        </section>
      ) : (
        <section className="card mt-6 p-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
            How the veil lifts
          </h2>
          <ol className="mt-4 space-y-4 text-sm text-ink-700">
            <li className="flex gap-3">
              <span className="font-heading text-lg text-rose-500">1</span>
              <span>
                {user ? (
                  <>You&#39;re signed in as <strong>{user.email}</strong> — perfect.</>
                ) : (
                  <>
                    <Link href="/signup" className="text-rose-600 hover:underline">
                      Create your free account
                    </Link>{" "}
                    (or{" "}
                    <Link href="/login" className="text-rose-600 hover:underline">
                      sign in
                    </Link>
                    ) so the House knows whose veil to lift.
                  </>
                )}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-heading text-lg text-rose-500">2</span>
              <span>
                {cardCheckout && user && (
                  <span className="mb-3 block">
                    <JoinCheckoutButton />
                    <span className="mt-1.5 block text-xs text-ink-400">
                      Card checkout — renews itself monthly, cancel anytime, veil
                      lifts on its own within moments.
                    </span>
                  </span>
                )}
                {cardCheckout ? (
                  <>Or send <strong>{MEMBERSHIP_PRICE_LABEL}</strong> directly</>
                ) : (
                  <>Send <strong>{MEMBERSHIP_PRICE_LABEL}</strong></>
                )}{" "}
                with your account email in the note, any way you love:
                {handles.length > 0 ? (
                  <span className="mt-2 flex flex-wrap gap-2">
                    {handles.map(([label, value]) => (
                      <span
                        key={label}
                        className="rounded-full border border-pearl-300 bg-white/70 px-3 py-1 text-xs text-ink-700"
                      >
                        <strong className="text-rose-600">{label}</strong> {value}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="mt-2 block text-ink-500">
                    Payment details are being polished — reach out through the{" "}
                    <Link href="/faq" className="text-rose-600 hover:underline">
                      FAQ page
                    </Link>{" "}
                    and Alexandria will take care of you.
                  </span>
                )}
              </span>
            </li>
            <li className="flex gap-3">
              <span className="font-heading text-lg text-rose-500">3</span>
              <span>
                {cardCheckout
                  ? "Card checkout lifts your veil automatically; for direct payments, Alexandria lifts it "
                  : "Alexandria lifts your veil — "}
                usually within the day. Your account turns{" "}
                <strong>{TIER_NAMES.member}</strong> and every room opens.
              </span>
            </li>
          </ol>
          {!user && (
            <Link href="/signup" className="btn-gold mt-6 inline-flex text-sm">
              Create my free account first
            </Link>
          )}
        </section>
      )}

      <p className="mt-6 text-center text-xs text-ink-400">
        Sliding scale, always: if {MEMBERSHIP_PRICE_LABEL} is a stretch this
        season, write to the House — nobody is turned away from the sky.
      </p>
    </div>
  );
}
