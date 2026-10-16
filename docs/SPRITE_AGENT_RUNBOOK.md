# 적벽대전 스프라이트 에이전트 실행 안내

## 결론

- VS Code 채팅창이 보이지 않아도 Windows 터미널이나 VS Code 통합 터미널에서 실행할 수 있다.
- 이 PC에서는 PowerShell 실행 정책 때문에 `codex`보다 `codex.cmd`를 사용한다.
- 현재 프로젝트는 Git 저장소가 아니므로 비대화형 실행에는 `--skip-git-repo-check`가 필요하다.
- 같은 파일을 동시에 수정하지 않도록 기본 동시 실행 수는 1이다. 캐릭터 한 명을 완료한 뒤 다음 캐릭터로 넘어간다.

## 1. CMD에서 새 대화형 세션 시작 — 권장

명령 프롬프트(`cmd.exe`)에서 다음 명령을 실행한다.

```bat
chcp 65001
cd /d D:\samgukji-analytics
codex.cmd --no-alt-screen -C "D:\samgukji-analytics" "AGENTS.md와 prompts/red-cliff-sprite-agent.md를 읽고, 대기열의 첫 캐릭터 한 명만 완성해줘. 이미지 도구를 쓸 수 없으면 대체 이미지를 만들지 말고 중단 사유를 보고해줘."
```

`--no-alt-screen`은 실행 내용을 일반 터미널 화면에 남기므로 대화 UI 문제를 피하고 기록을 확인하기 쉽다.

## 2. 기존 세션 이어가기

가장 최근 세션을 이어간다.

```bat
cd /d D:\samgukji-analytics
codex.cmd resume --last -C "D:\samgukji-analytics" --no-alt-screen
```

다른 세션을 선택하려면 다음 명령을 사용한다.

```bat
codex.cmd resume --all --no-alt-screen
```

세션 목록만 살펴보려면 다음 명령을 사용한다.

```bat
codex.cmd agents -C "D:\samgukji-analytics" --no-alt-screen
```

## 3. 비대화형으로 캐릭터 한 명 제작

아래 명령은 제작 지시 파일을 입력으로 넘기고, 마지막 보고서를 JSON으로 저장한다.

```bat
chcp 65001
cd /d D:\samgukji-analytics
if not exist outputs mkdir outputs
type prompts\red-cliff-sprite-agent.md | codex.cmd exec -C "D:\samgukji-analytics" ^
  --skip-git-repo-check ^
  -s workspace-write ^
  --output-schema "config\sprite-agent\report.schema.json" ^
  -o "outputs\sprite-agent-last.json" -
```

첫 실행은 대화형 세션을 권장한다. 생성 이미지의 스타일과 프레임 분리가 안정된 것을 확인한 다음 비대화형 반복 실행으로 옮긴다.

## 4. 에이전트가 읽는 파일

1. `AGENTS.md` — 저장소 공통 규칙
2. `docs/PIXEL_CHARACTER_AGENT.md` — 디자인, 모션, 속도, QA 규격
3. `docs/RED_CLIFF_CHARACTER_BIBLE.md` — 세력·역할·인물별 디자인 원칙
4. `config/sprite-agent/red-cliff-character-bible.json` — 63명 기계 판독용 디자인 명세
5. `prompts/red-cliff-sprite-agent.md` — 한 번의 실행에서 수행할 작업
6. `config/sprite-agent/red-cliff-roster.json` — 캐릭터 대기열과 상태
7. `config/sprite-agent/report.schema.json` — 완료 보고 형식

## 5. 운영 방식

1. 대기열의 `queued` 캐릭터 한 명을 선택한다.
2. 기본 이미지와 대기·공격·피격·패배·승리 스트립을 만든다.
3. 투명 배경, 프레임 수, 잘림, 잔상, 정체성 일치를 검사한다.
4. 미리보기 화면과 매니페스트를 갱신한다.
5. 검사에 통과한 경우에만 캐릭터 상태를 `complete`로 바꾼다.

캐릭터별 병렬 제작이 꼭 필요하면 각 실행에 서로 다른 출력 폴더를 배정하고, 마지막에 통합 전용 에이전트 하나만 매니페스트와 대기열을 수정하게 한다. 현재는 화풍 흔들림과 파일 충돌을 줄이기 위해 순차 제작으로 고정한다.
