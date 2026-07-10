import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The calculation engine loads the native Swiss Ephemeris binding and its
  // data files from disk — both must stay external to the server bundle so
  // node-gyp-build and the ephe path resolve on the real filesystem.
  serverExternalPackages: ["@hoa/engine", "sweph"],
};

export default nextConfig;
