import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Questions about readings, birth times, payment options, privacy, and how House of Alexxann works.",
};

const FAQS: [string, React.ReactNode][] = [
  [
    "Is the chart really free?",
    <>Yes — casting your natal chart in the <Link className="text-rose-600 underline-offset-2 hover:underline" href="/studio">Chart Studio</Link> is free, no account, no paywall. The deeper layers (dignities, lots, zodiacal releasing, transits, Human Design, tarot) are part of the coming membership, and every live reading includes all of them.</>,
  ],
  [
    "I don't know my exact birth time. Can I still get a chart or a reading?",
    <>Absolutely. Check &#34;time unknown&#34; in the Studio — you&#39;ll still get accurate planetary positions; we simply hold back the parts that need a precise time (Ascendant, houses). In readings we work carefully with what you have, and rectification can be discussed.</>,
  ],
  [
    "What's the difference between the Western and Vedic charts?",
    <>Two zodiacs, one sky. Western (tropical) counts from the equinox; Vedic (sidereal) counts from the stars, about 24° apart. Same birth, two lenses — the Studio computes both, and the <Link className="text-rose-600 underline-offset-2 hover:underline" href="/codex">Codex</Link> explains every term.</>,
  ],
  [
    "How do payments work?",
    <>Choose your rate on a sliding scale — community, standard, or sustainer; the reading is identical at every tier. Pay by card, Pay-in-4 (Klarna/Afterpay), monthly installments (Affirm), Cash App Pay, PayPal — or send it directly by Venmo, Cash App, Zelle or PayPal and your slot is held 24 hours while it arrives.</>,
  ],
  [
    "What happens in a reading?",
    <>We meet live — video, phone, or in person. Your chart is cast and studied before we begin. You bring your questions; I bring the sky. You&#39;ll leave with a recording of what matters (notes on request), your chart image, and language for what you already suspected about yourself.</>,
  ],
  [
    "Is my birth data safe?",
    <>Birth date, time and place are sensitive personal data and are treated that way: charts cast in the Studio are computed on request and not stored; booking details are used only to prepare and deliver your reading; nothing is ever sold or shared. See our <Link className="text-rose-600 underline-offset-2 hover:underline" href="/accessibility">accessibility &amp; care</Link> commitments too.</>,
  ],
  [
    "Do you read for queer and trans people?",
    <>This House is queer- and trans-built. The readings assume nothing about your gender, your body, or the shape of your love — and the tradition is read as liberation material, not a cage. You are not an edge case here; you&#39;re the intended reader.</>,
  ],
  [
    "Can I gift a reading?",
    <>Yes — book any reading with the recipient&#39;s name in the notes and your email for the receipt, and we&#39;ll coordinate a time with them directly. Gift certificates are coming with accounts.</>,
  ],
  [
    "What tradition do you practice?",
    <>Both Western and Vedic, held honestly: Hellenistic foundations (sect, dignities, lots, zodiacal releasing — the lineage of Valens and Abu Ma&#39;shar), modern psychological insight, and Jyotish (nakshatras, dashas, divisional charts). The <Link className="text-rose-600 underline-offset-2 hover:underline" href="/codex">Codex</Link> is the open notebook.</>,
  ],
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-10 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
          FAQ
        </p>
        <h1 className="text-4xl text-ink-900">Asked, answered</h1>
      </header>
      <div className="space-y-3">
        {FAQS.map(([q, a]) => (
          <details key={q} className="card group p-5">
            <summary className="cursor-pointer list-none font-heading text-lg text-ink-900 marker:content-none">
              <span className="mr-2 text-rose-500 transition-transform group-open:rotate-45 inline-block">＋</span>
              {q}
            </summary>
            <div className="mt-3 pl-7 text-sm leading-relaxed text-ink-700">{a}</div>
          </details>
        ))}
      </div>
      <div className="mt-10 text-center text-sm text-ink-500">
        Something else on your mind?{" "}
        <Link href="/services" className="text-rose-600 underline-offset-2 hover:underline">
          Ask it in a booking note
        </Link>{" "}
        or support the House on the{" "}
        <Link href="/donate" className="text-rose-600 underline-offset-2 hover:underline">
          donate page
        </Link>
        .
      </div>
    </div>
  );
}
