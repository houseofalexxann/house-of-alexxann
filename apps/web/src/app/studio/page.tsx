import type { Metadata } from "next";
import { StudioClient } from "@/components/studio/StudioClient";

export const metadata: Metadata = {
  title: "Chart Studio — free natal charts, Western & Vedic",
  description:
    "Cast a precise natal chart free: chart wheel, exact degrees, aspects, nakshatras, Vimshottari dasha and navamsa — Western and Vedic, side by side.",
};

export default function StudioPage() {
  return <StudioClient />;
}
