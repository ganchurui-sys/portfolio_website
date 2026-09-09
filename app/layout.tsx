import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "pageflipopen/pageflipopen.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
