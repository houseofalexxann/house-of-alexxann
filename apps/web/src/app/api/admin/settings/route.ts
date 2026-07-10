import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { saveSettings, type SchedulerSettings } from "@/lib/settings";

/** Admin update of scheduler settings. Body: partial SchedulerSettings. */

const STRING_KEYS = [
  "practitionerTz",
  "videoLink",
  "phoneNumber",
  "inPersonAddress",
  "venmoHandle",
  "cashAppTag",
  "zelleContact",
  "paypalMeLink",
] as const;

const NUMBER_KEYS = ["bufferMinutes", "leadTimeHours", "horizonDays", "slotStepMinutes"] as const;

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const patch: Partial<SchedulerSettings> = {};

  for (const key of STRING_KEYS) {
    const value = body[key];
    if (value === undefined) continue;
    if (typeof value !== "string") {
      return NextResponse.json({ error: `${key} must be a string.` }, { status: 400 });
    }
    patch[key] = value.trim();
  }

  for (const key of NUMBER_KEYS) {
    const value = body[key];
    if (value === undefined) continue;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      return NextResponse.json(
        { error: `${key} must be a non-negative number.` },
        { status: 400 }
      );
    }
    patch[key] = value;
  }

  if (patch.practitionerTz !== undefined && !patch.practitionerTz) {
    return NextResponse.json({ error: "practitionerTz cannot be empty." }, { status: 400 });
  }
  if (patch.slotStepMinutes !== undefined && patch.slotStepMinutes < 1) {
    return NextResponse.json({ error: "slotStepMinutes must be at least 1." }, { status: 400 });
  }

  await saveSettings(patch);
  return NextResponse.json({ ok: true });
}
