import { after, NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  clearUserSession,
  DECOY_HASH,
  LEGACY_DECOY_HASH,
  hashPassword,
  isKnownDevice,
  needsRehash,
  rememberDevice,
  sessionUser,
  setUserSession,
  verifyPassword,
} from "@/lib/user-auth";
import {
  createResetToken,
  parseResetToken,
  tokenMatchesUser,
} from "@/lib/password-reset";
import { confirmEmailMessage, passwordResetEmail } from "@/lib/email-templates";
import { createVerifyToken } from "@/lib/email-verify";
import { sendMail } from "@/lib/email";
import { baseUrl } from "@/lib/bookings";
import { isActiveMember } from "@/lib/membership";
import { getSettings } from "@/lib/settings";
import { inboxAllows, rateLimit, rateLimitKey } from "@/lib/rate-limit";
import { isAdmin } from "@/lib/admin-auth";

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
  /** Set by the sign-in form when it was reached from a confirmation link. */
  confirming: z.boolean().optional(),
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
  const [user, adminSession, settings] = await Promise.all([
    sessionUser(),
    isAdmin(),
    getSettings(),
  ]);
  const membershipPriceCents = settings.membershipPriceCents;

  // The House Mother's admin key opens every room, even without a member
  // account: a valid /admin session reads as full access site-wide.
  if (!user && adminSession) {
    return NextResponse.json({
      user: {
        name: "House Mother",
        email: process.env.ADMIN_EMAIL?.trim() ?? "",
        isMember: true,
        memberUntil: null,
        role: "admin",
        profile: null,
      },
      membershipPriceCents,
    });
  }
  if (!user) return NextResponse.json({ user: null, membershipPriceCents });

  const profile = await prisma.birthProfile.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    user: {
      name: user.name,
      email: user.email,
      isMember: isActiveMember(user) || adminSession,
      memberUntil: !user.isMember && user.memberUntil ? user.memberUntil : null,
      role: adminSession ? "admin" : user.role,
      profile: profile
        ? {
            name: profile.name,
            birthDate: profile.birthDate,
            birthTime: profile.birthTime,
            placeLabel: profile.placeLabel,
          }
        : null,
    },
    membershipPriceCents,
  });
}

/**
 * Send the confirmation link after the response has gone out, so neither a
 * slow mail provider nor a failed send changes what the visitor sees or how
 * long the answer takes.
 */
function sendConfirmationLater(user: { id: string; email: string; name: string | null }) {
  after(async () => {
    try {
      const link = `${baseUrl()}/confirm?token=${createVerifyToken(user)}`;
      await sendMail(confirmEmailMessage(user.name, user.email, link));
    } catch (err) {
      console.error("confirmation email failed:", err instanceof Error ? err.message : err);
    }
  });
}

