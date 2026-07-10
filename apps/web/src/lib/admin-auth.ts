/**
 * Phase 1 admin auth: single practitioner, credentials from env, stateless
 * HMAC-signed session cookie. (Client accounts & OAuth arrive in Phase 2.)
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE = "hoa_admin";
const SESSION_HOURS = 24 * 7;

function secret(): string {
  return process.env.SESSION_SECRET ?? "dev-secret-change-me";
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

export function makeSessionToken(): string {
  const expires = Date.now() + SESSION_HOURS * 3600_000;
  const payload = `admin.${expires}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const idx = token.lastIndexOf(".");
  if (idx < 0) return false;
  const payload = token.slice(0, idx);
  const mac = token.slice(idx + 1);
  const expected = sign(payload);
  if (mac.length !== expected.length) return false;
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return false;
  const expires = Number(payload.split(".")[1]);
  return Number.isFinite(expires) && expires > Date.now();
}

export function checkCredentials(email: string, password: string): boolean {
  const okEmail = process.env.ADMIN_EMAIL;
  const okPassword = process.env.ADMIN_PASSWORD;
  if (!okEmail || !okPassword) return false;
  return (
    email.trim().toLowerCase() === okEmail.toLowerCase() &&
    password === okPassword
  );
}

export async function setSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, makeSessionToken(), {
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

/** True if the current request carries a valid admin session. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(COOKIE)?.value);
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
