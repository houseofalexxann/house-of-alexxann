import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "House of Alexxann · Astrology",
    short_name: "Alexxann",
    description:
      "Cast precise Western & Vedic natal charts free, and book readings with Alexandria.",
    id: "/",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    // The House lives in the night now: match the pearl-50 ground so the
    // installed app's splash and the browser chrome don't flash white.
    background_color: "#17121f",
    theme_color: "#17121f",
    categories: ["lifestyle"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
