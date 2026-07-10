import { NextRequest, NextResponse } from "next/server";
import {
  checkCredentials,
  clearSessionCookie,
  setSessionCookie,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const { email, password } = (await request.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  if (!email || !password || !checkCredentials(email, password)) {
    return NextResponse.json(
      { error: "That's not the key to this house." },
      { status: 401 }
    );
  }
  await setSessionCookie();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
