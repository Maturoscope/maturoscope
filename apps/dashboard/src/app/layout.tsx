import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono, Open_Sans, Inter } from "next/font/google";
import "./globals.css";
import { BrowserLanguageProvider } from "./hooks/contexts/useBrowserLanguage";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Loaded so the font selector can preview each option in its own typeface
const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maturoscope - Admin",
  description: "Marturoscope Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <BrowserLanguageProvider>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${openSans.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
      </BrowserLanguageProvider>
    </html>
  );
}
