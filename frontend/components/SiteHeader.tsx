import Link from 'next/link';

const links = [
  { href: '/', label: '학습실', key: 'home' },
  { href: '/network', label: '관계망', key: 'network' },
] as const;

export default function SiteHeader({ current }: { current?: (typeof links)[number]['key'] }) {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-brand">
          <span className="site-logo" aria-hidden="true" />
          <span>
            <b>삼국지로 배우는 데이터 분석</b>
            <small>적벽대전 편</small>
          </span>
        </Link>
        <nav className="site-nav" aria-label="주요 메뉴">
          {links.map((l) => (
            <Link key={l.key} href={l.href} aria-current={current === l.key ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
