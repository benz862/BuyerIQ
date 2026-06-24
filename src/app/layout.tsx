import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://buyeriq.app"),
  title: {
    default: "BuyerIQ - Stop Guessing. Start Buying Smarter.",
    template: "%s | BuyerIQ",
  },
  description:
    "BuyerIQ helps buyers, renters, and relocators organize real estate due diligence, identify risks, track questions, compare options, and generate reports.",
  applicationName: "BuyerIQ",
  keywords: [
    "home buying",
    "real estate",
    "property evaluation",
    "property comparison",
    "buyer intelligence",
    "real estate due diligence",
    "rental due diligence",
  ],
  openGraph: {
    title: "BuyerIQ - Stop Guessing. Start Buying Smarter.",
    description:
      "Make smarter real estate decisions with due diligence projects, question tracking, regional risks, comparisons, and reports.",
    url: "https://buyeriq.app",
    siteName: "BuyerIQ",
    images: [{ url: "/buyeriq-logo.png", alt: "BuyerIQ logo" }],
    locale: "en_US",
    type: "website",
  },
  icons: {
    icon: "/buyeriq-logo.png",
    apple: "/buyeriq-logo.png",
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1a6fd4",
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
