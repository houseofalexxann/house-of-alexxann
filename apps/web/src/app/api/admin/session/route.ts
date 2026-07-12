import { NextRequest, NextResponse } from "next/server";
import {
  checkCredentials,
  clearSessionCookie,
  setSessionCookie,
} from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { verifyPassword } from "@/lib/user-auth";
import { rateLimit } from "@/lib/rate-limit";

/**
 * Admin sign-in. Primary path: the House Mother's own account (User row with
 * role=admin and a password she can reset via /forgot like anyone else).
 * Break-glass fallback: the ADMIN_EMAIL/ADMIN_PASSWORD environment
 * credentials, for the day the database or her account is unreachable.
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

  let ok = false;
  const account = await prisma.user
    .findUnique({ where: { email: email.trim().toLowerCase() } })
    .catch(() => null);
  if (account?.role === "admin" && account.passwordHash) {
    ok = verifyPassword(password, account.passwordHash);
  }
  if (!ok) ok = checkCredentials(email, password);

  if (!ok) {
    return NextResponse.json(
      { error: "That's not the key to this house." },
      { status: 401 }
    );
  }
  await setSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
