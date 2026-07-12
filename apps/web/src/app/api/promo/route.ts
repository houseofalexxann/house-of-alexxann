import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sessionUser } from "@/lib/user-auth";
import { isActiveMember, MEMBERSHIP_PRICE_CENTS } from "@/lib/membership";
import { discountedCents, findValidPromo, redeemPromo } from "@/lib/promos";
import { rateLimit } from "@/lib/rate-limit";

const Body = z.object({ code: z.string().min(1).max(60) });

/**
 * Apply a code from /join:
 * - trial codes redeem immediately (signed-in, once per account) and lift
 *   the veil until now + trialDays;
 * - membership codes return the discounted monthly price for display/checkout
 *   (counted when the payment actually happens).
 */
export async function POST(request: NextRequest) {
  const limited = rateLimit(request, "promo", 10, 600);
  if (limited) return limited;

  const parsed = Body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a code first." }, { status: 400 });
  }

  const user = await sessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Sign in first so the House knows whose veil to lift." },
      { status: 401 }
    );
  }

  // Try trial first, then membership — the visitor shouldn't need to know
  // which kind their code is.
  const asTrial = await findValidPromo(parsed.data.code, "trial");
  if ("promo" in asTrial) {
    if (isActiveMember(user)) {
      return NextResponse.json({ error: "Your veil is already lifted ✦" }, { status: 409 });
    }
    if (user.trialRedeemedAt) {
      return NextResponse.json(
        { error: "This account has already had its free trial." },
        { status: 409 }
      );
    }
    if (!(await redeemPromo(asTrial.promo))) {
      return NextResponse.json({ error: "That code has been fully redeemed." }, { status: 409 });
    }
    const until = new Date(Date.now() + (asTrial.promo.trialDays ?? 0) * 86400_000);
    await prisma.user.update({
      where: { id: user.id },
      data: { memberUntil: until, trialRedeemedAt: new Date() },
    });
    return NextResponse.json({ ok: true, kind: "trial", memberUntil: until });
  }

  const asMembership = await findValidPromo(parsed.data.code, "membership");
  if ("promo" in asMembership) {
    return NextResponse.json({
      ok: true,
      kind: "membership",
      priceCents: discountedCents(MEMBERSHIP_PRICE_CENTS, asMembership.promo),
    });
  }

  // Neither matched — return whichever message is most specific.
  return NextResponse.json({ error: asTrial.error }, { status: 400 });
}
