import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "삼국지 데이터 원정대",
  description: "적벽대전으로 배우는 데이터 분석과 역사 What-if 실험",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko">
      <body>
        <nav className="nav">
          <Link className="brand" href="/">
            <span className="brand-mark">火</span>
            <span><b>삼국지 데이터 원정대</b><small>RED CLIFF DATA LAB</small></span>
          </Link>
          <Link className="nav-link" href="/">적벽 이야기</Link>
          <Link className="nav-link nav-primary" href="/simulation">What-if 실험</Link>
          <Link className="nav-link" href="/learn">데이터 학습</Link>
          <Link className="nav-link" href="/network">인물 관계</Link>
        </nav>
        <main className="main">{children}</main>
      </body>
    </html>
  );
}
