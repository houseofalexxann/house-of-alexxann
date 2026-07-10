"use client";

import { useMemo, useState } from "react";
import { MAJOR_ARCANA, MESSAGE_CARDS, type TarotCard } from "@/lib/tarot-data";
import { PremiumGate } from "@/components/PremiumGate";

type Mode = "one" | "three" | "message";

interface Drawn {
  card: TarotCard;
  reversed: boolean;
}

function shuffleDraw(count: number): Drawn[] {
  const deck = [...MAJOR_ARCANA];
  const out: Drawn[] = [];
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * deck.length);
    out.push({ card: deck.splice(idx, 1)[0], reversed: Math.random() < 0.3 });
  }
  return out;
}

const POSITIONS = ["Where you are", "What's moving", "Where it opens"];

function CardFace({ d, position }: { d: Drawn; position?: string }) {
  return (
    <div className="w-full rounded-2xl border border-rose-300/70 bg-white/85 p-5 text-center shadow-lg">
      {position && (
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-ink-400">
          {position}
        </p>
      )}
      <p
        aria-hidden
        className={`astro-glyph mt-2 text-4xl text-rose-500 ${d.reversed ? "rotate-180" : ""} inline-block transition-transform`}
      >
        {d.card.glyph}︎
      </p>
      <h3 className="mt-1 font-heading text-2xl text-ink-900">
        {d.card.name}
        {d.reversed && <span className="ml-1 text-sm text-ink-400">(reversed)</span>}
      </h3>
      <p className="mt-1 text-xs italic text-lilac-600">
        {d.reversed ? d.card.reversed : d.card.upright}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-ink-700">{d.card.message}</p>
    </div>
  );
}

/** A face-down card that flips on click. */
function FlipCard({ onFlip, flipped, children }: { onFlip: () => void; flipped: boolean; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-xs" style={{ perspective: "1200px" }}>
      <button
        type="button"
        onClick={onFlip}
        aria-label={flipped ? "Card revealed" : "Flip the card"}
        className="relative block w-full transition-transform duration-700"
        style={{ transformStyle: "preserve-3d", transform: flipped ? "rotateY(180deg)" : "none", minHeight: 240 }}
      >
        {/* Back */}
        <div
          className="absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-rose-300/80 shadow-lg"
          style={{
            backfaceVisibility: "hidden",
            background:
              "linear-gradient(135deg, #fdfcfc, #f8cede 40%, #c8eafc 100%)",
          }}
        >
          <span aria-hidden className="astro-glyph text-5xl text-rose-500/70">✶</span>
        </div>
        {/* Face */}
        <div className="absolute inset-0" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
          {children}
        </div>
      </button>
    </div>
  );
}

export function TarotClient() {
  const [mode, setMode] = useState<Mode>("one");
  const [drawn, setDrawn] = useState<Drawn[] | null>(null);
  const [messageIdx, setMessageIdx] = useState<number | null>(null);
  const [flipped, setFlipped] = useState<boolean[]>([]);

  const draw = (m: Mode) => {
    setMode(m);
    if (m === "message") {
      setMessageIdx(Math.floor(Math.random() * MESSAGE_CARDS.length));
      setDrawn(null);
      setFlipped([false]);
    } else {
      setDrawn(shuffleDraw(m === "one" ? 1 : 3));
      setMessageIdx(null);
      setFlipped(new Array(m === "one" ? 1 : 3).fill(false));
    }
  };

  const flip = (i: number) =>
    setFlipped((f) => f.map((x, j) => (j === i ? true : x)));

  const messageCard = useMemo(
    () => (messageIdx === null ? null : MESSAGE_CARDS[messageIdx]),
    [messageIdx]
  );

  return (
    <div>
      {/* Mode picker */}
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={() => draw("one")} className="btn-gold text-sm">
          ✶ Draw a card
        </button>
        <button type="button" onClick={() => draw("three")} className="btn-ghost text-sm">
          Three-card spread
        </button>
        <button type="button" onClick={() => draw("message")} className="btn-ghost text-sm">
          ☽ A message from the House
        </button>
      </div>

      {/* One card — free for every doll */}
      {mode === "one" && drawn && (
        <div className="mt-10">
          <FlipCard flipped={flipped[0]} onFlip={() => flip(0)}>
            <CardFace d={drawn[0]} />
          </FlipCard>
          {!flipped[0] && (
            <p className="mt-3 text-center text-xs text-ink-400">Tap the card when you&#39;re ready.</p>
          )}
        </div>
      )}

      {/* Three-card spread — Icons */}
      {mode === "three" && drawn && (
        <div className="mt-10">
          <PremiumGate title="Spreads are an Icons' room">
            <div className="grid gap-6 md:grid-cols-3">
              {drawn.map((d, i) => (
                <div key={i}>
                  <FlipCard flipped={flipped[i]} onFlip={() => flip(i)}>
                    <CardFace d={d} position={POSITIONS[i]} />
                  </FlipCard>
                </div>
              ))}
            </div>
            <p className="mt-3 text-center text-xs text-ink-400">
              Flip in your own order — the cards don&#39;t mind.
            </p>
          </PremiumGate>
        </div>
      )}

      {/* Message / divinity card — Icons */}
      {mode === "message" && messageCard && (
        <div className="mt-10">
          <PremiumGate title="The House's message cards are for Icons">
            <div className="mx-auto max-w-md">
              <FlipCard flipped={flipped[0]} onFlip={() => flip(0)}>
                <div className="w-full rounded-2xl border border-lilac-400/60 bg-white/85 p-6 text-center shadow-lg">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-lilac-600">
                    A message from the House
                  </p>
                  <h3 className="mt-2 font-heading text-2xl text-ink-900">{messageCard.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-700">{messageCard.message}</p>
                  <p aria-hidden className="mt-4 text-rose-500">✦</p>
                </div>
              </FlipCard>
            </div>
          </PremiumGate>
        </div>
      )}
    </div>
  );
}
