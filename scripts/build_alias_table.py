# -*- coding: utf-8 -*-
"""
정규화 테이블 통합/확장.
기준(canonical) 이름 집합: data/processed/정사/인물별/*.json 의 인물명 전체
  (帝紀·先主傳 등 needs_review에 남아 인물 파일이 없는 군주급 인물은 이 목록에
   없으므로, 아래 CURATED에서 별도로 canonical 항목으로 추가한다.)
여기에 주요 인물의 자(字)·별칭을 수작업으로 보강한다 (2단계-A/B 공용 테이블).
"""
import json
import glob
from pathlib import Path

ROOT = Path(r"d:\samgukji-analytics")
JEONGSA_PERSON_DIR = ROOT / "data" / "processed" / "정사" / "인물별"
OUT_PATH = ROOT / "data" / "processed" / "인물명_정규화.json"

# canonical -> 추가 별칭 목록 (canonical 자신은 자동 포함되므로 별도 기입 불요)
CURATED = {
    # 三國志에 帝紀/先主傳/吳主傳으로만 존재하고 2단계-A 인물 파일이 없는 군주급 인물
    "劉備": ["玄德", "劉玄德", "使君", "先主"],
    "曹操": ["孟德", "曹孟德", "阿瞞", "曹公", "魏武"],
    "曹丕": ["子桓", "曹子桓", "文帝"],
    "曹叡": ["元仲", "明帝"],
    "曹芳": [],
    "曹髦": ["彥士"],
    "曹奂": ["景明"],
    "孫權": ["仲謀", "孫仲謀", "吳主", "吳侯"],
    "孫策": ["伯符", "孫伯符", "小霸王"],
    "孫堅": ["文台", "孫文台"],
    "司馬懿": ["仲達", "司馬仲達"],
    "夏侯惇": ["元讓"],
    "夏侯淵": ["妙才"],
    "曹仁": ["子孝"],
    "曹洪": ["子廉"],
    "典韋": [],
    "劉禪": ["公嗣", "阿斗", "後主"],
    # 이미 인물 파일이 있는 주요 인물에 자(字)·별칭 보강
    "諸葛亮": ["孔明", "諸葛孔明", "臥龍"],
    "諸葛瑾": ["子瑜"],
    "龐統": ["士元", "鳳雛"],
    "趙雲": ["子龍", "趙子龍"],
    "馬超": ["孟起"],
    "黃忠": ["漢升"],
    "張飛": ["翼德", "益德", "張翼德"],
    "呂布": ["奉先", "呂奉先"],
    "董卓": ["仲穎", "董仲穎"],
    "袁紹": ["本初", "袁本初"],
    "袁術": ["公路", "袁公路"],
    "公孫瓚": ["伯珪"],
    "劉表": ["景升"],
    "劉焉": [],
    "張魯": ["公祺"],
    "張遼": ["文遠"],
    "徐晃": ["公明"],
    "張郃": ["儁乂"],
    "樂進": ["文謙"],
    "于禁": ["文則"],
    "許褚": ["仲康"],
    "荀彧": ["文若"],
    "荀攸": ["公達"],
    "郭嘉": ["奉孝"],
    "程昱": ["仲德"],
    "賈詡": ["文和"],
    "周瑜": ["公瑾", "周公瑾"],
    "魯肅": ["子敬"],
    "呂蒙": ["子明"],
    "陸遜": ["伯言"],
    "太史慈": ["子義"],
    "甘寧": ["興霸"],
    "黃蓋": ["公覆"],
    "程普": ["德謀"],
    "張昭": ["子布"],
    "顧雍": ["元歎"],
    "魏延": ["文長"],
    "姜維": ["伯約"],
    "法正": ["孝直"],
    "馬良": ["季常"],
    "馬謖": [],
    "關羽": ["雲長", "關雲長", "關公", "美髯公"],
    "陶謙": ["恭祖", "陶恭祖"],
    "何進": ["何國舅"],
    "丁原": ["建陽"],
    "李肅": [],
    "張角": [],
    "張寶": [],
    "張梁": [],
    "盧植": ["子幹"],
    "皇甫嵩": [],
    "朱儁": ["朱雋"],
    "張讓": [],
    "劉協": ["陳留王", "獻帝"],
    "劉辯": ["少帝"],
    "何太后": [],
    "董太后": [],
}


def main():
    canonical_names = set()
    for f in sorted(glob.glob(str(JEONGSA_PERSON_DIR / "*.json"))):
        d = json.loads(Path(f).read_text(encoding="utf-8"))
        canonical_names.add(d["인물명"])

    table = {name: [name] for name in canonical_names}

    for canon, aliases in CURATED.items():
        entry = table.setdefault(canon, [canon])
        for a in aliases:
            if a and a not in entry:
                entry.append(a)
        if canon not in entry:
            entry.insert(0, canon)

    OUT_PATH.write_text(json.dumps(table, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"canonical 인물 수: {len(table)}")
    print(f"저장: {OUT_PATH.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
