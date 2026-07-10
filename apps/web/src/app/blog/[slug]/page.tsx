import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { RichText } from "@/components/chart/RichText";
import { PremiumGate } from "@/components/PremiumGate";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  return { title: post ? post.title : "Post", description: post?.excerpt };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post || !post.publishedAt || post.publishedAt > new Date()) notFound();

  const body = (
    <div className="space-y-4">
      <RichText text={post.body} className="leading-relaxed text-ink-700" />
    </div>
  );

  return (
    <article className="mx-auto max-w-2xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-8 text-center">
        <p className="text-xs text-ink-400">
          {post.publishedAt.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
        <h1 className="mt-2 text-4xl text-ink-900">{post.title}</h1>
        <hr className="gold-rule mx-auto mt-6 w-40" />
      </header>
      {post.premium ? (
        <PremiumGate title="This note is for members">{body}</PremiumGate>
      ) : (
        body
      )}
    </article>
  );
}
