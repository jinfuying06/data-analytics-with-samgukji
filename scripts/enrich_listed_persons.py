# -*- coding: utf-8 -*-
"""
2단계 보강: 정사(三國志) 기존 크롤링 파일에 listed_persons 필드 추가/갱신.
body_text는 이미 있으므로 재수집하지 않고, 원본 URL을 다시 열어 인물 목록만 추출한다.

listed_persons 소스는 卷마다 둘 중 하나(또는 없음):
  (a) "자매 프로젝트" 위키백과 링크 목록: <dd>参阅<a>维基百科</a>中的：<a>인물1</a>、<a>인물2</a>...</dd>
      (예: 卷01 -> 曹操, 卷36 -> 關羽/張飛/马超/黄忠/赵云). 친족 표기 없음.
  (b) 본문 최상단의 인물 목록 인포박스: 첫 <p>가 단일 <b> 태그로만 이루어진 경우.
      이름을 공백/、 로 나열하고, 친족은 <sub>관계:이름[、이름...] [관계:이름...]</sub> 형태로 붙는다.
      (예: 卷52 -> 張昭<sub>侄:奮 子:承、休</sub> 顧雍<sub>子:邵 孫:譚、承</sub> 諸葛瑾 歩騭)
둘 다 없는 卷도 있다 (예: 卷06, 卷30). 이 경우 listed_persons = [].
"""
import json
import re
import sys
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
JEONGSA_DIR = ROOT / "data" / "raw" / "wikisource" / "정사"

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


def _extract_from_sister_links(soup: BeautifulSoup) -> list:
    for dd in soup.find_all("dd"):
        if not dd.get_text(strip=True).startswith("参阅"):
            continue
        links = dd.find_all("a", class_="extiw")
        return [
            {"name": a.get_text(strip=True), "relatives": []}
            for a in links[1:]
            if a.get_text(strip=True)
        ]
    return []


def _parse_relatives(rel_text: str) -> list:
    relatives = []
    for group in re.split(r"\s+", rel_text.strip()):
        if not group or (":" not in group and "：" not in group):
            continue
        relation, names_part = re.split(r"[:：]", group, maxsplit=1)
        for name in re.split(r"[、,，]", names_part):
            name = name.strip()
            if name:
                relatives.append({"relation": relation.strip(), "name": name})
    return relatives


def _parse_infobox(b_tag) -> list:
    persons = []
    current = None
    for child in b_tag.children:
        if isinstance(child, str):
            names = [n for n in re.split(r"[\s　、]+", child.strip()) if n]
            for n in names:
                current = {"name": n, "relatives": []}
                persons.append(current)
        elif child.name == "sub" and current is not None:
            current["relatives"] = _parse_relatives(child.get_text())
    return persons


def _extract_from_infobox(soup: BeautifulSoup) -> list:
    content = soup.find("div", id="mw-content-text") or soup
    parser_output = content.find("div", class_="mw-parser-output") or content
    p = parser_output.find("p")
    if p is None:
        return []
    children = [c for c in p.children if not (isinstance(c, str) and not c.strip())]
    if len(children) == 1 and getattr(children[0], "name", None) == "b" and not children[0].find("a"):
        return _parse_infobox(children[0])
    return []


def extract_listed_persons(html: str) -> list:
    soup = BeautifulSoup(html, "lxml")
    persons = _extract_from_sister_links(soup)
    if persons:
        return persons
    return _extract_from_infobox(soup)


def main():
    force = "--force" in sys.argv
    args = [a for a in sys.argv[1:] if a != "--force"]
    limit = int(args[0]) if args else None

    files = sorted(
        (p for p in JEONGSA_DIR.glob("*.json") if not p.name.startswith("_")),
        key=lambda p: p.name,
    )
    targets = files if force else [
        p for p in files
        if "listed_persons" not in json.loads(p.read_text(encoding="utf-8"))
    ]

    print(f"대상 파일: {len(targets)} / 전체 {len(files)} (force={force})")
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
            persons = extract_listed_persons(html)
        except Exception as e:
            print(f"  실패: {e}")
            failures.append({"file": p.name, "url": url, "error": str(e)})
            time.sleep(REQUEST_DELAY_SEC)
            continue

        data["listed_persons"] = persons
        p.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"  listed_persons = {persons}")

        if i < len(targets) - 1:
            time.sleep(REQUEST_DELAY_SEC)

    print(f"\n완료: 성공 {len(targets) - len(failures)} / 실패 {len(failures)}")
    if failures:
        fail_path = JEONGSA_DIR / "_enrich_failures.json"
        fail_path.write_text(json.dumps(failures, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"실패 목록 저장: {fail_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
