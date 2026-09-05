import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
