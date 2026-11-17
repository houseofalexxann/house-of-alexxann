import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sessionUser } from "@/lib/user-auth";
import { rateLimit } from "@/lib/rate-limit";
import { calendarToken } from "@/lib/calendar-token";
import { baseUrl } from "@/lib/bookings";
import { isActiveMember } from "@/lib/membership";

/**
 * Retire the signed-in account's calendar feed address and hand back a new
 * one. Every address made before this moment stops working.
 */
export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, "calendar-reset", 10, 3600);
  if (limited) return limited;

  const user = await sessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to reset your calendar address." }, { status: 401 });
  }
  if (!isActiveMember(user)) {
    return NextResponse.json({ error: "The calendar feed belongs to an active membership." }, { status: 403 });
  }
  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { feedVersion: { increment: 1 } },
    select: { id: true, feedVersion: true },
  });
  return NextResponse.json({
    ok: true,
    url: `${baseUrl()}/api/calendar/${calendarToken(updated.id, updated.feedVersion)}`,
  });
}
