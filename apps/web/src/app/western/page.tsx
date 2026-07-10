import type { Metadata } from "next";
import { StudioClient } from "@/components/studio/StudioClient";

export const metadata: Metadata = {
  title: "Western astrology — free natal charts",
  description:
    "The tropical sky: your Western natal chart with wheel, aspects, houses and readings — free.",
};

export default function WesternPage() {
  return <StudioClient initialSystem="western" />;
}
