# -*- coding: utf-8 -*-
"""
2단계: 위키문헌 본문 텍스트 크롤링
data/raw/wikisource_index.json (1단계 산출물)의 URL 목록을 순회하며
卷/回 단위 원문 본문을 수집해 data/raw/wikisource/{정사|연의}/{편명}.json 으로 저장한다.
"""
import json
import re
import sys
import time
from pathlib import Path
from urllib.parse import quote

import requests
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
INDEX_PATH = ROOT / "data" / "raw" / "wikisource_index.json"
OUT_ROOT = ROOT / "data" / "raw" / "wikisource"

USER_AGENT = "personal-research-bot/0.1 (contact: jinfuying06@gmail.com)"
REQUEST_DELAY_SEC = 1.5
MAX_RETRIES = 3
TIMEOUT_SEC = 30

WORK_DIR_NAME = {"정사": "정사", "연의": "연의"}


def fetch(url: str) -> str:
    last_err = None
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = requests.get(
                url,
                headers={"User-Agent": USER_AGENT},
                timeout=TIMEOUT_SEC,
            )
            resp.raise_for_status()
            resp.encoding = "utf-8"
            return resp.text
        except requests.RequestException as e:
            last_err = e
            if attempt < MAX_RETRIES:
                time.sleep(REQUEST_DELAY_SEC)
    raise RuntimeError(f"failed after {MAX_RETRIES} attempts: {last_err}")


def extract_body_text(html: str) -> str:
    soup = BeautifulSoup(html, "lxml")
    content = soup.find("div", {"id": "mw-content-text"})
    if content is None:
        raise ValueError("mw-content-text not found")

    parser_output = content.find("div", {"class": "mw-parser-output"}) or content

    for table in parser_output.find_all("table"):
        table.decompose()
    for tag in parser_output.find_all(["style", "script"]):
        tag.decompose()
    for tag in parser_output.find_all("sup", class_="reference"):
        tag.decompose()
    for tag in parser_output.find_all(
        "div", {"class": ["navbox", "noprint", "printfooter", "catlinks"]}
    ):
        tag.decompose()

    paragraphs = []
    for p in parser_output.find_all("p", recursive=False):
        text = p.get_text(separator="", strip=True)
        if text:
            paragraphs.append(text)

    # 三國志 원문은 <p> 없이 최상위 텍스트 노드로만 구성된 경우가 있어 fallback 처리
    if not paragraphs:
        text = parser_output.get_text(separator="\n", strip=True)
        paragraphs = [line for line in text.split("\n") if line.strip()]

    return "\n".join(paragraphs)


def crawl_unit(work_key: str, meta: dict, page: dict, index: dict) -> dict:
    url = page["url"]
    html = fetch(url)
    body_text = extract_body_text(html)
    return {
        "work_title": meta["work_title"],
        "author": meta.get("author"),
        "unit": meta["unit"],
        "num": page["num"],
        "label": page["label"],
        "title": page["title"],
        "url": url,
        "source": "zh.wikisource.org",
        "crawled_at": index.get("crawled_at"),
        "body_text": body_text,
    }


def main():
    if len(sys.argv) < 3:
        print("usage: crawl_wikisource_text.py <정사|연의> <start_num> <end_num>")
        sys.exit(1)

    work_key = sys.argv[1]
    start_num = int(sys.argv[2])
    end_num = int(sys.argv[3])

    index = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    meta = index[work_key]
    pages = [p for p in meta["pages"] if start_num <= p["num"] <= end_num]

    out_dir = OUT_ROOT / WORK_DIR_NAME[work_key]
    out_dir.mkdir(parents=True, exist_ok=True)

    failures = []
    succeeded = []

    for i, page in enumerate(pages):
        label = page["label"]
        title = page["title"]
        print(f"[{work_key}] {title} ({label}) 수집 중...")
        try:
            result = crawl_unit(work_key, meta, page, index)
        except Exception as e:
            print(f"  실패: {e}")
            failures.append({"title": title, "url": page["url"], "error": str(e)})
            time.sleep(REQUEST_DELAY_SEC)
            continue

        safe_name = f"{page['num']:0{2 if work_key == '정사' else 3}d}"
        out_path = out_dir / f"{safe_name}.json"
        out_path.write_text(
            json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        succeeded.append(title)
        print(f"  저장: {out_path.relative_to(ROOT)} ({len(result['body_text'])}자)")

        if i < len(pages) - 1:
            time.sleep(REQUEST_DELAY_SEC)

    print(f"\n완료: 성공 {len(succeeded)} / 실패 {len(failures)}")
    if failures:
        fail_path = out_dir / "_failures.json"
        fail_path.write_text(
            json.dumps(failures, ensure_ascii=False, indent=2), encoding="utf-8"
        )
        print(f"실패 목록 저장: {fail_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
