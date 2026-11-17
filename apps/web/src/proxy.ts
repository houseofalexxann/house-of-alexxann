import { NextResponse, type NextRequest } from "next/server";

/**
 * One rule, at the door of every API route: a request that changes
 * something must come from this site's own pages.
 *
 * Without it another website could post a sign-in form at /api/auth and
 * leave a visitor's browser signed in to an account that is not theirs, or
 * fire any other cookie-carrying request on their behalf. Browsers label
 * where a request came from (Sec-Fetch-Site, Origin); a cross-site label on
 * a state-changing request is refused before any route runs.
 *
 * Requests with neither header are not browsers (Stripe's webhook, a
 * scheduled job, curl) and carry no visitor's cookies, so they pass through
 * to routes that authenticate them in their own way.
 */
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function ownHosts(request: NextRequest): Set<string> {
  const hosts = new Set<string>();
  for (const value of [
    request.headers.get("host"),
    request.headers.get("x-forwarded-host"),
    request.nextUrl.host,
  ]) {
    if (value) hosts.add(value.toLowerCase());
  }
  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL;
    if (base) hosts.add(new URL(base).host.toLowerCase());
  } catch {
    // An unparseable base URL adds nothing.
  }
  return hosts;
}

export function proxy(request: NextRequest) {
  if (SAFE_METHODS.has(request.method)) return NextResponse.next();

  const refuse = () =>
    NextResponse.json({ error: "That request did not come from this site." }, { status: 403 });

  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin" && site !== "none") return refuse();

  const origin = request.headers.get("origin");
  if (origin) {
    let host: string | null = null;
    try {
      host = new URL(origin).host.toLowerCase();
    } catch {
      host = null;
    }
    if (!host || !ownHosts(request).has(host)) return refuse();
  }
  return NextResponse.next();
}

export const config = { matcher: "/api/:path*" };
