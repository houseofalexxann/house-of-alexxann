import { NextRequest, NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/bookings";

/**
 * Reminder dispatch. In production, point a cron (e.g. Vercel Cron) here
 * hourly with `Authorization: Bearer $CRON_SECRET`. In dev the in-process
 * scheduler (instrumentation.ts) calls the same logic directly.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  const sent = await sendDueReminders();
  return NextResponse.json({ sent });
}
