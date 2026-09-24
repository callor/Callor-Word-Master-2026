import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Callor Word Master | 영문·한글 타자와 단어 암기",
  description: "떨어지는 영단어와 한글 뜻을 타이핑하며 회화 어휘를 익히는 반응형 학습 게임",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
