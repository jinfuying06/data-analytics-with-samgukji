import Image from "next/image";

const characters = [
  {
    id: "zhou-yu",
    name: "주유",
    faction: "吳",
    states: [
      { id: "base", title: "기본 자세", file: "zhou-yu-base.png", note: "카드·도감에서 사용하는 정지 이미지" },
      { id: "idle", title: "대기", file: "zhou-yu-idle.gif", note: "2.25 FPS · 호흡과 망토의 작은 움직임" },
      { id: "attack", title: "무기 휘두르기", file: "zhou-yu-attack.gif", note: "5.06 FPS · 준비, 베기, 후속 동작, 복귀" },
      { id: "hit", title: "피격", file: "zhou-yu-hit.gif", note: "3.38 FPS · 충격, 찡그림, 밀림, 회복" },
      { id: "defeat", title: "패배", file: "zhou-yu-defeat.gif", note: "3 FPS · 비틀거림, 무릎, 좌절" },
      { id: "victory", title: "승리", file: "zhou-yu-victory.gif", note: "2.81 FPS · 미소와 검을 든 환호" },
    ],
  },
  {
    id: "cao-cao",
    name: "조조",
    faction: "魏",
    states: [
      { id: "base", title: "기본 자세", file: "cao-cao-base.png", note: "카드·도감에서 사용하는 정지 이미지" },
      { id: "idle", title: "대기", file: "cao-cao-idle.gif", note: "2.25 FPS · 망토와 호흡의 작은 움직임" },
      { id: "attack", title: "무기 휘두르기", file: "cao-cao-attack.gif", note: "5.06 FPS · 준비, 베기, 후속 동작, 복귀" },
      { id: "hit", title: "피격", file: "cao-cao-hit.gif", note: "3.38 FPS · 충격, 밀림, 회복" },
      { id: "defeat", title: "패배", file: "cao-cao-defeat.gif", note: "3 FPS · 무릎을 꿇고 검을 내림" },
      { id: "victory", title: "승리", file: "cao-cao-victory.gif", note: "2.81 FPS · 지휘검을 들어 올리는 승리" },
    ],
  },
];

export default function SpritesPage() {
  return (
    <div className="sprite-lab-page">
      <header className="sprite-lab-header">
        <div>
          <div className="eyebrow">PIXEL UNIT / RED CLIFF 001</div>
          <h1 className="page-title">적벽대전 픽셀 캐릭터</h1>
          <p className="page-subtitle">모든 모션은 같은 크기와 방향을 사용합니다.</p>
        </div>
        <div className="sprite-lab-badge">赤壁</div>
      </header>

      <section className="sprite-preview-grid">
        {characters.flatMap((character) => character.states.map((state) => (
          <article className="sprite-preview-card" key={`${character.id}-${state.id}`}>
            <div className="sprite-preview-stage">
              <Image
                alt={`${character.name} ${state.title} 픽셀 캐릭터`}
                className="sprite-preview-image"
                height={250}
                src={`/sprites/red-cliff/${character.id}/${state.file}?v=1`}
                unoptimized
                width={420}
              />
            </div>
            <div className="sprite-preview-copy">
              <span>{character.name} · {character.faction} · {state.id.toUpperCase()}</span>
              <h2>{state.title}</h2>
              <p>{state.note}</p>
            </div>
          </article>
        )))}
      </section>
    </div>
  );
}
