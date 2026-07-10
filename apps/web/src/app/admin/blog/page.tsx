import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import { BlogManager } from "@/components/admin/BlogManager";

export default async function AdminBlogPage() {
  await requireAdmin();
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div>
      <h1 className="text-3xl text-ink-900">The daily sky — posts</h1>
      <p className="mt-1 text-sm text-ink-500">
        Write astro weather, history, lore. Mark a post ✦ members to place it
        behind the membership veil.
      </p>
      <BlogManager
        posts={posts.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt,
          body: p.body,
          premium: p.premium,
          published: Boolean(p.publishedAt),
        }))}
      />
    </div>
  );
}
