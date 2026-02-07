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

/**
 * SEO-optimized metadata for LickUI
 */
export const metadata: Metadata = {
  title: "LickUI - Remix Any Website with AI",
  description: "Paste a website URL, preview it locally, and reshape the UI using AI-powered chat. Transform any website instantly with LickUI.",
  keywords: ["AI", "web design", "UI", "website editor", "Tambo", "React"],
  authors: [{ name: "LickUI" }],
  openGraph: {
    title: "LickUI - Remix Any Website with AI",
    description: "Paste a website URL, preview it locally, and reshape the UI using AI-powered chat.",
    type: "website",
  },
};

/**
 * Root Layout
 * 
 * Provides the HTML structure, font variables, and global styles
 * for the entire application.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
