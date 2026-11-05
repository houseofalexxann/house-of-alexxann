import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/geocode";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Typing a city is a few dozen requests at most; the upstream geocoder and
  // the data cache should never be anyone's free proxy.
  const limited = rateLimit(request, "geocode", 40, 60);
  if (limited) return limited;
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100);
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
