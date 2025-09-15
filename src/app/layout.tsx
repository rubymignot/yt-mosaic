import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YT Mosaic Viewer",
  description: "Watch multiple YouTube videos at once in a customizable mosaic layout.",
  keywords: ["YouTube", "mosaic", "multiple videos", "video grid", "multiviewer"],
  openGraph: {
    title: "YT Mosaic Viewer",
    description: "Watch multiple YouTube videos at once in a customizable mosaic layout.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "YT Mosaic Viewer",
    description: "Watch multiple YouTube videos at once in a customizable mosaic layout.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Script defer src={process.env.UMAMI_SCRIPT_URL} data-website-id={process.env.UMAMI_WEBSITE_ID}></Script>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
