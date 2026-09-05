import type { Metadata } from "next";
import { Playfair_Display, Manrope, DM_Sans } from "next/font/google";
import "./globals.css";
import ReduxProvider from "@/components/providers/ReduxProvider";
import { Toast } from "@/components/ui/toast";
import { CookieConsentBanner } from "@/components/layout/CookieConsentBanner";

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-support",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Vikan Matrimony | Endless Bond. Perfect Match.",
  description:
    "Experience a luxurious, modern, and highly trusted Indian matchmaking platform. Discover verified profiles, personalized partner matches, and premium family-centric matchmaking.",
  keywords: [
    "Vikan Matrimony",
    "Indian Matrimony",
    "Luxury Matchmaking",
    "Verified Brides",
    "Verified Grooms",
    "Elite Shaadi",
    "Bharat Matrimony",
  ],
  authors: [{ name: "Vikan Matrimony" }],
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${manrope.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground transition-colors duration-300">
        <ReduxProvider>
          {children}
          <Toast />
          <CookieConsentBanner />
        </ReduxProvider>
      </body>
    </html>
  );
}
