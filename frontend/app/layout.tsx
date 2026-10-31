import type { Metadata } from 'next';
import './globals.css';
import './theme.css';
export const metadata:Metadata={title:'계책록 — 삼국지로 배우는 데이터 분석',description:'삼국지연의의 기록으로 인물 구성과 역할을 분석하고, 조건을 바꾸어 가정 실험 결과를 비교합니다.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
