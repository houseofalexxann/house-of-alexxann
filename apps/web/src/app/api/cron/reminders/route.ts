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
  const sent = await withOneRetry(sendDueReminders);
  return NextResponse.json({ sent });
}

/**
 * The serverless database pooler sometimes closes an idle connection just
 * before we use it (Prisma P1017, ECONNRESET). One retry on a fresh
 * connection is enough; anything else is a real error and surfaces.
 */
async function withOneRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (!isConnectionDrop(err)) throw err;
    console.warn("[reminders] connection dropped, retrying once");
    return await fn();
  }
}

function isConnectionDrop(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: unknown; message?: unknown };
  const msg = String(e.message ?? "");
  return (
    e.code === "P1017" ||
    e.code === "ECONNRESET" ||
    /closed the connection|ConnectionClosed|socket disconnected/i.test(msg)
  );
}
