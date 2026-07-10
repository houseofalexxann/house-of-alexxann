import type { Metadata } from "next";
import { TarotClient } from "@/components/tarot/TarotClient";

export const metadata: Metadata = {
  title: "Tarot — draws, spreads & message cards",
  description:
    "Interactive tarot from House of Alexxann: a free daily draw of the major arcana, three-card spreads, and the House's own divinity message cards.",
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
          Twenty-two doors of the major arcana, read in this House&#39;s voice —
          plus the House&#39;s own message cards, small blessings for heavy
          pockets. Daily draw is free; spreads and messages open for Icons.
        </p>
      </header>
      <TarotClient />
      <p className="mt-14 text-center text-xs text-ink-400">
        The full 78-card deck — each minor card with its decan from your chart
        — is being illustrated and arrives with the members&#39; library.
      </p>
    </div>
  );
}
