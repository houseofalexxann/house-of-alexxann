import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";

/**
 * Admin CRUD for weekly availability rules and date exceptions.
 * Body: { kind: "rule" | "exception", action: "create" | "update" | "delete", ...fields }
 */

function bad(error: string): NextResponse {
  return NextResponse.json({ error }, { status: 400 });
}

function isMinute(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 1440;
}

function isWeekday(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && n >= 0 && n <= 6;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return bad("Invalid JSON body.");

  const { kind, action } = body;
  if (kind !== "rule" && kind !== "exception") return bad("kind must be 'rule' or 'exception'.");
  if (action !== "create" && action !== "update" && action !== "delete") {
    return bad("action must be 'create', 'update' or 'delete'.");
  }

  if (kind === "rule") {
    if (action === "create") {
      const { weekday, startMinute, endMinute } = body;
      if (!isWeekday(weekday)) return bad("weekday must be an integer 0–6.");
      if (!isMinute(startMinute) || !isMinute(endMinute)) {
        return bad("startMinute and endMinute must be integers 0–1440.");
      }
      if (startMinute >= endMinute) return bad("Start time must be before end time.");
      await prisma.availabilityRule.create({
        data: {
          weekday,
          startMinute,
          endMinute,
          active: typeof body.active === "boolean" ? body.active : true,
        },
      });
      return NextResponse.json({ ok: true });
    }

    const id = body.id;
    if (typeof id !== "string" || !id) return bad("id is required.");

    if (action === "delete") {
      await prisma.availabilityRule.deleteMany({ where: { id } });
      return NextResponse.json({ ok: true });
    }

    // update — validate any provided fields against the merged result.
    const existing = await prisma.availabilityRule.findUnique({ where: { id } });
    if (!existing) return bad("Rule not found.");
    const data: { weekday?: number; startMinute?: number; endMinute?: number; active?: boolean } = {};
    if (body.weekday !== undefined) {
      if (!isWeekday(body.weekday)) return bad("weekday must be an integer 0–6.");
      data.weekday = body.weekday;
    }
    if (body.startMinute !== undefined) {
      if (!isMinute(body.startMinute)) return bad("startMinute must be an integer 0–1440.");
      data.startMinute = body.startMinute;
    }
    if (body.endMinute !== undefined) {
      if (!isMinute(body.endMinute)) return bad("endMinute must be an integer 0–1440.");
      data.endMinute = body.endMinute;
    }
    if (body.active !== undefined) {
      if (typeof body.active !== "boolean") return bad("active must be a boolean.");
      data.active = body.active;
    }
    const start = data.startMinute ?? existing.startMinute;
    const end = data.endMinute ?? existing.endMinute;
    if (start >= end) return bad("Start time must be before end time.");
    await prisma.availabilityRule.update({ where: { id }, data });
    return NextResponse.json({ ok: true });
  }

  // kind === "exception"
  if (action === "create") {
    const { date, startMinute, endMinute } = body;
    if (typeof date !== "string" || !DATE_RE.test(date)) return bad("date must be YYYY-MM-DD.");
    const hasStart = startMinute !== undefined && startMinute !== null;
    const hasEnd = endMinute !== undefined && endMinute !== null;
    if (hasStart !== hasEnd) return bad("Provide both start and end times, or neither.");
    if (hasStart) {
      if (!isMinute(startMinute) || !isMinute(endMinute)) {
        return bad("startMinute and endMinute must be integers 0–1440.");
      }
      if ((startMinute as number) >= (endMinute as number)) {
        return bad("Start time must be before end time.");
      }
    }
    await prisma.availabilityException.create({
      data: {
        date,
        blocked: typeof body.blocked === "boolean" ? body.blocked : true,
        startMinute: hasStart ? (startMinute as number) : null,
        endMinute: hasEnd ? (endMinute as number) : null,
        note: typeof body.note === "string" && body.note.trim() ? body.note.trim() : null,
      },
    });
    return NextResponse.json({ ok: true });
  }

  const id = body.id;
  if (typeof id !== "string" || !id) return bad("id is required.");

  if (action === "delete") {
    await prisma.availabilityException.deleteMany({ where: { id } });
    return NextResponse.json({ ok: true });
  }

  // update
  const existing = await prisma.availabilityException.findUnique({ where: { id } });
  if (!existing) return bad("Exception not found.");
  const data: {
    date?: string;
    blocked?: boolean;
    startMinute?: number | null;
    endMinute?: number | null;
    note?: string | null;
  } = {};
  if (body.date !== undefined) {
    if (typeof body.date !== "string" || !DATE_RE.test(body.date)) return bad("date must be YYYY-MM-DD.");
    data.date = body.date;
  }
  if (body.blocked !== undefined) {
    if (typeof body.blocked !== "boolean") return bad("blocked must be a boolean.");
    data.blocked = body.blocked;
  }
  if (body.startMinute !== undefined) {
    if (body.startMinute !== null && !isMinute(body.startMinute)) {
      return bad("startMinute must be an integer 0–1440 or null.");
    }
    data.startMinute = body.startMinute as number | null;
  }
  if (body.endMinute !== undefined) {
    if (body.endMinute !== null && !isMinute(body.endMinute)) {
      return bad("endMinute must be an integer 0–1440 or null.");
    }
    data.endMinute = body.endMinute as number | null;
  }
  if (body.note !== undefined) {
    data.note = typeof body.note === "string" && body.note.trim() ? body.note.trim() : null;
  }
  const start = data.startMinute !== undefined ? data.startMinute : existing.startMinute;
  const end = data.endMinute !== undefined ? data.endMinute : existing.endMinute;
  if ((start == null) !== (end == null)) return bad("Provide both start and end times, or neither.");
  if (start != null && end != null && start >= end) return bad("Start time must be before end time.");
  await prisma.availabilityException.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}
