import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdminApi } from "@/lib/admin-auth";

const PostInput = z.object({
  id: z.string().optional(),
  title: z.string().min(1).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(120),
  excerpt: z.string().min(1).max(500),
  body: z.string().min(1).max(50_000),
  premium: z.boolean().default(false),
  published: z.boolean().default(true),
  action: z.enum(["save", "delete"]).default("save"),
});

export async function POST(request: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const parsed = PostInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the post fields." }, { status: 400 });
  }
  const p = parsed.data;

  if (p.action === "delete" && p.id) {
    await prisma.post.delete({ where: { id: p.id } });
    return NextResponse.json({ ok: true });
  }

  const data = {
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    body: p.body,
    premium: p.premium,
    publishedAt: p.published ? new Date() : null,
  };
  const post = p.id
    ? await prisma.post.update({ where: { id: p.id }, data })
    : await prisma.post.create({ data });
  return NextResponse.json({ ok: true, id: post.id });
}
