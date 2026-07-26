import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "Western and Vedic astrology from Alexandria Ramirez: charts cast with the Swiss Ephemeris, read in plain language.",
};

/** Draft-only marker for the two facts only Alexandria can supply. */
function NeedsAlexandria({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-xl border border-dashed border-rose-400/70 bg-rose-300/10 px-5 py-4 text-sm italic leading-relaxed text-rose-600">
      {children}
    </p>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-16 sm:px-6">
      {/* Header */}
      <header className="text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-rose-600">
          About the House
        </p>
        <h1 className="text-4xl text-ink-900 sm:text-5xl">Alexandria Ramirez</h1>
        <p className="mt-6 text-lg leading-relaxed text-ink-700">
          Two traditions, one sky. I built this House on a simple conviction:
          astrology deserves both rigor and tenderness. Your chart is computed
          to the minute, then read like a letter from someone who knows you.
        </p>
      </header>

      <hr className="gold-rule mt-16" />

      {/* Her story */}
      <section className="mt-16">
        <h2 className="text-3xl text-ink-900">How I got here</h2>
        <div className="mt-6 space-y-5 leading-relaxed text-ink-700">
          <NeedsAlexandria>
            [Your words: the question or the moment that brought you to
            astrology. One or two sentences, as plainly as you&apos;d say it out
            loud.]
          </NeedsAlexandria>
          <p>
            What kept me here was the craft. Underneath the sun sign columns
            there is a real discipline: actual geometry, a long and argued
            history, and two great traditions describing the same sky in
            different languages.
          </p>
          <p>
            I study both. The Western chart brings psychological depth and its
            language of aspect and angle. Jyotish, the Vedic science of light,
            brings the sidereal zodiac and instruments for reading time that
            nothing in the Western canon quite matches. Neither tradition
            replaces the other. They converse, and the conversation is usually
            where the insight lives.
          </p>
          <NeedsAlexandria>
            [Your words: who taught you, or how you studied. Naming your
            teachers and lineage here is what would make this page unmistakably
            yours.]
          </NeedsAlexandria>
          <p>
            The House of Alexxann grew out of that conversation. The
            calculation is exact, the interpretation is honest, and the person
            in front of the chart always matters more than the chart.
          </p>
        </div>
      </section>

      {/* How she reads */}
      <section className="mt-16">
        <h2 className="text-3xl text-ink-900">How I read</h2>
        <div className="mt-6 space-y-5 leading-relaxed text-ink-700">
          <p>
            <span className="text-rose-500">Accuracy first.</span> Every chart
            in this practice is cast with the Swiss Ephemeris, the same
            planetary engine professional astrologers rely on, from your exact
            birth time, date, and place. Degrees to the minute. Houses computed
            properly. Vedic charts cast sidereal with the Lahiri ayanamsa. If
            the math is careless, the meaning cannot be trusted, so the math is
            never careless.
          </p>
          <p>
            <span className="text-rose-500">Warmth second, and always.</span>{" "}
            A reading is not a lecture. I work in plain language: no jargon left
            unexplained, no doom pronounced, no fatalism dressed up as wisdom.
            Your chart describes weather, not verdicts. My work is to hand you
            the forecast in words you can carry out the door and actually use.
          </p>
        </div>
      </section>

      {/* What to expect */}
      <section className="mt-16">
        <h2 className="text-3xl text-ink-900">What to expect from a session</h2>
        <ul className="mt-6 space-y-4">
          {[
            "Your chart is cast and studied before you arrive. The session is for you, not for setup.",
            "A guided walk through what matters most in your chart, shaped around the questions you bring.",
            "Plain answers. If something is uncertain, or outside what astrology can honestly say, I will tell you.",
            "Room to ask anything: career, relationships, timing, the pattern you keep meeting.",
            "You leave with your chart image and the language to keep reading it yourself.",
          ].map((item) => (
            <li key={item} className="flex gap-3 leading-relaxed text-ink-700">
              <span aria-hidden className="mt-0.5 text-rose-600">
                ✦
              </span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* What this House stands for */}
      <section className="card mt-16 border-rose-300/60 p-8 sm:p-10">
        <h2 className="text-center text-3xl text-ink-900">
          What this House stands for
        </h2>
        <p aria-hidden className="mt-4 text-center text-3xl tracking-wide">
          🏳️‍⚧️ 🏳️‍🌈 ✊🏿 ♿ 🌎
        </p>
        <div className="mx-auto mt-5 max-w-2xl space-y-3 leading-relaxed text-ink-700">
          <p>
            This is a <strong className="text-ink-900">queer- and
            trans-built House</strong>, and it flies its flags on purpose:
            trans liberation, queer pride, Black liberation, disability
            justice, and dignity for every migrant.{" "}
            <strong className="text-ink-900">Abolish ICE.</strong> No human
            being is illegal. The stars have never checked papers, gender
            markers, or borders, and neither do we. If your liberation is
            treated as debatable elsewhere, know that here it is the ground we
            build on, not a topic. You are not tolerated in this House. You are
            expected, and the door was hung with you in mind.
          </p>
          <p className="text-sm text-ink-500">
            Every body, every gender, every love, every ability, every
            immigration status, every faith and none: welcome, whole, and safe
            with your data and your story.
          </p>
        </div>
        <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-pearl-300 bg-white/60 p-4">
          <p className="text-xs leading-relaxed text-ink-500">
            <strong className="text-ink-700">A gentle disclaimer:</strong>{" "}
            astrology, Human Design, and tarot are offered here as spiritual
            reflection, self-inquiry, and art. They are not medical,
            psychological, legal, or financial advice, and never a substitute
            for care from qualified professionals. Charts describe weather, not
            verdicts. You always remain the author of your choices. Readings
            are for adults (18+). If you are in crisis, please reach for
            immediate human support. The stars will keep.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="card mt-20 p-10 text-center">
        <h2 className="text-3xl text-ink-900">Come meet your sky.</h2>
        <p className="mx-auto mt-3 max-w-md leading-relaxed text-ink-700">
          Book a reading with me, or cast your own chart free in the Studio and
          see what I see.
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
