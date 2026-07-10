import type { Metadata } from "next";
import { PremiumGate } from "@/components/PremiumGate";

export const metadata: Metadata = {
  title: "Human Design",
  description:
    "Your bodygraph — type, strategy, authority, centers, channels and gates — computed from the same birth moment as your chart.",
};

export default function HumanDesignPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-10 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-lilac-600">
          Human Design
        </p>
        <h1 className="text-4xl text-ink-900 sm:text-5xl">The bodygraph</h1>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink-500">
          A second instrument played on the same birth moment: your type,
          strategy and authority, the nine centers, and the gates lit by the
          sky at your birth and ~88 days before it.
        </p>
      </header>
      <PremiumGate title="Human Design lives in the members' House" preview={false}>
        <div />
      </PremiumGate>
      <div className="card mt-8 p-6 text-sm leading-relaxed text-ink-700">
        <h2 className="font-heading text-xl text-ink-900">What this tab will hold</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-6">
          <li>Your rendered bodygraph — defined and open centers</li>
          <li>Type, strategy, authority &amp; profile, in plain language</li>
          <li>Channels and gates from both the conscious and design suns</li>
          <li>How it converses with your astrology — one birth, two maps</li>
        </ul>
      </div>
    </div>
  );
}
