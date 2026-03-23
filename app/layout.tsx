import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 콘텐츠 팩토리",
  description: "AI로 유튜브 대본을 자동 생성하는 앱",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
