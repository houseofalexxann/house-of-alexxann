/**
 * Tokens for the personal calendar feed. Signed with SESSION_SECRET and
 * self-describing: the token carries the user id, the feed version it was
 * made for, and its own signature.
 *
 * The feed URL is a bearer credential (anyone holding it can read that
 * person's calendar), so it is only ever shown to the signed-in owner, and
 * the feed itself returns chart timing, never account details. If an address
 * gets out, the owner resets it: the account's feedVersion goes up by one and
 * every address made for an earlier version stops working. Rotating
 * SESSION_SECRET still retires every feed at once.
 *
 * Version 0 keeps the original two-part form, so addresses handed out before
 * versions existed keep working until their owner resets them.
 */
import { createHmac } from "node:crypto";
import { safeEqual } from "./safe-equal";
import { secret } from "./user-auth";

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(`cal:${payload}`).digest("hex").slice(0, 32);
}

export function calendarToken(userId: string, feedVersion = 0): string {
  const payload = Buffer.from(userId).toString("base64url");
  if (feedVersion === 0) return `${payload}.${sign(payload)}`;
  return `${payload}.${feedVersion}.${sign(`${payload}.${feedVersion}`)}`;
}

/** The account and feed version a token was made for, when its signature holds. */
export function parseCalendarToken(token: string): { userId: string; version: number } | null {
  const parts = token.split(".");
  if (parts.length !== 2 && parts.length !== 3) return null;
  const payload = parts[0];
  const versionStr = parts.length === 3 ? parts[1] : "0";
  const mac = parts[parts.length - 1];
  if (parts.length === 3 && !/^[1-9]\d{0,8}$/.test(versionStr)) return null;
  const expected = sign(parts.length === 3 ? `${payload}.${versionStr}` : payload);
  if (!safeEqual(mac, expected)) return null;
  try {
    const userId = Buffer.from(payload, "base64url").toString("utf8");
    return userId ? { userId, version: Number(versionStr) } : null;
  } catch {
    return null;
  }
}
