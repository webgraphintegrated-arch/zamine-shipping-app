import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://zamineshipping.com"),
  title: "Zamine Shipping Services | Shipping from USA to Antigua",
  description:
    "Fast, reliable shipping from the USA to Antigua with package tracking and customs support.",
  keywords: [
    "Air Freight Antigua",
    "Sea Freight Antigua",
    "Package Forwarding Antigua",
    "Customs Clearance Antigua",
    "Shipping from USA to Antigua",
    "Zamine Shipping Services",
  ],
  openGraph: {
    title: "Zamine Shipping Services",
    description:
      "Fast, reliable shipping from the USA to Antigua with package tracking and customs support.",
    url: "https://zamineshipping.com",
    siteName: "Zamine Shipping Services",
    images: [
      {
        url: "/zamine-logo.png",
        width: 1200,
        height: 630,
        alt: "Zamine Shipping Services",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zamine Shipping Services",
    description:
      "Fast, reliable shipping from the USA to Antigua with package tracking and customs support.",
    images: ["/zamine-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}