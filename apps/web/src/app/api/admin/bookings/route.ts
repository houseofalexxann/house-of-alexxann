import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { finalizePaidBooking } from "@/lib/bookings";

/**
 * Admin booking actions.
 * - "mark-paid": confirm a direct payment arrived → sets paid/confirmed and
 *   sends the confirmation email (via finalizePaidBooking, idempotent).
 * - "cancel": release the slot.
 */
export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  const { id, action } = (await request.json().catch(() => ({}))) as {
    id?: string;
    action?: string;
  };
  if (!id || !action) {
    return NextResponse.json({ error: "Missing id or action." }, { status: 400 });
  }

  try {
    if (action === "mark-paid") {
      await finalizePaidBooking(id);
      return NextResponse.json({ ok: true });
    }
    if (action === "cancel") {
      await prisma.booking.update({ where: { id }, data: { status: "canceled" } });
      return NextResponse.json({ ok: true });
    }
  } catch (err) {
    console.error(`[admin/bookings] ${action} failed for ${id}:`, err);
    return NextResponse.json({ error: "Booking not found." }, { status: 400 });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
