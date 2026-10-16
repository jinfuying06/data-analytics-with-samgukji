# -*- coding: utf-8 -*-
"""일회성 조사 스크립트: 65권 전체의 헤더 영역에서 listed_persons 소스 패턴을 파악한다."""
import sys
sys.path.insert(0, r"d:\samgukji-analytics\scripts")
import json
import time
from pathlib import Path
import enrich_listed_persons as e
from bs4 import BeautifulSoup

ROOT = Path(r"d:\samgukji-analytics")
JEONGSA_DIR = ROOT / "data" / "raw" / "wikisource" / "정사"

files = sorted(p for p in JEONGSA_DIR.glob("*.json") if not p.name.startswith("_"))

results = []
for i, p in enumerate(files):
    data = json.loads(p.read_text(encoding="utf-8"))
    url = data["url"]
    html = e.fetch(url)
    soup = BeautifulSoup(html, "lxml")
    header = soup.find("div", id="headerContainer")
    has_sister = False
    has_infobox = False
    infobox_text = None
    if header:
        for dd in header.find_all("dd"):
            if dd.get_text(strip=True).startswith("参阅"):
                has_sister = True
                break
        for p_tag in header.find_all("p"):
            bs = p_tag.find_all("b")
            if len(bs) == 1 and not p_tag.find("a", class_="extiw"):
                has_infobox = True
                infobox_text = bs[0].get_text(" ", strip=True)
                break
    results.append({
        "title": data["title"],
        "has_sister": has_sister,
        "has_infobox": has_infobox,
        "infobox_text": infobox_text,
    })
    print(f"[{i+1}/65] {data['title']}: sister={has_sister} infobox={has_infobox} {infobox_text or ''}")
    if i < len(files) - 1:
        time.sleep(1.5)

out_path = ROOT / "data" / "raw" / "_probe_headerbox_results.json"
out_path.write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
print("\nsaved to", out_path)

both = [r for r in results if r["has_sister"] and r["has_infobox"]]
neither = [r for r in results if not r["has_sister"] and not r["has_infobox"]]
print(f"\nboth: {len(both)}")
for r in both:
    print(" ", r["title"])
print(f"neither: {len(neither)}")
for r in neither:
    print(" ", r["title"])
