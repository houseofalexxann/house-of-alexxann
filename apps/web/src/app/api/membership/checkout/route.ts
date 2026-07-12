import { NextRequest, NextResponse } from "next/server";
import { sessionUser } from "@/lib/user-auth";
import { createMembershipCheckout, stripeEnabled } from "@/lib/stripe";
import { baseUrl } from "@/lib/bookings";
import { MEMBERSHIP_PRICE_CENTS } from "@/lib/membership";
import { discountedCents, findValidPromo } from "@/lib/promos";

/** Starts a $5/month Venusian Doll subscription checkout for the signed-in user. */
export async function POST(request: NextRequest) {
  const user = await sessionUser();
  if (!user) {
    return NextResponse.json(
      { error: "Create a free account first so the House knows whose veil to lift." },
      { status: 401 }
    );
  }
  if (user.isMember || user.role === "admin") {
    return NextResponse.json({ error: "Your veil is already lifted ✦" }, { status: 409 });
  }
  if (!stripeEnabled()) {
    return NextResponse.json(
      { error: "Card checkout isn't open yet — use the direct-pay options below." },
      { status: 501 }
    );
  }

  const body = await request.json().catch(() => ({}));
  let price = MEMBERSHIP_PRICE_CENTS;
  let promoId: string | undefined;
  if (typeof body?.code === "string" && body.code.trim()) {
    const found = await findValidPromo(body.code, "membership");
    if ("error" in found) return NextResponse.json({ error: found.error }, { status: 400 });
    price = discountedCents(price, found.promo);
    promoId = found.promo.id;
  }

  const { url } = await createMembershipCheckout(user.id, user.email, baseUrl(), price, promoId);
  return NextResponse.json({ url });
}
