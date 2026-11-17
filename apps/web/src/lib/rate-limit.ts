/**
 * Rate limiter for the sensitive endpoints (sign-in, forgot-password, promo
 * redemption, bookings, the admin door).
 *
 * Two layers. A sliding window held in this instance's memory answers
 * repeat offenders without a database round trip. Behind it sits a counter
 * in the database (the RateLimit table), shared by every serverless
 * instance, so a limit holds however many instances are serving and however
 * often they restart. If the database layer fails, the memory layer still
 * stands and the request is not refused on that account.
 *
 * Keys are hashed before they are stored, so the table never holds an IP
 * address or an email address.
 */
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "./db";

const windows = new Map<string, number[]>();

function clientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : "unknown";
}

/** Keys the shared counter has refused, and the moment its window reopens. */
const blockedUntil = new Map<string, number>();

/** True while the caller is inside the limit on this instance. */
function memoryAllows(key: string, limit: number, windowSeconds: number, now: number): boolean {
  const cutoff = now - windowSeconds * 1000;
  const hits = (windows.get(key) ?? []).filter((t) => t > cutoff);
  if (hits.length >= limit) {
    windows.set(key, hits);
    return false;
  }
  hits.push(now);
  windows.set(key, hits);
  // Opportunistic cleanup so the maps can't grow unbounded.
  if (windows.size > 5000) {
    for (const [k, v] of windows) {
      if (v.every((t) => t <= cutoff)) windows.delete(k);
    }
  }
  if (blockedUntil.size > 5000) {
    for (const [k, until] of blockedUntil) {
      if (until <= now) blockedUntil.delete(k);
    }
  }
  return true;
}

/** Take back the hit this request just recorded in the memory window. */
function forgetHit(key: string, now: number): void {
  const hits = windows.get(key);
  if (!hits) return;
  const at = hits.lastIndexOf(now);
  if (at >= 0) hits.splice(at, 1);
}

/** After a database failure, leave the shared layer alone for a few minutes. */
let sharedDownUntil = 0;

/**
 * The shared counter's answer, with the seconds left in its window; null
 * when it could not be asked. Every timestamp is taken and compared in UTC
 * inside the database, so the answer does not depend on the session's time
 * zone or on a daylight-saving change.
 */
async function sharedAllows(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ ok: boolean; waitSeconds: number } | null> {
  if (Date.now() < sharedDownUntil) return null;
  const hashed = createHash("sha256").update(key).digest("hex");
  try {
    const rows = await prisma.$queryRaw<{ count: number; wait: number }[]>`
      INSERT INTO "RateLimit" AS r ("key", "count", "resetAt")
      VALUES (
        ${hashed},
        1,
        (NOW() AT TIME ZONE 'UTC') + (${windowSeconds}::double precision * INTERVAL '1 second')
      )
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN r."resetAt" < (NOW() AT TIME ZONE 'UTC') THEN 1 ELSE r."count" + 1 END,
        "resetAt" = CASE
          WHEN r."resetAt" < (NOW() AT TIME ZONE 'UTC')
            THEN (NOW() AT TIME ZONE 'UTC') + (${windowSeconds}::double precision * INTERVAL '1 second')
          ELSE r."resetAt"
        END
      RETURNING
        r."count" AS count,
        EXTRACT(EPOCH FROM (r."resetAt" - (NOW() AT TIME ZONE 'UTC')))::double precision AS wait`;
    // Housekeeping on roughly one call in fifty: forget windows long closed.
    if (Math.random() < 0.02) {
      prisma.$executeRaw`DELETE FROM "RateLimit" WHERE "resetAt" < (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 day'`.catch(() => {});
    }
    const count = Number(rows[0]?.count);
    if (!Number.isFinite(count)) return null;
    const wait = Number(rows[0]?.wait);
    return { ok: count <= limit, waitSeconds: Number.isFinite(wait) ? Math.max(0, wait) : windowSeconds };
  } catch (err) {
    sharedDownUntil = Date.now() + 5 * 60_000;
    console.error("[rate-limit] shared counter unavailable:", err instanceof Error ? err.message : err);
    return null;
  }
}

async function allows(key: string, limit: number, windowSeconds: number, shared: boolean): Promise<boolean> {
  const now = Date.now();
  // Refused by the shared counter a moment ago: same answer until its
  // window reopens, without asking the database again.
  if ((blockedUntil.get(key) ?? 0) > now) return false;
  if (!memoryAllows(key, limit, windowSeconds, now)) return false;
  if (!shared) return true;
  const verdict = await sharedAllows(key, limit, windowSeconds);
  if (!verdict || verdict.ok) return true;
  // The shared counter said no. That refusal must not also count as a hit
  // here, or retrying while blocked would stretch the block past the
  // shared window's end.
  forgetHit(key, now);
  blockedUntil.set(key, now + verdict.waitSeconds * 1000);
  return false;
}

/**
 * Returns a 429 response when the caller has exceeded `limit` hits within
 * `windowSeconds` for this `bucket`, otherwise null. Pass `shared: false`
 * for chatty, low-stakes endpoints (the place search) that should not cost
 * a database write per keystroke.
 */
export async function rateLimit(
  request: Request,
  bucket: string,
  limit: number,
  windowSeconds: number,
  opts: { shared?: boolean } = {}
): Promise<NextResponse | null> {
  const ok = await allows(`${bucket}:${clientIp(request)}`, limit, windowSeconds, opts.shared ?? true);
  if (ok) return null;
  return NextResponse.json(
    { error: "Slow down a moment, love — try again shortly." },
    { status: 429 }
  );
}

/**
 * The inbox an address delivers to, as far as the address alone can tell:
 * "name+anything@" is the same inbox as "name@", and Gmail ignores dots.
 * For limiter keys only (how much mail one inbox may be sent); the address
 * that is stored and mailed is never changed.
 */
export function inboxKey(email: string): string {
  const address = email.trim().toLowerCase();
  const at = address.lastIndexOf("@");
  if (at < 1) return address;
  let local = address.slice(0, at).split("+")[0];
  const domain = address.slice(at + 1);
  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.replace(/\./g, "");
    return `${local}@gmail.com`;
  }
  return `${local}@${domain}`;
}

/**
 * May this inbox be sent one more email it did not necessarily ask for (a
 * confirmation link, a reset link)? An hourly allowance and a daily ceiling,
 * shared by every door that sends that kind of mail.
 */
export async function inboxAllows(kind: "confirm" | "reset", email: string): Promise<boolean> {
  const inbox = inboxKey(email);
  const [hourly, daily] = kind === "confirm" ? [5, 8] : [3, 8];
  if (!(await rateLimitKey(`mail-${kind}-hour`, inbox, hourly, 3600))) return false;
  return rateLimitKey(`mail-${kind}-day`, inbox, daily, 86400);
}

/**
 * The same limiter keyed by something other than the caller's address: an
 * email, an account. It bounds what can be done TO one address or account,
 * whoever is asking and from wherever. True while inside the limit.
 */
export async function rateLimitKey(
  bucket: string,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  return allows(`${bucket}:key:${key.trim().toLowerCase()}`, limit, windowSeconds, true);
}
