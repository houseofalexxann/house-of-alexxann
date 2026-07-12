import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  clearUserSession,
  hashPassword,
  sessionUser,
  setUserSession,
  verifyPassword,
} from "@/lib/user-auth";
import {
  createResetToken,
  parseResetToken,
  tokenMatchesUser,
} from "@/lib/password-reset";
import { passwordResetEmail } from "@/lib/email-templates";
import { sendMail } from "@/lib/email";
import { baseUrl } from "@/lib/bookings";
import { isActiveMember } from "@/lib/membership";

const Signup = z.object({
  mode: z.literal("signup"),
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
});
const Login = z.object({
  mode: z.literal("login"),
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});
const Forgot = z.object({
  mode: z.literal("forgot"),
  email: z.string().email().max(200),
});
const Reset = z.object({
  mode: z.literal("reset"),
  token: z.string().min(20).max(500),
  password: z.string().min(8).max(200),
});

/** GET: current session (+ latest birth profile so every tab can prefill). */
export async function GET() {
  const user = await sessionUser();
  if (!user) return NextResponse.json({ user: null });
  const profile = await prisma.birthProfile.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    user: {
      name: user.name,
      email: user.email,
      isMember: isActiveMember(user),
      memberUntil: !user.isMember && user.memberUntil ? user.memberUntil : null,
      role: user.role,
      profile: profile
        ? {
            name: profile.name,
            birthDate: profile.birthDate,
            birthTime: profile.birthTime,
            placeLabel: profile.placeLabel,
          }
        : null,
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = z.union([Signup, Login, Forgot, Reset]).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the form and try again." }, { status: 400 });
  }
  const data = parsed.data;
  const email = "email" in data ? data.email.trim().toLowerCase() : "";

  if (data.mode === "forgot") {
    if (process.env.NODE_ENV === "production" && !process.env.RESEND_API_KEY) {
      return NextResponse.json(
        {
          error:
            "The House can't send email quite yet — please reach out to Alexandria directly and she'll reset your password for you.",
        },
        { status: 503 }
      );
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (user?.passwordHash) {
      const link = `${baseUrl()}/reset?token=${createResetToken(user)}`;
      // Log-and-continue: the response must not reveal whether the account exists.
      await sendMail(passwordResetEmail(user.name, user.email, link)).catch((err) =>
        console.error("password reset email failed:", err)
      );
    }
    return NextResponse.json({ ok: true });
  }

  if (data.mode === "reset") {
    const invalid = NextResponse.json(
      { error: "That reset link has expired or already been used — request a fresh one." },
      { status: 400 }
    );
    const token = parseResetToken(data.token);
    if (!token) return invalid;
    const user = await prisma.user.findUnique({ where: { id: token.userId } });
    if (!user || !tokenMatchesUser(token.fp, user.passwordHash)) return invalid;
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(data.password) },
    });
    await setUserSession(user.id);
    return NextResponse.json({ ok: true });
  }

  if (data.mode === "signup") {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing?.passwordHash) {
      return NextResponse.json(
        { error: "That email already has an account — try signing in." },
        { status: 409 }
      );
    }
    const user = existing
      ? await prisma.user.update({
          where: { email },
          data: { name: data.name, passwordHash: hashPassword(data.password) },
        })
      : await prisma.user.create({
          data: {
            email,
            name: data.name,
            role: "seeker",
            passwordHash: hashPassword(data.password),
          },
        });
    await setUserSession(user.id);
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash || !verifyPassword(data.password, user.passwordHash)) {
    return NextResponse.json(
      { error: "That email and password don't match our records." },
      { status: 401 }
    );
  }
  await setUserSession(user.id);
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearUserSession();
  return NextResponse.json({ ok: true });
}
