import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sessionUser } from "@/lib/user-auth";
import { isAdmin } from "@/lib/admin-auth";
import { localBirthToUtc } from "@/lib/geocode";
import { isActiveMember, TIER_NAMES } from "@/lib/membership";
import { savedProfiles } from "@/lib/profiles";
import { BirthDateString } from "@/lib/birth-input";
import { FREE_OTHER_CHARTS, MEMBER_OTHER_CHARTS, sameBirth } from "@/lib/saved-charts";
import { rateLimit } from "@/lib/rate-limit";

const Input = z.object({
  name: z.string().trim().max(120).default(""),
  birthDate: BirthDateString,
  birthTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  placeLabel: z.string().max(200),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  timezone: z.string().max(64),
  /**
   * "self"  save or replace the account holder's own chart.
   * "other" keep this chart for someone else.
   * "auto"  what the Studio sent after every cast before saved charts
   *         existed. Pages still open from before this release send it; it
   *         is accepted and saves nothing, because nothing is saved now
   *         without being asked.
   */
  kind: z.enum(["auto", "self", "other"]).default("auto"),
});

/** How many charts beyond her own this account may keep. */
function othersAllowance(member: boolean): number {
  return member ? MEMBER_OTHER_CHARTS : FREE_OTHER_CHARTS;
}

/** The account's saved charts, and how many more it may keep. */
export async function GET() {
  const user = await sessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const profiles = await savedProfiles(user.id);
  const member = isActiveMember(user) || (await isAdmin().catch(() => false));
  return NextResponse.json({
    profiles,
    othersUsed: profiles.filter((p) => !p.isSelf).length,
    othersAllowed: othersAllowance(member),
    member,
  });
}

type Outcome =
  | { ok: true; saved: boolean; id?: string }
  | { ok: false; status: number; error: string; limit?: boolean };

/**
 * Save a chart. Always on purpose: as the account holder's own (the one the
 * calendar, the weather and the prefilled forms read) or kept for someone
 * else. Each account's saves run one at a time, so two quick requests can
 * neither make a second "own" chart nor slip past the limit.
 */
export async function POST(request: NextRequest) {
  const limited = await rateLimit(request, "profile", 120, 600, {
    shared: false,
    message: "That is a lot of saving at once. Give it a moment and try again.",
  });
  if (limited) return limited;

  const user = await sessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const parsed = Input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return NextResponse.json(
      {
        error:
          first && /supported/.test(first.message)
            ? first.message
            : "Those birth details could not be saved.",
      },
      { status: 400 }
    );
  }
  const p = parsed.data;
  if (p.kind === "auto") return NextResponse.json({ ok: true, saved: false });
  if (p.kind === "other" && !p.name) {
    return NextResponse.json({ error: "Give this chart a name first, so you can find it again." }, { status: 400 });
  }

  let utc: Date;
  try {
    utc = new Date(
      localBirthToUtc({
        date: p.birthDate,
        time: p.birthTime ?? "12:00",
        timeKnown: Boolean(p.birthTime),
        timezone: p.timezone,
      }).utc
    );
  } catch {
    return NextResponse.json({ error: "Those birth details could not be saved." }, { status: 400 });
  }
  const data = {
    name: p.name || user.name || "My chart",
    birthDate: p.birthDate,
    birthTime: p.birthTime,
    timeKnown: Boolean(p.birthTime),
    placeLabel: p.placeLabel,
    latitude: p.latitude,
    longitude: p.longitude,
    timezone: p.timezone,
    utc,
    userId: user.id,
  };
  const member = isActiveMember(user) || (await isAdmin().catch(() => false));
  const sameName = (a: string) => a.trim().toLowerCase() === data.name.trim().toLowerCase();

  let outcome: Outcome;
  try {
    outcome = await prisma.$transaction(async (tx): Promise<Outcome> => {
    // One save at a time per account, held until this transaction ends.
    // (executeRaw, not queryRaw: the lock function returns nothing to read.)
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${`saved-charts:${user.id}`}))`;
    const rows = await tx.birthProfile.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });
    const own = rows.filter((r) => r.isSelf);
    const others = rows.filter((r) => !r.isSelf);

    if (p.kind === "self") {
      const [mine, ...extra] = own;
      const row = mine
        ? await tx.birthProfile.update({ where: { id: mine.id }, data })
        : await tx.birthProfile.create({ data: { ...data, isSelf: true } });
      // There is one own chart. Any stray second one, and any copy of these
      // same details kept under the same name for "someone else", goes.
      const redundant = [
        ...extra.map((r) => r.id),
        ...others.filter((o) => sameBirth(o, p) && sameName(o.name)).map((o) => o.id),
      ];
      if (redundant.length) await tx.birthProfile.deleteMany({ where: { id: { in: redundant }, userId: user.id } });
      return { ok: true, saved: true, id: row.id };
    }

    // Someone else's chart.
    const already = others.find((o) => sameBirth(o, p) && sameName(o.name));
    if (already) return { ok: true, saved: false, id: already.id };
    if (others.length >= othersAllowance(member)) {
      return {
        ok: false,
        status: 403,
        // Only a free account is pointed at membership; a member's way
        // forward is to make room.
        limit: !member,
        error: member
          ? "This shelf is full. Remove a chart you no longer need to make room."
          : `A free account keeps its own chart and ${FREE_OTHER_CHARTS} more. A ${TIER_NAMES.member} membership keeps as many as you need.`,
      };
    }
    const created = await tx.birthProfile.create({ data: { ...data, isSelf: false } });
    return { ok: true, saved: true, id: created.id };
    }, { maxWait: 5000, timeout: 10000 });
  } catch (err) {
    // A queue of saves that ran out of time, or a chart removed in another
    // tab mid-save: nothing was half-written, so asking again is safe.
    console.error("[profile] save failed:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "That did not save. Try again in a moment." }, { status: 503 });
  }

  if (!outcome.ok) {
    return NextResponse.json({ error: outcome.error, limit: outcome.limit }, { status: outcome.status });
  }
  return NextResponse.json(outcome);
}

/** Remove one saved chart. Only ever one of the signed-in account's own rows. */
export async function DELETE(request: NextRequest) {
  const user = await sessionUser();
  if (!user) return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  const id = request.nextUrl.searchParams.get("id") ?? "";
  if (!id) return NextResponse.json({ error: "Which chart?" }, { status: 400 });
  const { count } = await prisma.birthProfile.deleteMany({ where: { id, userId: user.id } });
  if (count === 0) return NextResponse.json({ error: "That chart is not on your shelf." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
