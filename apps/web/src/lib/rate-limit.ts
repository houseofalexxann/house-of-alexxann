/**
 * Lightweight sliding-window rate limiter for the sensitive endpoints
 * (sign-in, forgot-password, promo redemption). In-memory and therefore
 * per-serverless-instance — a burst-blunter, not a fortress. If the House
 * ever draws real attack traffic, swap the Map for a shared store (Upstash
 * Redis) behind this same function signature.
 */
import { NextResponse } from "next/server";

const windows = new Map<string, number[]>();

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "unknown";
}

/**
 * Returns a 429 response when the caller has exceeded `limit` hits within
 * `windowSeconds` for this `bucket`, otherwise null.
 */
export function rateLimit(
  request: Request,
  bucket: string,
  limit: number,
  windowSeconds: number
): NextResponse | null {
  const key = `${bucket}:${clientIp(request)}`;
  const now = Date.now();
  const cutoff = now - windowSeconds * 1000;
  const hits = (windows.get(key) ?? []).filter((t) => t > cutoff);
  if (hits.length >= limit) {
    windows.set(key, hits);
    return NextResponse.json(
      { error: "Slow down a moment, love — try again shortly." },
      { status: 429 }
    );
  }
  hits.push(now);
  windows.set(key, hits);
  // Opportunistic cleanup so the map can't grow unbounded.
  if (windows.size > 5000) {
    for (const [k, v] of windows) {
      if (v.every((t) => t <= cutoff)) windows.delete(k);
    }
  }
  return null;
}
