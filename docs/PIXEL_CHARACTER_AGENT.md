# 적벽대전 픽셀 캐릭터 제작 에이전트 명세

## 1. 목표

적벽대전에 등장하는 인물을 동일한 8비트 게임 규격으로 제작한다. 각 캐릭터는 정지 이미지 1장과 다섯 가지 4프레임 애니메이션을 갖는다.

```text
base.png
idle.gif
attack.gif
hit.gif
defeat.gif
victory.gif
```

사용자가 제공한 예시 이미지를 픽셀 밀도·체형·귀여움의 첫 번째 품질 기준으로 사용한다. 기존 주유·조조 시제품은 규격 참고용으로만 보존한다.

- 기준 폴더: `frontend/public/sprites/red-cliff/zhou-yu/`
- 브라우저 확인: `http://localhost:3000/sprites`
- 제작 큐: `config/sprite-agent/red-cliff-roster.json`

## 2. 에이전트 구성

한 캐릭터를 여러 에이전트가 동시에 수정하지 않는다. 하나의 실행 안에서 아래 역할을 순차적으로 수행하는 방식을 기본으로 한다.

| 역할 | 책임 | 산출물 |
| --- | --- | --- |
| 코디네이터 | 로스터에서 대상 1명을 선택하고 기존 파일을 조사 | 캐릭터 작업 명세 |
| 아트 디렉터 | 실루엣·색·무기·표정 규칙 결정 | 디자인 앵커 프롬프트 |
| 스프라이트 제작자 | 기본 이미지와 모션별 4프레임 스트립 생성 | PNG 스트립 |
| 모션 가공자 | 프레임 분리, 공통 캔버스 배치, GIF 변환 | 상태별 GIF |
| QA 검사자 | 알파·잘림·혼입·속도·브라우저 표시 검사 | 검사 결과 |
| 통합 담당 | manifest와 미리보기, 로스터 상태 갱신 | 프로젝트 반영 |

에이전트 하네스는 탐색과 판단에는 자유로운 계획을 사용하되, 산출물과 검수는 이 문서의 고정 규격을 따르는 혼합형 구조로 운영한다.

## 3. 캐릭터 디자인 규칙

인물별 세부 디자인은 `docs/RED_CLIFF_CHARACTER_BIBLE.md`와 `config/sprite-agent/red-cliff-character-bible.json`을 단일 기준으로 사용한다.

- 예시 이미지의 분위기와 크기감만 참고하고 얼굴·의상·배치를 복제하지 않는다.
- 체형은 머리가 전체 키의 42~48%인 짧고 귀여운 SD형 전신 캐릭터로 통일한다.
- 몸체는 48×64 안팎의 논리 픽셀 격자에서 설계하고 최근접 보간으로만 확대한다. 피부를 포함해 8~16색, 재질별 최대 3단계 명암을 사용한다.
- 얼굴, 체형, 카메라 각도, 오른쪽을 보는 방향은 모든 프레임에서 유지한다.
- 인물 구분은 다음 순서로 만든다.
  1. 머리 장식과 머리 모양
  2. 세력별 주조색
  3. 갑옷 또는 도포의 실루엣
  4. 대표 무기나 도구
  5. 망토·수염·장식 같은 보조 특징
- 과도한 서양 판타지 갑옷, 현대 물건, 로고, 문자, 워터마크는 넣지 않는다.
- 주유와 다른 인물의 의상·무기·색상이 겹치지 않도록 한다.

세력 기본색:

- 위: 진홍·적색·검정, 금색 포인트
- 촉: 녹색·갈색·청록색, 황동 포인트
- 오: 남청·청색·청록색, 금색 포인트

## 4. 모션 규격

| 상태 | 4프레임 구성 | FPS |
| --- | --- | ---: |
| idle | 호흡 1 → 호흡 2 → 망토/장식 변화 → 복귀 | 2.25 |
| attack | 준비 → 공격 → 후속 동작 → 복귀 | 5.0625 |
| hit | 충격 → 찡그림 → 밀림 → 회복 | 3.375 |
| defeat | 비틀거림 → 무릎 → 좌절 → 주저앉음 | 3 |
| victory | 놀람 → 무기 들기 → 미소 → 환호 | 2.8125 |

공통 규격:

- 프레임 수: 정확히 4
- 캔버스: 420 × 250 px
- 배경: 실제 투명 알파
- 기준 방향: 화면 오른쪽
- 캐릭터 기준선: 프레임 간 동일
- CSS 표시: `image-rendering: pixelated`

## 5. 이미지 생성 프롬프트 규칙

### 기본 이미지

```text
Use case: stylized-concept
Asset type: production-ready 2D game character anchor
Primary request: create one original 8-bit pixel-art full-body character for {NAME_KO}, a {ROLE} in the Battle of Red Cliffs.
Input images: the Zhou Yu base image is a scale and rendering reference only; do not copy his face, costume, plume, cape, or weapon.
Subject design: {SILHOUETTE}. Outfit: {OUTFIT}. Weapon or tool: {WEAPON}. Distinguishing features: {DISTINGUISHING_FEATURES}.
Style/medium: cute early-console 8-bit pixel art built on a roughly 48x64 logical-pixel body grid, chunky hard square pixels, 42-48% head ratio, short limbs, 8-16 colors total, at most three tones per material.
Composition: full body centered, facing screen-right, generous transparent padding, all equipment visible.
Background: genuinely transparent alpha.
Constraints: one character only; original design; no text, labels, grid, border, logo, or watermark; no clipping; consistent anatomy.
Avoid: polished high-resolution pixel illustration, fine armor engraving, long flowing fabric, gradients, sub-pixel detail, copied character design, checkerboard painted into the image, white or black matte, blur, antialiasing, extra limbs, extra weapons.
```

