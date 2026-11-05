import { NextRequest, NextResponse } from "next/server";
import {
  accountFingerprint,
  checkCredentials,
  clearSessionCookie,
  envFingerprint,
  setSessionCookie,
  type AdminSubject,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { hashPassword, needsRehash, verifyPassword } from "@/lib/user-auth";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Admin sign-in. Primary path: the House Mother's own account (User row with
 * role=admin and a password she can reset via /forgot like anyone else).
 * Break-glass fallback: the ADMIN_EMAIL/ADMIN_PASSWORD environment
 * credentials, for the day the database or her account is unreachable.
 *
 * The first successful break-glass sign-in also claims a password-less admin
 * row by giving it that password, so the account path works from then on and
 * public sign-up can never claim the row.
 */
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, "admin-session", 10, 900);
  if (limited) return limited;

  const { email, password } = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  if (!email || !password) {
    return NextResponse.json(
      { error: "That's not the key to this house." },
      { status: 401 }
    );
  }

  const account = await prisma.user
    .findUnique({ where: { email: email.trim().toLowerCase() } })
    .catch(() => null);

  let subject: AdminSubject | null = null;

  if (account?.role === "admin" && account.passwordHash && verifyPassword(password, account.passwordHash)) {
    let hash = account.passwordHash;
    if (needsRehash(hash)) {
      hash = hashPassword(password);
      await prisma.user.update({ where: { id: account.id }, data: { passwordHash: hash } });
    }
    subject = { subject: account.id, fingerprint: accountFingerprint(hash) };
  } else if (checkCredentials(email, password)) {
    if (account?.role === "admin" && !account.passwordHash) {
      const hash = hashPassword(password);
      await prisma.user.update({ where: { id: account.id }, data: { passwordHash: hash } });
      subject = { subject: account.id, fingerprint: accountFingerprint(hash) };
    } else {
      const env = envFingerprint();
      subject = env ? { subject: "env", fingerprint: env } : null;
    }
  }

  if (!subject) {
    return NextResponse.json(
      { error: "That's not the key to this house." },
      { status: 401 }
    );
  }
  await setSessionCookie(subject);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
