import type { Metadata } from "next";
import localFont from "next/font/local";
import "pageflipopen/pageflipopen.css";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/Geist-latin.woff2",
  variable: "--font-geist-sans",
  weight: "100 900",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/GeistMono-latin.woff2",
  variable: "--font-geist-mono",
  weight: "100 900",
  display: "swap",
});

const title = "Zhongism — Portfolio";
const description = "Independent designer and creative thinker — selected work from 2024 to 2026.";

export const metadata: Metadata = {
  metadataBase: new URL("https://zhongism.design"),
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
    images: [{ url: "/portfolio-title.png", width: 1774, height: 887, alt: "Portfolio" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/portfolio-title.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
