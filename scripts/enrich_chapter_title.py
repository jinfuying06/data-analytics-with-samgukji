# -*- coding: utf-8 -*-
"""
2단계 보강: 연의(三國演義) 기존 크롤링 파일에 chapter_title 필드 추가.
body_text는 이미 있으므로 재수집하지 않고, 원본 URL을 다시 열어
페이지 상단 ws-header 표의 회차 제목(예: 陶恭祖三讓徐州　曹孟德大戰呂布)만 추출해 보강한다.
"""
import json
import sys
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
YEONUI_DIR = ROOT / "data" / "raw" / "wikisource" / "연의"

USER_AGENT = "personal-research-bot/0.1 (contact: jinfuying06@gmail.com)"
REQUEST_DELAY_SEC = 1.5
MAX_RETRIES = 3
TIMEOUT_SEC = 30


def fetch(url: str) -> str:
    last_err = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=TIMEOUT_SEC)
            resp.raise_for_status()
            resp.encoding = "utf-8"
            return resp.text
        except requests.RequestException as e:
            last_err = e
            if attempt < MAX_RETRIES:
                time.sleep(REQUEST_DELAY_SEC)
    raise RuntimeError(f"failed after {MAX_RETRIES} attempts: {last_err}")


def extract_chapter_title(html: str) -> str | None:
    soup = BeautifulSoup(html, "lxml")
    table = soup.find("table", class_="ws-header")
    if table is None:
        return None
    trs = table.find_all("tr")
    if len(trs) < 2:
        return None
    tds = trs[1].find_all("td")
    if len(tds) < 2:
        return None
    b = tds[1].find("b")
    if b is None:
        return None
    return b.get_text(strip=True)


def main():
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else None

    files = sorted(
        (p for p in YEONUI_DIR.glob("*.json") if not p.name.startswith("_")),
        key=lambda p: p.name,
    )
    targets = []
    for p in files:
        data = json.loads(p.read_text(encoding="utf-8"))
        if "chapter_title" not in data:
            targets.append(p)

    print(f"chapter_title 없는 파일: {len(targets)} / 전체 {len(files)}")
    if limit:
        targets = targets[:limit]
        print(f"이번 실행 대상(테스트): {len(targets)}건")

    failures = []
    for i, p in enumerate(targets):
        data = json.loads(p.read_text(encoding="utf-8"))
        url = data["url"]
        print(f"[{p.name}] {data.get('title')} 보강 중... ({url})")
        try:
            html = fetch(url)
            title = extract_chapter_title(html)
        except Exception as e:
            print(f"  실패: {e}")
            failures.append({"file": p.name, "url": url, "error": str(e)})
            time.sleep(REQUEST_DELAY_SEC)
            continue

        if title is None:
            print("  경고: chapter_title을 찾지 못함")
            failures.append({"file": p.name, "url": url, "error": "chapter_title not found"})
            time.sleep(REQUEST_DELAY_SEC)
            continue

        data["chapter_title"] = title
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"  chapter_title = {title}")

        if i < len(targets) - 1:
            time.sleep(REQUEST_DELAY_SEC)

    print(f"\n완료: 성공 {len(targets) - len(failures)} / 실패 {len(failures)}")
    if failures:
        fail_path = YEONUI_DIR / "_enrich_failures.json"
        fail_path.write_text(json.dumps(failures, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"실패 목록 저장: {fail_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
