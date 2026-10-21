import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'삼국지 데이터 원정대 | 적벽 데이터 랩',description:'이야기를 읽고, 데이터를 탐험하고, 역사의 가정을 실험하세요.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
