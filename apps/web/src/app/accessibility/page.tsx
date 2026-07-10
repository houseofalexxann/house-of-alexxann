import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Accessibility",
  description:
    "Our accessibility commitment: the sky belongs to every body. How this site supports keyboard, screen-reader, low-vision and motion-sensitive visitors.",
};

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-16 sm:px-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
        Accessibility
      </p>
      <h1 className="text-4xl text-ink-900">The sky belongs to every body.</h1>

      <div className="mt-8 space-y-6 leading-relaxed text-ink-700">
        <p>
          House of Alexxann is built from a liberatory practice: access is not
          a feature, it&#39;s a promise. We want disabled, neurodivergent,
          low-vision, Deaf and hard-of-hearing, and motion-sensitive kin to be
          able to read their own sky here with dignity.
        </p>

        <section>
          <h2 className="font-heading text-2xl text-ink-900">What we do</h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-sm sm:text-base">
            <li>
              <strong>Keyboard first:</strong> every interactive control —
              forms, toggles, the dasha timeline, the listening room — is
              reachable and operable by keyboard.
            </li>
            <li>
              <strong>Screen readers:</strong> charts carry text alternatives;
              the chart wheel is labeled, and every value in it also exists as
              a real table of positions, houses and aspects.
            </li>
            <li>
              <strong>Contrast &amp; type:</strong> ink-on-pearl text targets
              WCAG AA contrast; the interface uses real text (never text baked
              into images), so it scales with your browser settings.
            </li>
            <li>
              <strong>Motion:</strong> the drifting background honors{" "}
              <code className="rounded bg-pearl-200 px-1">prefers-reduced-motion</code>{" "}
              and holds still when your system asks it to.
            </li>
            <li>
              <strong>Language:</strong> plain-language explanations sit beside
              every technical term — the <Link href="/codex" className="text-rose-600 underline-offset-2 hover:underline">Codex</Link>{" "}
              exists so nobody needs prior fluency to belong here.
            </li>
            <li>
              <strong>No flashing content, no autoplaying sound.</strong> Music
              plays only when you choose it.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-heading text-2xl text-ink-900">Readings, accessibly</h2>
          <p className="mt-3 text-sm sm:text-base">
            Live readings can include captions on video calls, extra time at no
            charge, plain-text follow-up notes, and phone or written formats if
            video doesn&#39;t work for your body. Tell us what access looks
            like for you in the booking notes — it will be honored, not
            negotiated.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-2xl text-ink-900">Help us do better</h2>
          <p className="mt-3 text-sm sm:text-base">
            If anything here is hard to use with your assistive tech, that is
            our bug, not yours. Write to us from the booking page or reply to
            any of our emails — access feedback goes to the top of the queue.
          </p>
        </section>
      </div>
    </div>
  );
}
