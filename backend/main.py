import json

from fastapi import FastAPI, HTTPException

from .db import get_connection

app = FastAPI(title="삼국지 인물 데이터 API")


RED_CLIFF_CHAPTERS = range(43, 51)

RED_CLIFF_KOREAN_TITLES = {
    43: "제갈량이 여러 유학자와 논쟁하고, 노숙이 여러 논의를 물리치다",
    44: "공명이 계책으로 주유를 격분시키고, 손권이 조조와 싸우기로 결단하다",
    45: "삼강구에서 조조가 군사를 잃고, 군영회에서 장간이 계략에 빠지다",
    46: "공명이 지혜로 화살을 빌리고, 황개가 고육계를 쓰다",
    47: "감택이 거짓 항복서를 바치고, 방통이 연환계를 가르치다",
    48: "장강 연회에서 조조가 시를 읊고, 북군이 전선을 묶다",
    49: "칠성단에서 제갈량이 바람을 빌고, 주유가 불을 놓다",
    50: "제갈량이 화용도를 헤아리고, 관우가 의리로 조조를 놓아주다",
}


@app.get("/api/persons")
def list_persons(q: str = "", country: str | None = None):
    conn = get_connection()
    jeongsa = {
        row["name"]: row["country"]
        for row in conn.execute("SELECT name, country FROM jeongsa_persons")
    }
    yeonui_names = {
        row["name"] for row in conn.execute("SELECT DISTINCT name FROM yeonui_mentions")
    }
    conn.close()

    all_names = sorted(set(jeongsa) | yeonui_names)
    result = []
    for name in all_names:
        if q and q not in name:
            continue
        person_country = jeongsa.get(name)
        if country and person_country != country:
            continue
        result.append({
            "name": name,
            "country": person_country,
            "has_jeongsa": name in jeongsa,
            "has_yeonui": name in yeonui_names,
        })
    return result


@app.get("/api/storylines/red-cliff")
def get_red_cliff_storyline():
    """Return the first playable storyline: Romance chapters 43-50."""
    conn = get_connection()
    rows = conn.execute(
        "SELECT name, chapter, chapter_title, excerpt "
        "FROM yeonui_mentions WHERE chapter BETWEEN ? AND ? "
        "ORDER BY chapter, name",
        (min(RED_CLIFF_CHAPTERS), max(RED_CLIFF_CHAPTERS)),
    ).fetchall()
    conn.close()

    by_chapter = {}
    person_counts = {}
    for row in rows:
        chapter = by_chapter.setdefault(
            row["chapter"],
            {
                "chapter": row["chapter"],
                "chapter_title": row["chapter_title"],
                "chapter_title_ko": RED_CLIFF_KOREAN_TITLES.get(row["chapter"], "회차 기록"),
                "persons": [],
            },
        )
        excerpt_count = len(json.loads(row["excerpt"]))
        chapter["persons"].append({
            "name": row["name"],
            "excerpt_count": excerpt_count,
        })
        person_counts[row["name"]] = person_counts.get(row["name"], 0) + 1

    for chapter in by_chapter.values():
        chapter["person_count"] = len(chapter["persons"])
        chapter["persons"].sort(
            key=lambda person: (-person["excerpt_count"], person["name"])
        )

    featured = [
        {"name": name, "chapter_count": count}
        for name, count in sorted(
            person_counts.items(), key=lambda item: (-item[1], item[0])
        )[:12]
    ]

    return {
        "id": "red-cliff",
        "title": "적벽대전",
        "subtitle": "삼국지연의 제43회–제50회",
        "description": "동오와 유비 연합이 조조의 남하를 맞아 장강에서 결전을 준비하는 8회차 원정.",
        "chapter_start": min(RED_CLIFF_CHAPTERS),
        "chapter_end": max(RED_CLIFF_CHAPTERS),
        "chapter_count": len(by_chapter),
        "person_count": len(person_counts),
        "chapters": list(by_chapter.values()),
        "featured_persons": featured,
    }


@app.get("/api/persons/{name}")
def get_person(name: str):
    conn = get_connection()
    jrow = conn.execute(
        "SELECT * FROM jeongsa_persons WHERE name = ?", (name,)
    ).fetchone()
    yrows = conn.execute(
        "SELECT * FROM yeonui_mentions WHERE name = ? ORDER BY chapter", (name,)
    ).fetchall()
    conn.close()

    if jrow is None and not yrows:
        raise HTTPException(status_code=404, detail="인물을 찾을 수 없음")

    jeongsa = None
    if jrow is not None:
        jeongsa = {
            "source_juan": jrow["source_juan"],
            "country": jrow["country"],
            "biography": jrow["biography"],
            "source_url": jrow["source_url"],
            "is_minor_biography": bool(jrow["is_minor_biography"]),
            "mentioned_relatives": json.loads(jrow["mentioned_relatives"]),
        }

    yeonui = [
        {
            "chapter": r["chapter"],
            "chapter_title": r["chapter_title"],
            "excerpt": json.loads(r["excerpt"]),
            "tagging_method": r["tagging_method"],
            "source_url": r["source_url"],
        }
        for r in yrows
    ]

    return {"name": name, "jeongsa": jeongsa, "yeonui": yeonui}


@app.get("/api/network")
def get_network(min_count: int = 5):
    conn = get_connection()
    edges = conn.execute(
        "SELECT person_a, person_b, count FROM cooccurrence_edges WHERE count >= ?",
        (min_count,),
    ).fetchall()
    appearances = {
        row["name"]: row["chapters"]
        for row in conn.execute(
            "SELECT name, COUNT(DISTINCT chapter) AS chapters "
            "FROM yeonui_mentions GROUP BY name"
        )
    }
    conn.close()

    node_names = set()
    links = []
    for e in edges:
        node_names.add(e["person_a"])
        node_names.add(e["person_b"])
        links.append({
            "source": e["person_a"],
            "target": e["person_b"],
            "value": e["count"],
        })
    nodes = [{"id": n, "count": appearances.get(n, 0)} for n in node_names]

    return {"nodes": nodes, "links": links}


@app.get('/api/analytics/appearances')
def get_appearances(chapter_start: int = 43, chapter_end: int = 50, limit: int = 63):
    if not 43 <= chapter_start <= chapter_end <= 50 or not 1 <= limit <= 63:
        raise HTTPException(status_code=422, detail='회차는 43~50, 시작 ≤ 종료, limit는 1~63이어야 합니다.')
    conn = get_connection()
    results = [dict(r) for r in conn.execute(
        'SELECT name, COUNT(DISTINCT chapter) AS chapter_count FROM yeonui_mentions '
        'WHERE chapter BETWEEN ? AND ? GROUP BY name ORDER BY chapter_count DESC, name LIMIT ?',
        (chapter_start, chapter_end, limit))]
    records = [dict(r) for r in conn.execute(
        'SELECT * FROM yeonui_mentions WHERE chapter BETWEEN ? AND ? ORDER BY chapter, name',
        (chapter_start, chapter_end))]
    conn.close()
    for record in records:
        record['excerpt'] = json.loads(record['excerpt'])
    return {'results': results, 'rows': records, 'chapter_start': chapter_start,
            'chapter_end': chapter_end, 'source': 'data/seed/red_cliff.db',
            'metric': 'COUNT(DISTINCT chapter)'}
