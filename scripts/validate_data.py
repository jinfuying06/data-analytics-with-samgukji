# -*- coding: utf-8 -*-
"""Validate the current 삼국지 source and processed datasets.

This script is intentionally read-only. It produces a machine-readable report
so later agents (or a human reviewer) can work from the same evidence.
"""

from __future__ import annotations

import argparse
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
RAW_ROOT = ROOT / "data" / "raw" / "wikisource"
PROCESSED_ROOT = ROOT / "data" / "processed"
REPORT_DIR = ROOT / "outputs"


def read_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8")), None
    except Exception as exc:  # report the file and continue validating others
        return None, f"{type(exc).__name__}: {exc}"


def valid_http_url(value: object) -> bool:
    if not isinstance(value, str):
        return False
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def validate_raw(work_dir: Path) -> dict:
    files = sorted(work_dir.glob("*.json"))
    result = {
        "directory": str(work_dir.relative_to(ROOT)),
        "files": len(files),
        "invalid_json": [],
        "missing_fields": Counter(),
        "empty_body": [],
        "invalid_url": [],
        "duplicate_num": [],
        "chapter_title_missing": [],
        "listed_persons_missing": [],
    }
    nums = {}
    for path in files:
        data, error = read_json(path)
        if error:
            result["invalid_json"].append({"file": path.name, "error": error})
            continue
        for field in ["work_title", "num", "title", "url", "body_text"]:
            if field not in data:
                result["missing_fields"][field] += 1
        if not data.get("body_text", "").strip():
            result["empty_body"].append(path.name)
        if not valid_http_url(data.get("url")):
            result["invalid_url"].append(path.name)
        num = data.get("num")
        if num in nums:
            result["duplicate_num"].append({"num": num, "files": [nums[num], path.name]})
        else:
            nums[num] = path.name
        if work_dir.name == "연의" and not data.get("chapter_title", "").strip():
            result["chapter_title_missing"].append(path.name)
        if work_dir.name == "정사" and "listed_persons" not in data:
            result["listed_persons_missing"].append(path.name)
    result["missing_fields"] = dict(result["missing_fields"])
    return result


def validate_processed_dir(directory: Path, required_fields: list[str]) -> dict:
    files = sorted(directory.glob("*.json")) if directory.exists() else []
    result = {
        "directory": str(directory.relative_to(ROOT)),
        "files": len(files),
        "invalid_json": [],
        "missing_fields": Counter(),
        "invalid_url": [],
        "empty_text": [],
        "duplicate_names": [],
    }
    seen_keys = {}
    for path in files:
        data, error = read_json(path)
        if error:
            result["invalid_json"].append({"file": path.name, "error": error})
            continue
        for field in required_fields:
            if field not in data:
                result["missing_fields"][field] += 1
        if "source_url" in data and not valid_http_url(data["source_url"]):
            result["invalid_url"].append(path.name)
        text_candidates = [data.get("body_text"), data.get("전기_텍스트")]
        if any(value is not None for value in text_candidates) and not any(
            isinstance(value, str) and value.strip() for value in text_candidates
        ):
            result["empty_text"].append(path.name)
        name = data.get("인물명") or data.get("person")
        unit = data.get("회차") or data.get("원소속_편(권)")
        key = (name, unit)
        if name:
            if key in seen_keys:
                result["duplicate_names"].append({"name": name, "unit": unit, "files": [seen_keys[key], path.name]})
            else:
                seen_keys[key] = path.name
    result["missing_fields"] = dict(result["missing_fields"])
    return result


def validate_needs_review(path: Path) -> dict:
    data, error = read_json(path)
    if error:
        return {"file": str(path.relative_to(ROOT)), "invalid_json": error}
    entries = data if isinstance(data, list) else []
    reason_counts = Counter()
    for entry in entries:
        for reason in entry.get("reasons", []):
            reason_counts[reason] += 1
    return {
        "file": str(path.relative_to(ROOT)),
        "entries": len(entries),
        "reason_counts": dict(reason_counts),
        "entries_without_reason": sum(not item.get("reasons") for item in entries),
    }


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=REPORT_DIR / "quality_report.json")
    args = parser.parse_args()

    raw_dirs = [p for p in RAW_ROOT.iterdir() if p.is_dir()] if RAW_ROOT.exists() else []
    raw_reports = [validate_raw(path) for path in sorted(raw_dirs)]

    processed_reports = []
    for path, fields in [
        (PROCESSED_ROOT / "정사" / "인물별", ["인물명", "원소속_편(권)", "본문_세그먼트", "출처_url"]),
        (PROCESSED_ROOT / "연의" / "인물별_언급", ["인물명", "회차", "등장_구간_텍스트", "출처_url"]),
    ]:
        processed_reports.append(validate_processed_dir(path, fields))

    report = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "project_root": str(ROOT),
        "raw": raw_reports,
        "processed": processed_reports,
        "needs_review": validate_needs_review(PROCESSED_ROOT / "needs_review.json"),
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"quality report: {args.output.relative_to(ROOT)}")
    for item in raw_reports + processed_reports:
        print(f"{item['directory']}: {item['files']} files")
    print(f"needs_review: {report['needs_review'].get('entries', 0)} entries")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
