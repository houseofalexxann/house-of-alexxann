/**
 * Admin auth for a single practitioner: a stateless HMAC-signed session
 * cookie, opened either with the House Mother's own account password or, as
 * break-glass, with the ADMIN_EMAIL / ADMIN_PASSWORD environment credentials.
 *
 * Every admin session is bound to the credential that opened it. The token
 * names its subject (the admin's user id, or "env") and carries a fingerprint
 * of that credential, so resetting the account password or rotating the
 * environment password ends the sessions opened with the old one.
 */
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "./db";

const COOKIE = "hoa_admin";
const SESSION_HOURS = 24 * 7;

function secret(): string {
  const configured = process.env.SESSION_SECRET;
  if (configured && configured.length >= 16) return configured;
  // Never sign with a guessable key in production — a missing/weak
  // SESSION_SECRET there is a fatal misconfiguration, not a soft fallback.
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_SECRET is required in production and must be at least 16 characters."
    );
  }
  return "dev-secret-change-me-please";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Constant-time equality for strings of any length. */
function safeEqual(a: string, b: string): boolean {
  const da = createHash("sha256").update(a).digest();
  const db = createHash("sha256").update(b).digest();
  return timingSafeEqual(da, db);
}

/** Short, keyed fingerprint of the credential a session was opened with. */
export function adminFingerprint(credential: string): string {
  return createHmac("sha256", secret()).update(`admin:${credential}`).digest("hex").slice(0, 16);
}

/** The fingerprint of the break-glass password, or null when none is configured. */
export function envFingerprint(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim();
  return password ? adminFingerprint(`env:${password}`) : null;
}

/** The fingerprint of an admin account's password hash. */
export function accountFingerprint(passwordHash: string): string {
  return adminFingerprint(`account:${passwordHash}`);
}

export interface AdminSubject {
  /** The admin user's id, or "env" for the break-glass credential. */
  subject: string;
  fingerprint: string;
}

export function makeSessionToken({ subject, fingerprint }: AdminSubject): string {
  const expires = Date.now() + SESSION_HOURS * 3600_000;
  const payload = `admin.${expires}.${subject}.${fingerprint}`;
  return `${payload}.${sign(payload)}`;
}

/**
 * Signature and expiry only. This says the token was minted by the House; it
 * does not say the credential behind it is still current. Authorisation
 * decisions go through isAdmin().
 */
export function parseSessionToken(token: string | undefined): AdminSubject | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 5 || parts[0] !== "admin") return null;
  const [, expiresStr, subject, fingerprint, mac] = parts;
  const payload = `admin.${expiresStr}.${subject}.${fingerprint}`;
  const expected = sign(payload);
  if (mac.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || expires <= Date.now()) return null;
  return { subject, fingerprint };
}

export function verifySessionToken(token: string | undefined): boolean {
  return parseSessionToken(token) !== null;
}

export function checkCredentials(email: string, password: string): boolean {
  // Trim both sides: pasted env values routinely pick up an invisible
  // trailing space/newline, and typed passwords pick up accidental edges.
  const okEmail = process.env.ADMIN_EMAIL?.trim();
  const okPassword = process.env.ADMIN_PASSWORD?.trim();
  if (!okEmail || !okPassword) return false;
  // Both comparisons run every time, in constant time, so neither the
  // address nor the password can be guessed letter by letter.
  const emailOk = safeEqual(email.trim().toLowerCase(), okEmail.toLowerCase());
  const passwordOk = safeEqual(password.trim(), okPassword);
  return emailOk && passwordOk;
}

export async function setSessionCookie(subject: AdminSubject): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, makeSessionToken(subject), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_HOURS * 3600,
    path: "/",
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE);
}

/** True if the current request carries a valid admin session whose credential is still current. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  const parsed = parseSessionToken(store.get(COOKIE)?.value);
  if (!parsed) return false;
  if (parsed.subject === "env") {
    const current = envFingerprint();
    return current !== null && safeEqual(parsed.fingerprint, current);
  }
  const row = await prisma.user
    .findUnique({ where: { id: parsed.subject }, select: { role: true, passwordHash: true } })
    .catch(() => null);
  if (!row || row.role !== "admin" || !row.passwordHash) return false;
  return safeEqual(parsed.fingerprint, accountFingerprint(row.passwordHash));
}

/** For server components/actions: bounce to login when not signed in. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

/** For API route handlers: 401 instead of redirect. */
export async function requireAdminApi(): Promise<Response | null> {
  if (!(await isAdmin())) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
