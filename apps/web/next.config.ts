import type { NextConfig } from "next";

/**
 * Security headers on every response. HSTS keeps visitors on HTTPS for two
 * years including subdomains; frame-ancestors 'none' plus X-Frame-Options
 * block clickjacking; nosniff stops MIME confusion; the referrer policy keeps
 * full URLs (which can carry reset and calendar tokens) off third-party
 * logs; the permissions policy switches off hardware APIs the House never
 * uses; COOP isolates the browsing context. Card checkout happens on
 * Stripe's own pages, so payment=() costs nothing here.
 */
const SECURITY_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
  // The calculation engine loads the native Swiss Ephemeris binding and its
  // data files from disk — both must stay external to the server bundle so
  // node-gyp-build and the ephe path resolve on the real filesystem.
  serverExternalPackages: ["@hoa/engine", "sweph"],
  // The Swiss Ephemeris data files are read from disk at runtime, never
  // imported, so file tracing would not carry them into the serverless
  // functions on its own. Every route that casts a chart needs them.
  outputFileTracingIncludes: {
    "/api/**": ["../../packages/engine/ephe/**"],
    "/**": ["../../packages/engine/ephe/**"],
  },
};

export default nextConfig;
