/**
 * Email confirmation links. Stateless, like the reset tokens: signed with
 * SESSION_SECRET and bound to the account AND the address it had when the
 * link was made, so a link cannot confirm a different address.
 *
 * A link alone confirms nothing. It only counts when it is opened inside a
 * session signed in to the same account: the person who made the account
 * holds the session, the person who owns the inbox holds the link, and
 * confirmation needs both.
 */
import { createHmac } from "node:crypto";
import { safeEqual } from "./safe-equal";
import { secret } from "./user-auth";

export const VERIFY_TTL_HOURS = 24;

function hmac(data: string): string {
  return createHmac("sha256", secret()).update(`verify:${data}`).digest("hex");
}

export function createVerifyToken(user: { id: string; email: string }): string {
  const expires = Date.now() + VERIFY_TTL_HOURS * 3_600_000;
  const payload = `${user.id}.${expires}`;
  return `${payload}.${hmac(`${payload}.${user.email.toLowerCase()}`)}`;
}

/** True when the token is intact, unexpired, and was made for this account and address. */
export function verifyTokenMatches(token: string, user: { id: string; email: string }): boolean {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [userId, expiresStr, mac] = parts;
  if (userId !== user.id) return false;
  if (!/^\d+$/.test(expiresStr) || Number(expiresStr) < Date.now()) return false;
  const expected = hmac(`${userId}.${expiresStr}.${user.email.toLowerCase()}`);
  return safeEqual(mac, expected);
}
