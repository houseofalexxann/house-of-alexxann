import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

const Input = z.object({
  id: z.string(),
  isMember: z.boolean(),
});

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const parsed = Input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Bad input." }, { status: 400 });
  await prisma.user.update({
    where: { id: parsed.data.id },
    data: { isMember: parsed.data.isMember },
  });
  return NextResponse.json({ ok: true });
}
