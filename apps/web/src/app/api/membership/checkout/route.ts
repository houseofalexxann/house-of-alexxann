import { NextResponse } from "next/server";
import { sessionUser } from "@/lib/user-auth";
import { createMembershipCheckout, stripeEnabled } from "@/lib/stripe";
import { baseUrl } from "@/lib/bookings";

/** Starts a $5/month Venusian Doll subscription checkout for the signed-in user. */
export async function POST() {
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
  const { url } = await createMembershipCheckout(user.id, user.email, baseUrl());
  return NextResponse.json({ url });
}
