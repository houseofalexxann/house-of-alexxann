import type { Metadata } from "next";
import { PremiumGate } from "@/components/PremiumGate";

export const metadata: Metadata = {
  title: "Tarot",
  description:
    "The tarot room — draws and spreads with authored meanings, connected to the decans of your chart.",
};

export default function TarotPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-10 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-lilac-600">
          Tarot
        </p>
        <h1 className="text-4xl text-ink-900 sm:text-5xl">The tarot room</h1>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink-500">
          Seventy-eight doors. Daily draws, honest spreads, and card meanings
          written in this House&#39;s voice — including each minor card&#39;s
          decan, so the tarot and your chart speak to each other.
        </p>
      </header>
      <PremiumGate title="The tarot room lives in the members' House" preview={false}>
        <div />
      </PremiumGate>
      <div className="card mt-8 p-6 text-sm leading-relaxed text-ink-700">
        <h2 className="font-heading text-xl text-ink-900">What this tab will hold</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-6">
          <li>A daily one-card draw with journal prompts</li>
          <li>Spreads: three-card, relationship, decision, year-ahead</li>
          <li>All 78 meanings, upright &amp; reversed, decans included</li>
          <li>Draw history saved to your account</li>
        </ul>
      </div>
    </div>
  );
}
