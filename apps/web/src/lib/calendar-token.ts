/**
 * Tokens for the personal calendar feed. Signed with SESSION_SECRET and
 * self-describing, so subscribing needs no database column: the token carries
 * the user id and its own signature. Rotating SESSION_SECRET invalidates
 * every outstanding feed, which is the intended emergency lever.
 *
 * The feed URL is a bearer credential — anyone holding it can read that
 * person's calendar — so it is only ever shown to the signed-in owner, and
 * the feed itself returns chart timing, never account details.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { secret } from "./user-auth";

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(`cal:${payload}`).digest("hex").slice(0, 32);
}

export function calendarToken(userId: string): string {
  const payload = Buffer.from(userId).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function userIdFromCalendarToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, mac] = parts;
  const expected = sign(payload);
  if (mac.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    return Buffer.from(payload, "base64url").toString("utf8") || null;
  } catch {
    return null;
  }
}
