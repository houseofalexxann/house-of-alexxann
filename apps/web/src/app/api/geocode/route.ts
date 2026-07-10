import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/geocode";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ results: [] });
  try {
    const results = await searchPlaces(q);
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json(
      { results: [], error: "Place search is unavailable right now." },
      { status: 502 }
    );
  }
}
