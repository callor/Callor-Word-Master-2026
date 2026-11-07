import type { Metadata } from "next";
import "./globals.css";

const title = "Callor Word Master | 영문·한글 타자와 단어 암기";
const description = "떨어지는 영단어와 한글 뜻을 완성하는 2단계 타이핑 게임. 영문·한글 타자연습과 회화 단어 학습을 함께 즐겨보세요.";
const siteUrl = new URL(process.env.SITE_URL || "https://word.callor.com");
const shareImage = {
  url: "/images/word-master-og.png",
  width: 1536,
  height: 1024,
  alt: "Callor Word Master — 손끝에서 터지는 단어의 재미",
};

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title,
  description,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Callor Word Master",
    title,
    description,
    url: siteUrl,
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [shareImage],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
