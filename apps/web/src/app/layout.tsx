import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PwaRegister } from "@/components/PwaRegister";
import { ListeningRoom } from "@/components/ListeningRoom";
import { LocaleProvider } from "@/lib/i18n";
import { UserProvider } from "@/components/UserProvider";
import { CosmicDecor } from "@/components/CosmicDecor";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "House of Alexxann — Astrology, Western & Vedic",
    template: "%s · House of Alexxann",
  },
  description:
    "Professional Western and Vedic astrology: cast your natal chart free in the Chart Studio, then book a personal reading with Alexandria.",
  applicationName: "House of Alexxann",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "House of Alexxann",
  },
};

export const viewport: Viewport = {
  themeColor: "#fdfbfa",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <LocaleProvider>
          <UserProvider>
          <div className="starfield" aria-hidden />
          <CosmicDecor />
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
          <ListeningRoom />
          <PwaRegister />
          </UserProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
