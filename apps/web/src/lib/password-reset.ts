/**
 * Stateless password-reset tokens: HMAC-signed with SESSION_SECRET, so no
 * table or migration is needed. Each token embeds a fingerprint of the
 * account's CURRENT password hash — the moment the password changes, every
 * outstanding token for that account dies, making links single-use.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import type { User } from "@prisma/client";
import { secret } from "./user-auth";

export const RESET_TTL_MINUTES = 45;

function hmac(data: string): string {
  return createHmac("sha256", secret()).update(data).digest("hex");
}

function fingerprint(passwordHash: string): string {
  return hmac(`pw:${passwordHash}`).slice(0, 12);
}

export function createResetToken(user: User): string {
  if (!user.passwordHash) throw new Error("Account has no password set.");
  const expires = Date.now() + RESET_TTL_MINUTES * 60_000;
  const payload = `${user.id}.${expires}.${fingerprint(user.passwordHash)}`;
  return `${payload}.${hmac(payload)}`;
}

/** Structural check: signature intact and not expired. */
export function parseResetToken(token: string): { userId: string; fp: string } | null {
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [userId, expiresStr, fp, mac] = parts;
  const expected = hmac(`${userId}.${expiresStr}.${fp}`);
  if (mac.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  if (!/^\d+$/.test(expiresStr) || Number(expiresStr) < Date.now()) return null;
  return { userId, fp };
}

/** The token is only good against the password it was issued for. */
export function tokenMatchesUser(fp: string, passwordHash: string | null): boolean {
  return !!passwordHash && fp === fingerprint(passwordHash);
}
