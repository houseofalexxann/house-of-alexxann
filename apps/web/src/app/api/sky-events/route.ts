import { NextResponse } from "next/server";
import { scanSkyEvents } from "@hoa/engine";

/**
 * The world's major sky events for the weeks ahead: eclipses, new and full
 * moons, retrograde and direct stations, cazimis, and slow-planet ingresses.
 * Mundane astronomy — no natal chart involved — computed by the engine and
 * cached for an hour (the sky does not hurry).
 */
export const revalidate = 3600;

export async function GET() {
  const now = new Date();
  const from = now.toISOString().replace(/\.\d{3}Z$/, "Z");
  const to = new Date(now.getTime() + 60 * 86_400_000)
    .toISOString()
    .replace(/\.\d{3}Z$/, "Z");

  const events = scanSkyEvents(from, to, {
    bodies: ["mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"],
    maxEvents: 80,
  });

  return NextResponse.json({ from, to, events });
}
