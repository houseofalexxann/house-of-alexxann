import type { Metadata } from "next";
import { SkyWeek } from "@/components/transits/SkyWeek";

export const metadata: Metadata = {
  title: "Transits — the sky right now",
  description:
    "The current sky against your natal chart: a live wheel and written guidance. A members' feature of House of Alexxann.",
};

export default function TransitsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-10 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-lilac-600">
          Transits
        </p>
        <h1 className="text-4xl text-ink-900 sm:text-5xl">The sky, right now</h1>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-ink-500">
          Where the planets are today — and what they&#39;re saying to the
          planets you were born with. A live wheel, plain-language guidance,
          and the dates worth circling.
        </p>
      </header>
      <SkyWeek />
      <div className="card mt-8 p-6 text-sm leading-relaxed text-ink-700">
        <h2 className="font-heading text-xl text-ink-900">What this tab will hold</h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-6">
          <li>A living bi-wheel: today&#39;s sky around your natal chart</li>
          <li>Written &#34;short-term themes&#34; for your placements — not your sun sign&#39;s</li>
          <li>Moon ingresses, exact-aspect dates, retrograde stations</li>
          <li>Solar return preview for your next birthday</li>
        </ul>
      </div>
    </div>
  );
}
