/** The current review prototype is shared with the static and standalone builds. */
export default function LearningPrototype({ view = 'home' }: { view?: 'home' | 's1' | 's6' }) {
  return (
    <iframe
      title="계책록 — 삼국지로 배우는 데이터 분석"
      src={`/learning/index.html#${view}`}
      style={{ position: 'fixed', inset: 0, width: '100%', height: '100dvh', border: 0, background: '#10151b' }}
    />
  );
}