### 모션 스트립

```text
Use case: identity-preserve
Asset type: clean 2D game animation strip
Input images: Image 1 is the approved base character anchor.
Primary request: create only the {MOTION} animation as one horizontal strip of exactly four isolated frames: {FRAME_1}, {FRAME_2}, {FRAME_3}, {FRAME_4}.
Subject: preserve the exact face, hair, proportions, outfit, palette, equipment, and personality from Image 1.
Style/medium: preserve the exact crisp pixel-art rendering and limited palette from Image 1.
Composition: one row by four frames; wide transparent gutters between frames; same scale, baseline, camera angle, and screen-right direction; each body, weapon, and effect must remain completely inside its own frame area.
Background: genuinely transparent alpha.
Constraints: exactly four frames; no neighboring-frame fragments; no clipping; no text, labels, border, grid, or watermark.
Avoid: identity drift, checkerboard pixels, duplicated body parts, detached weapon fragments, variable zoom, blur, antialiasing.
```

이미지 생성 결과가 체크무늬 배경을 실제로 그린 경우 한 번은 배경 추출 편집을 시도한다. 그래도 실제 알파가 아니면 해당 산출물을 승인하지 않는다.

## 6. 제작 절차

1. 로스터에서 `queued` 캐릭터 한 명을 선택한다.
2. 한국어 이름, 세력, 역할, 대표 무기, 색상, 실루엣을 확정한다.
3. 사용자 예시 이미지의 저해상도 체형을 참고해 캐릭터 기본 이미지를 만든다. 기존 주유·조조 PNG는 외형 기준으로 사용하지 않는다.
4. 기본 이미지의 실제 알파와 전신 잘림 여부를 검사한다.
5. 기본 이미지를 정체성 기준으로 `idle`, `attack`, `hit`, `defeat`, `victory` 스트립을 각각 별도로 생성한다.
6. 동일 폭 분할을 가정하지 않는다. 프레임 사이의 실제 투명 구간을 찾아 각 프레임의 경계를 정한다.
7. 무기와 효과를 포함해 각 프레임을 420 × 250 투명 캔버스 중앙에 배치한다.
8. 규정 FPS로 GIF를 만든다.
9. 20개 프레임을 한 장의 검수 이미지로 조합해 육안 검사한다.
10. 모든 GIF의 모든 프레임에 대해 모서리 알파값이 0인지 검사한다.
11. 프레임 경계에 불투명 픽셀이 닿거나 다른 포즈 조각이 보이면 실패 처리하고 경계를 수정한다.
12. `manifest.json`과 미리보기 화면을 갱신한다.
13. 브라우저에서 실제 애니메이션을 확인한 뒤 로스터를 `complete`로 변경한다.

## 7. 파일 계약

```text
frontend/public/sprites/red-cliff/{character-id}/
├─ {character-id}-base.png
├─ {character-id}-idle.gif
├─ {character-id}-attack.gif
├─ {character-id}-hit.gif
├─ {character-id}-defeat.gif
├─ {character-id}-victory.gif
├─ {character-id}-{motion}-strip-v1.png
└─ manifest.json
```

중간 프레임과 검수 이미지는 `tmp/`에 두고 제품 코드에서 참조하지 않는다.

## 8. QA 통과 조건

- [ ] 기본 PNG와 GIF 5개가 모두 존재한다.
- [ ] GIF마다 정확히 4프레임이다.
- [ ] 모든 GIF가 420 × 250이다.
- [ ] 모든 프레임의 네 모서리 알파값이 0이다.
- [ ] 캐릭터·무기·효과가 캔버스 경계에서 잘리지 않는다.
- [ ] 다른 프레임의 얼굴·무기·망토·효과 조각이 섞이지 않는다.
- [ ] 캐릭터의 얼굴, 의상, 색, 무기가 모든 모션에서 일치한다.
- [ ] 기준선과 크기가 심하게 흔들리지 않는다.
- [ ] 규정 FPS가 manifest와 일치한다.
- [ ] `/sprites`에서 깨진 이미지 없이 재생된다.

## 9. 실패 복구

| 실패 | 원인 힌트 | 안전한 재시도 | 중단 조건 |
| --- | --- | --- | --- |
| 체크무늬가 보임 | 가짜 투명 배경 | 배경 추출을 한 번 시도하고 알파 재검사 | 두 번째 결과도 불투명 |
| 다른 포즈 조각 혼입 | 동일 폭 기계 분할 | 실제 투명 간격으로 개별 경계 재설정 | 프레임 자체가 겹쳐 분리 불가 |
| 무기나 머리가 잘림 | 여백 부족 | 모션 스트립을 넓은 여백으로 재생성 | 원본에도 이미 잘려 있음 |
| 모션마다 얼굴이 다름 | 정체성 기준 약함 | 승인된 base 이미지만 참조해 해당 모션 재생성 | 두 번 재생성해도 불일치 |
| 이미지 도구 없음 | 실행 환경 기능 부족 | 산출물 없이 상태만 보고 | 플레이스홀더 생성 금지 |

## 10. 병렬 실행 원칙

- 같은 캐릭터를 여러 에이전트가 동시에 작업하지 않는다.
- 같은 `roster.json`, 미리보기 페이지, 공용 README를 여러 프로세스가 동시에 수정하지 않는다.
- 우선 한 캐릭터씩 순차 실행한다.
- 병렬화가 필요하면 캐릭터별 작업 폴더를 완전히 분리하고, 통합 담당 에이전트 한 개만 공용 파일을 수정한다.
