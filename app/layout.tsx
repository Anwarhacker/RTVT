import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { PWARegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: "RTVT - Real-Time Voice Translator",
  description: "A comprehensive multilingual voice translation application with real-time speech recognition, text-to-speech, image analysis, and dictionary functionality.",
  generator: "Next.js",
  applicationName: "RTVT",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RTVT",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#3182ce",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <PWARegister />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
