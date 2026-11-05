/**
 * Public (seeker/client) accounts: email + password with scrypt hashing and
 * an HMAC-signed session cookie — no external auth service, birth-data-grade
 * privacy. OAuth can layer on later without changing this seam.
 *
 * Sessions are bound to the password they were opened with: the cookie
 * carries a fingerprint of the password hash, so changing the password
 * (reset or otherwise) ends every other session for that account.
 */
import { randomBytes, scryptSync, timingSafeEqual, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { User } from "@prisma/client";
import { prisma } from "./db";

const COOKIE = "hoa_user";
const SESSION_DAYS = 30;

/**
 * scrypt cost at the current OWASP floor (N = 2^17, r = 8, p = 1, about
 * 128 MB). Hashes made with Node's defaults (N = 2^14) still verify and are
 * upgraded in place at the next successful sign-in.
 */
const SCRYPT = { N: 131072, r: 8, p: 1, maxmem: 192 * 1024 * 1024 };
const HASH_TAG = "s2";

export function secret(): string {
  const configured = process.env.SESSION_SECRET;
  if (configured && configured.length >= 16) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production.");
  }
  return "dev-secret-change-me-please";
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64, SCRYPT).toString("hex");
  return `${HASH_TAG}:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split(":");
  let salt: string;
  let hash: string;
  let candidate: Buffer;
  if (parts.length === 3 && parts[0] === HASH_TAG) {
    [, salt, hash] = parts;
    if (!salt || !hash) return false;
    candidate = scryptSync(password, salt, 64, SCRYPT);
  } else if (parts.length === 2) {
    [salt, hash] = parts;
    if (!salt || !hash) return false;
    candidate = scryptSync(password, salt, 64);
  } else {
    return false;
  }
  const expected = Buffer.from(hash, "hex");
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

/** True for hashes made before the current cost; callers re-hash after a successful verify. */
export function needsRehash(stored: string): boolean {
  return !stored.startsWith(`${HASH_TAG}:`);
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Short, keyed fingerprint of the password hash a session was opened with. */
export function sessionFingerprint(passwordHash: string | null | undefined): string {
  return createHmac("sha256", secret()).update(`session:${passwordHash ?? ""}`).digest("hex").slice(0, 16);
}

export async function setUserSession(user: { id: string; passwordHash: string | null }): Promise<void> {
  const expires = Date.now() + SESSION_DAYS * 86400_000;
  const payload = `${user.id}.${expires}.${sessionFingerprint(user.passwordHash)}`;
  const store = await cookies();
  store.set(COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 86400,
    path: "/",
  });
}

export async function clearUserSession(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

/** The signed-in user, or null. */
export async function sessionUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4) return null;
  const [userId, expiresStr, fp, mac] = parts;
  const payload = `${userId}.${expiresStr}.${fp}`;
  const expected = sign(payload);
  if (mac.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  if (Number(expiresStr) < Date.now()) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;
  // The password changed since this session was opened: the session is over.
  const want = sessionFingerprint(user.passwordHash);
  if (fp.length !== want.length || !timingSafeEqual(Buffer.from(fp), Buffer.from(want))) return null;
  return user;
}

export async function requireUser(): Promise<User> {
  const user = await sessionUser();
  if (!user) redirect("/login");
  return user;
}
