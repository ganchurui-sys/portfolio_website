import type { Metadata } from "next";
import { Geist, Geist_Mono, WindSong } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const windSong = WindSong({
  variable: "--font-windsong",
  subsets: ["latin"],
  weight: "500",
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = new URL(`${protocol}://${host}`);
  const title = "Portfolio 2026 — Selected Work";
  const description = "Independent designer and creative thinker — selected work from 2024 to 2026.";

  return {
    metadataBase: baseUrl,
    title,
    description,
    icons: {
      icon: "/favicon.jpg",
      shortcut: "/favicon.jpg",
    },
    openGraph: {
      title,
      description,
      type: "website",
      images: [{ url: "/og-script.png", width: 1732, height: 908, alt: "Portfolio" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-script.png"],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${windSong.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
