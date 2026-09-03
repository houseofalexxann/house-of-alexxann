import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/bookings";
import { SERVICES } from "@/lib/services";
import { prisma } from "@/lib/db";

export const revalidate = 3600;

/**
 * Every public page the House wants found: the rooms, each reading, and the
 * published dispatches. Members-only and account pages are deliberately
 * absent (see robots.ts).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const now = new Date();

  const rooms: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/studio`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/western`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/vedic`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/human-design`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/tarot`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/transits`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/codex`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/join`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/donate`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/accessibility`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const readings: MetadataRoute.Sitemap = SERVICES.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  let dispatches: MetadataRoute.Sitemap = [];
  try {
    const posts = await prisma.post.findMany({
      where: { publishedAt: { not: null, lte: now } },
      select: { slug: true, publishedAt: true },
      orderBy: { publishedAt: "desc" },
      take: 500,
    });
    dispatches = posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.publishedAt ?? now,
      changeFrequency: "yearly",
      priority: 0.5,
    }));
  } catch {
    // A sleeping database should never take the sitemap down with it.
  }

  return [...rooms, ...readings, ...dispatches];
}
