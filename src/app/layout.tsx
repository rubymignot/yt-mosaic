import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
