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
      isMember: user.isMember,
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
  const parsed = z.union([Signup, Login]).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the form and try again." }, { status: 400 });
  }
  const data = parsed.data;
  const email = data.email.trim().toLowerCase();

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
