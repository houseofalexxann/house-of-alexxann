import type { Metadata } from "next";
import { StudioClient } from "@/components/studio/StudioClient";

export const metadata: Metadata = {
  title: "Vedic astrology (Jyotish) — free sidereal charts",
  description:
    "The sidereal sky: Rasi & Navamsa charts, nakshatras with padas and lords, and the Vimshottari dasha timeline — free.",
};

export default function VedicPage() {
  return <StudioClient initialSystem="vedic" locked />;
}