export async function POST(request: NextRequest) {
  // Every form on the site posts JSON. A plain HTML form on another site
  // cannot send this content type, so anything else is not ours.
  const mediaType = (request.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (mediaType !== "application/json") {
    return NextResponse.json({ error: "Check the form and try again." }, { status: 415 });
  }
  const body = await request.json().catch(() => null);
  const parsed = z.union([Signup, Login, Forgot, Reset]).safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the form and try again." }, { status: 400 });
  }
  const data = parsed.data;
  const email = "email" in data ? data.email.trim().toLowerCase() : "";

  const limited =
    data.mode === "forgot"
      ? await rateLimit(request, "auth-forgot", 5, 900)
      : await rateLimit(request, "auth", 20, 600);
  if (limited) return limited;

  if (data.mode === "forgot") {
    if (process.env.NODE_ENV === "production" && !process.env.RESEND_API_KEY?.trim()) {
      return NextResponse.json(
        {
          error:
            "The House can't send email quite yet. Please reach out to Alexandria directly and she'll reset your password for you.",
        },
        { status: 503 }
      );
    }
    // No inbox receives more than three reset emails an hour or eight a
    // day, whoever is asking and from however many addresses. Past that the
    // answer is the same quiet "ok", so the door still gives nothing away.
    if (!(await inboxAllows("reset", email))) {
      return NextResponse.json({ ok: true });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (user?.passwordHash) {
      const link = `${baseUrl()}/reset?token=${createResetToken(user)}`;
      // Sent after the response: the answer must not reveal whether the
      // account exists, by what it says or by how long it takes.
      after(async () => {
        try {
          await sendMail(passwordResetEmail(user.name, user.email, link));
        } catch (err) {
          console.error("password reset email failed:", err instanceof Error ? err.message : err);
        }
      });
    }
    return NextResponse.json({ ok: true });
  }

  if (data.mode === "reset") {
    const invalid = NextResponse.json(
      { error: "That reset link has expired or already been used. Request a fresh one." },
      { status: 400 }
    );
    const token = parseResetToken(data.token);
    if (!token) return invalid;
    const user = await prisma.user.findUnique({ where: { id: token.userId } });
    if (!user || !tokenMatchesUser(token.fp, user.passwordHash)) return invalid;
    // The new hash also ends every other session this account had open.
    // The reset link arrived by email, so finishing a reset also proves the
    // inbox belongs to whoever holds this account now.
    // If the address had never been confirmed, this reset may be its real
    // owner taking the account back from someone who signed up with it
    // first. Whatever calendar address that person was shown is retired.
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(data.password),
        emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
        ...(user.emailVerifiedAt ? {} : { feedVersion: { increment: 1 } }),
      },
    });
    await setUserSession(updated);
    await rememberDevice(updated);
    return NextResponse.json({ ok: true });
  }

  if (data.mode === "signup") {
    const existing = await prisma.user.findUnique({ where: { email } });
    // A row that already has a password is taken. A row that carries any
    // role beyond seeker (the House Mother's seeded account) is never
    // claimable from the public door, password or not: that path is the
    // admin sign-in. Both answer the same way, so the door gives nothing away.
    if (existing && (existing.passwordHash || existing.role !== "seeker")) {
      return NextResponse.json(
        { error: "That email already has an account. Try signing in." },
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
    await setUserSession(user);
    await rememberDevice(user);
    // Anyone can type any address into the sign-up form. Until the inbox
    // answers, the account is not shown sessions booked with that address.
    if (!user.emailVerifiedAt && (await inboxAllows("confirm", user.email))) {
      // Today's automatic link is this one: signing in again later today
      // does not send a second.
      await rateLimitKey("verify-auto-email", user.email, 1, 86400);
      sendConfirmationLater(user);
    }
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  // Ten tries per account per quarter hour, from anywhere: guessing spread
  // across many addresses still meets one counter. A browser that has
  // signed in to this account before is exempt, so someone hammering the
  // door cannot lock the real member out of it.
  const known = user ? await isKnownDevice(user) : false;
  if (!known && !(await rateLimitKey("auth-login-email", email, 10, 900))) {
    return NextResponse.json(
      { error: "Too many tries for this account. Wait a few minutes, or reset your password." },
      { status: 429 }
    );
  }
  // An unknown address still pays for one password check at the current
  // cost, and so does a wrong guess against an older, cheaper hash: the
  // time the answer takes says nothing about the account.
  const stored = user?.passwordHash ?? null;
  const matches = verifyPassword(data.password, stored ?? DECOY_HASH);
  if (!user || !stored || !matches) {
    // Every refused try pays for one check at each cost, old and current,
    // whichever kind of hash (or none) the address really has.
    verifyPassword(data.password, stored && needsRehash(stored) ? DECOY_HASH : LEGACY_DECOY_HASH);
    return NextResponse.json(
      { error: "That email and password don't match our records." },
      { status: 401 }
    );
  }
  // Hashes made at the old cost are upgraded the moment they verify.
  if (needsRehash(stored)) {
    user.passwordHash = hashPassword(data.password);
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: user.passwordHash } });
  }
  await setUserSession(user);
  await rememberDevice(user);
  // An account from before confirmation existed gets its link on sign-in,
  // at most once a day, so nobody has to go looking for the button.
  // Skipped when this sign-in is itself the middle of confirming (the link
  // is already in hand).
  if (
    !user.emailVerifiedAt &&
    !data.confirming &&
    (await rateLimitKey("verify-auto-email", user.email, 1, 86400)) &&
    (await inboxAllows("confirm", user.email))
  ) {
    sendConfirmationLater(user);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearUserSession();
  return NextResponse.json({ ok: true });
}
