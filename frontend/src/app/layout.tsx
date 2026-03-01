import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenClaw Trend Digest — AI News Curator",
  description:
    "Morning briefing 3 menit yang dikurasi oleh AI. Hemat waktu, kurangi noise, fokus pada yang penting.",
  keywords: ["AI", "news", "digest", "tech", "curator", "morning briefing"],
  openGraph: {
    title: "OpenClaw Trend Digest",
    description: "AI-Powered Tech & News Curator — Your Personal Editor-in-Chief",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
