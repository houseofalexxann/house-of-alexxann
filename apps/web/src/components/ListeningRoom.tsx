"use client";

import { useState } from "react";

/**
 * The Listening Room: a floating music dock. Jhené Aiko's Trigger Protection
 * Mantra opens the room; Kacey Musgraves holds the golden hours. The Spotify
 * iframe loads only after the listener opens the dock (privacy +
 * performance), and playback starts on tap (browsers do not allow autoplay).
 */
const MOODS = [
  { key: "mantra", label: "Protection Mantra", src: "https://open.spotify.com/embed/album/2NGGOdyDlyb4bu3vqQqF83?theme=0" },
  { key: "golden", label: "Golden Hour", src: "https://open.spotify.com/embed/album/7f6xPqyaolTiziKf5R5Z0c?theme=0" },
  { key: "deeper", label: "Deeper Well", src: "https://open.spotify.com/embed/album/5SxZmGwc4eJuPp6PcO4JgJ?theme=0" },
];

export function ListeningRoom() {
  const [open, setOpen] = useState(false);
  const [mood, setMood] = useState(MOODS[0]);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {open && (
        <div className="mb-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-pearl-300 bg-white/90 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between px-4 pt-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-400">
              The listening room
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close the listening room"
              className="rounded-full px-2 py-0.5 text-ink-400 hover:text-ink-900"
            >
              ✕
            </button>
          </div>
          <div className="flex gap-1.5 px-4 pt-2">
            {MOODS.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMood(m)}
                className={`rounded-full border px-2.5 py-0.5 text-xs transition-colors ${
                  mood.key === m.key
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-pearl-400 bg-white/70 text-ink-500 hover:border-rose-400"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          <div className="p-3">
            <iframe
              key={mood.key}
              src={mood.src}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title={`Spotify player — ${mood.label}`}
              className="rounded-xl"
            />
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Hide the listening room" : "Open the listening room — music for your reading"}
        aria-expanded={open}
        className="ml-auto flex h-12 w-12 items-center justify-center rounded-full border border-pearl-300 bg-white/90 text-xl text-rose-500 shadow-lg backdrop-blur transition-transform hover:scale-105"
      >
        {open ? "♪" : "♫"}
      </button>
    </div>
  );
}
