import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "The daily sky — blog",
  description:
    "Astro weather, history and lore from House of Alexxann — daily notes on the sky we're all living under.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await prisma.post.findMany({
    where: { publishedAt: { not: null, lte: new Date() } },
    orderBy: { publishedAt: "desc" },
    take: 30,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-14 sm:px-6">
      <header className="mb-10 text-center">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-rose-500">
          The daily sky
        </p>
        <h1 className="text-4xl text-ink-900">Notes from the House</h1>
        <p className="mx-auto mt-3 max-w-lg text-ink-500">
          Astro weather, history, and lore — written daily, under whatever the
          sky is doing.
        </p>
      </header>
      {posts.length === 0 ? (
        <p className="text-center text-sm text-ink-500">
          The first note is being written — check back tomorrow.
        </p>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <Link key={p.id} href={`/blog/${p.slug}`} className="card block p-6 transition-shadow hover:shadow-lg">
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-heading text-2xl text-ink-900">{p.title}</h2>
                {p.premium && (
                  <span className="shrink-0 rounded-full bg-rose-300/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-600">
                    ✦ members
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-ink-400">
                {p.publishedAt!.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-700">{p.excerpt}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
