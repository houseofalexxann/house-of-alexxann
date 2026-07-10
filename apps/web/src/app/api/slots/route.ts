import { NextRequest, NextResponse } from "next/server";
import { availableSlots } from "@/lib/slots";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams;
  const service = q.get("service") ?? "";
  const from = q.get("from") ?? new Date().toISOString();
  const to = q.get("to") ?? "";
  try {
    const result = await availableSlots(service, from, to);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Slot lookup failed." },
      { status: 400 }
    );
  }
}
