import type { MetadataRoute } from "next";
import { baseUrl } from "@/lib/bookings";

/**
 * What crawlers may index. The public rooms are open; anything personal
 * (accounts, calendars, payment, the admin) and the JSON endpoints stay out.
 */
export default function robots(): MetadataRoute.Robots {
  const base = baseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/account",
          "/calendar",
          "/book/pay/",
          "/book/confirmation",
          "/reset",
          "/forgot",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
