import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sessionUser } from "@/lib/user-auth";
import { createVerifyToken, verifyTokenMatches } from "@/lib/email-verify";
import { confirmEmailMessage } from "@/lib/email-templates";
import { sendMail } from "@/lib/email";
import { baseUrl } from "@/lib/bookings";
import { inboxAllows, rateLimit } from "@/lib/rate-limit";

/**
 * Email confirmation, signed in only, POST only.
 *
 *   {}          send the confirmation link to the account's address
 *   { token }   finish: the link's token, posted by the /confirm page
 *
 * Nothing is confirmed by opening a link. The link opens /confirm, which
 * names the signed-in account and finishes with a button on this site, so
 * a mail scanner, a prefetch, or another website cannot complete it.
 */
const Body = z.object({ token: z.string().max(400).optional() });

export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, "verify", 20, 3600);
  if (limited) return limited;

  const user = await sessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });

  const raw: unknown = await request.json().catch(() => ({}));
  const parsed = Body.safeParse(raw);
  const carriesToken = typeof raw === "object" && raw !== null && "token" in raw;
  const token = parsed.success ? parsed.data.token : undefined;

  if (carriesToken || !parsed.success) {
    if (token === undefined || !verifyTokenMatches(token, user)) {
      return NextResponse.json(
        { error: "That link has expired or was made for a different account. Send a fresh one from your account page." },
        { status: 400 }
      );
    }
    if (!user.emailVerifiedAt) {
      await prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } });
    }
    return NextResponse.json({ ok: true });
  }

  if (user.emailVerifiedAt) return NextResponse.json({ ok: true, already: true });

  if (process.env.NODE_ENV === "production" && !process.env.RESEND_API_KEY?.trim()) {
    return NextResponse.json(
      { error: "The House can't send email quite yet. Please reach out to Alexandria directly." },
      { status: 503 }
    );
  }
  // No inbox receives more than five of these an hour or eight a day,
  // whoever is asking.
  if (!(await inboxAllows("confirm", user.email))) {
    return NextResponse.json(
      { error: "A few links are already on their way. Check your inbox, or wait a little before asking again." },
      { status: 429 }
    );
  }
  try {
    const link = `${baseUrl()}/confirm?token=${createVerifyToken(user)}`;
    await sendMail(confirmEmailMessage(user.name, user.email, link));
  } catch (err) {
    console.error("confirmation email failed:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { error: "That did not send. Give it a moment and try again." },
      { status: 502 }
    );
  }
  return NextResponse.json({ ok: true });
}
