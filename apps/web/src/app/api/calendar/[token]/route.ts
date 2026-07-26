import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { userIdFromCalendarToken } from "@/lib/calendar-token";
import { isActiveMember } from "@/lib/membership";
import { buildPersonalCalendar, toICalendar } from "@/lib/personal-calendar";

/**
 * Subscribable iCal feed of a member's personal timing calendar. The token is
 * a bearer credential, so it is verified on every fetch and membership is
 * re-checked here rather than trusted from when the link was made.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const userId = userIdFromCalendarToken(token);
  if (!userId) {
    return NextResponse.json({ error: "Unknown calendar." }, { status: 404 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !isActiveMember(user)) {
    return NextResponse.json(
      { error: "This calendar belongs to a Venusian Doll membership that isn't active." },
      { status: 403 }
    );
  }

  const profile = await prisma.birthProfile.findFirst({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  if (!profile) {
    return NextResponse.json(
      { error: "Save your birth details in the Studio first, then the calendar has something to read." },
      { status: 404 }
    );
  }

  const now = new Date();
  const from = new Date(now.getTime() - 7 * 86_400_000).toISOString();
  const to = new Date(now.getTime() + 400 * 86_400_000).toISOString();
  const cal = buildPersonalCalendar(profile, from, to, { maxEvents: 300 });
  const ics = toICalendar(cal, `${profile.name} · House of Alexxann`);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "private, max-age=3600",
      "Content-Disposition": `inline; filename="house-of-alexxann.ics"`,
    },
  });
}
