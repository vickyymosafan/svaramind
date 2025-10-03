import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { EnvironmentValidator } from "@/components/EnvironmentValidator";
import { ErrorBoundary } from "@/components/ErrorBoundary";
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
  title: "Mood-Based Music Discovery - Temukan Lagu Sesuai Mood Kamu",
  description: "Aplikasi untuk menemukan lagu viral dan populer berdasarkan mood kamu. Analisis sentimen otomatis untuk rekomendasi musik yang tepat.",
  keywords: ["music", "mood", "lagu", "viral", "sentiment analysis", "YouTube", "musik"],
  authors: [{ name: "Mood Music App" }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <head>
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gray-50`}
      >
        <ErrorBoundary>
          <EnvironmentValidator>
            {children}
          </EnvironmentValidator>
        </ErrorBoundary>
      </body>
    </html>
  );
}
