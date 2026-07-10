import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Alexandria Ramirez blends Western and Vedic astrology with professional-grade calculation — charts cast with the Swiss Ephemeris, read in plain language.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-16 sm:px-6">
      {/* Header */}
      <header className="text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-gold-400">
          About the House
        </p>
        <h1 className="text-4xl text-moon-100 sm:text-5xl">Alexandria Ramirez</h1>
        <p className="mt-6 text-lg leading-relaxed text-moon-300">
          Two traditions, one sky. The House of Alexxann is a practice built on
          the belief that astrology deserves both rigor and tenderness — charts
          computed with professional-grade precision, then read like a letter
          from someone who knows you.
        </p>
      </header>

      <hr className="gold-rule mt-16" />

      {/* Her story */}
      <section className="mt-16">
        <h2 className="text-3xl text-moon-100">Her story</h2>
        <div className="mt-6 space-y-5 leading-relaxed text-moon-300">
          <p>
            Alexandria came to astrology the way most people do — through a
            question the ordinary answers couldn&apos;t reach. What kept her
            there was the craft: the discovery that beneath the sun-sign
            columns lies a discipline with real geometry, real history, and two
            great traditions that describe the same sky in different tongues.
          </p>
          <p>
            She studied both. The Western chart, with its psychological depth
            and its language of aspect and angle; and Jyotish, the Vedic
            science of light, with its sidereal zodiac and its extraordinary
            instruments for reading time. She found that neither tradition
            replaces the other — they converse, and the conversation is where
            the insight lives.
          </p>
          <p>
            The House of Alexxann grew out of that conversation: a practice
            where the calculation is exact, the interpretation is honest, and
            the person in front of the chart always matters more than the
            chart itself.
          </p>
        </div>
      </section>

      {/* How she reads */}
      <section className="mt-16">
        <h2 className="text-3xl text-moon-100">How she reads</h2>
        <div className="mt-6 space-y-5 leading-relaxed text-moon-300">
          <p>
            <span className="text-gold-300">Accuracy first.</span> Every chart
            in this practice is cast with the Swiss Ephemeris — the same
            planetary engine trusted by professional astrologers worldwide —
            from your exact birth time, date and place. Degrees to the minute,
            houses computed properly, Vedic charts cast sidereal with the
            Lahiri ayanamsa. If the math is careless, the meaning can&apos;t be
            trusted; so the math is never careless.
          </p>
          <p>
            <span className="text-gold-300">Warmth second — and always.</span>{" "}
            A reading is not a lecture. Alexandria works in plain language: no
            jargon left unexplained, no doom pronounced, no fatalism dressed up
            as wisdom. The chart describes weather, not verdicts. Her work is
            to hand you the forecast in words you can carry out the door and
            actually use.
          </p>
        </div>
      </section>

      {/* What to expect */}
      <section className="mt-16">
        <h2 className="text-3xl text-moon-100">What to expect from a session</h2>
        <ul className="mt-6 space-y-4">
          {[
            "Your chart is cast and studied before you arrive — the session is for you, not for setup.",
            "A guided walk through what matters most in your chart, shaped around the questions you bring.",
            "Plain answers. If something is uncertain or outside what astrology can say, she'll tell you so.",
            "Room to ask anything — career, relationships, timing, the pattern you keep meeting.",
            "You leave with your chart image and the language to keep reading it yourself.",
          ].map((item) => (
            <li key={item} className="flex gap-3 leading-relaxed text-moon-300">
              <span aria-hidden className="mt-0.5 text-gold-400">
                ✦
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="card mt-20 p-10 text-center">
        <h2 className="text-3xl text-moon-100">Come meet your sky.</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-moon-300">
          Book a reading with Alexandria, or cast your own chart free in the
          Studio and see what she sees.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/services" className="btn-gold">
            Book a reading
          </Link>
          <Link href="/studio" className="btn-ghost">
            Cast your chart free
          </Link>
        </div>
      </section>
    </div>
  );
}
