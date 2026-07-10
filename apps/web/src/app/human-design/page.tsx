import type { Metadata } from "next";
import { HumanDesignClient } from "@/components/hd/HumanDesignClient";

export const metadata: Metadata = {
  title: "Human Design — free bodygraph calculator",
  description:
    "Your Human Design: type, strategy, authority and profile free — bodygraph, centers, channels and gates in the members' House.",
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
          One birth moment, two skies: the day you arrived and the sky
          eighty-eight degrees of Sun before it. Your type, strategy,
          authority and profile are free — the full bodygraph lives with
          members.
        </p>
      </header>
      <HumanDesignClient />
    </div>
  );
}
