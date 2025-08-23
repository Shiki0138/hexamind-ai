import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HexaMind AI - Six Executive Minds, One Powerful Decision",
  description: "6人の専門AIエージェント（CEO・CFO・CMO・CTO・COO・悪魔の代弁者）による革新的ビジネス意思決定プラットフォーム",
  keywords: ["AI", "ビジネス分析", "意思決定", "戦略", "議論", "Claude", "ChatGPT", "Gemini", "Executive", "HexaMind"],
  authors: [{ name: "HexaMind AI Team" }],
  openGraph: {
    title: "HexaMind AI - Six Executive Minds, One Powerful Decision",
    description: "6人の専門AIエージェント（CEO・CFO・CMO・CTO・COO・悪魔の代弁者）による革新的ビジネス意思決定プラットフォーム",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
