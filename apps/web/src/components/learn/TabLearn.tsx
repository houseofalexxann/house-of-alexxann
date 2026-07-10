import Link from "next/link";
import { GLOSSARY, NAKSHATRA_LEGEND, VEDIC_TERMS } from "@/lib/learn-data";

/** The Learn shelf that lives at the bottom of each system's tab. */
export function TabLearn({ system }: { system: "western" | "vedic" }) {
  const entries =
    system === "western"
      ? GLOSSARY.filter(([t]) => !VEDIC_TERMS.has(t))
      : GLOSSARY.filter(([t]) => VEDIC_TERMS.has(t));

  return (
    <section className="mx-auto mt-16 max-w-4xl px-4 sm:px-6">
      <div className="card p-6 sm:p-8">
        <h2 className="font-heading text-2xl text-ink-900">
          {system === "western"
            ? "Learn the Western language"
            : "Learn the Vedic language"}
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          {system === "western"
            ? "The Hellenistic terms behind your chart — tap any to open."
            : "The Jyotish terms behind your chart, honored on their own — tap any to open."}
        </p>

        <div className="mt-5 space-y-2">
          {entries.map(([term, def]) => (
            <details key={term} className="group rounded-lg border border-pearl-300 bg-white/50 px-4 py-2.5">
              <summary className="cursor-pointer list-none text-sm font-medium text-rose-600 marker:content-none">
                <span className="mr-2 inline-block transition-transform group-open:rotate-45">＋</span>
                {term}
              </summary>
              <p className="mt-2 pl-6 text-sm leading-relaxed text-ink-700">{def}</p>
            </details>
          ))}
        </div>

        {system === "vedic" && (
          <div className="mt-8">
            <h3 className="text-xs font-semibold uppercase tracking-[0.25em] text-ink-400">
              The 27 nakshatras &amp; their deities
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {NAKSHATRA_LEGEND.map(([name, deity, lord], i) => (
                    <tr key={name} className="border-b border-pearl-300/50 last:border-0">
                      <td className="py-1.5 pr-3 tabular-nums text-ink-400">{i + 1}</td>
                      <td className="py-1.5 pr-3 text-ink-900">{name}</td>
                      <td className="py-1.5 pr-3 text-ink-700">{deity}</td>
                      <td className="py-1.5 text-ink-500">{lord}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="mt-6 text-sm text-ink-500">
          {system === "western" ? (
            <>
              Go deeper:{" "}
              <Link className="text-rose-600 hover:underline" href="/codex#decans">the 36 decans</Link>,{" "}
              <Link className="text-rose-600 hover:underline" href="/codex#bounds">the Egyptian bounds</Link>,{" "}
              <Link className="text-rose-600 hover:underline" href="/codex#zr">zodiacal releasing</Link>, and{" "}
              <Link className="text-rose-600 hover:underline" href="/codex#legend">every glyph</Link> — in the full Codex.
            </>
          ) : (
            <>
              The full library — glyphs, decans, bounds, sources &amp; lineage —
              lives in <Link className="text-rose-600 hover:underline" href="/codex">the Codex</Link>.
            </>
          )}
        </p>
      </div>
    </section>
  );
}
