import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'삼국지 데이터 원정대 | 이야기로 시작하는 첫 데이터 탐험',description:'삼국지를 몰라도 괜찮아요. 이야기에서 이름을 찾아 표로 만들고, 숫자와 그래프로 답을 찾아보세요.'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ko"><body>{children}</body></html>}
