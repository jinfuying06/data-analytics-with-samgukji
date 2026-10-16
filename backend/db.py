import os
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = Path(
    os.environ.get("SAMGUKJI_DB_PATH", ROOT / "data" / "seed" / "red_cliff.db")
)
if not DB_PATH.is_absolute():
    DB_PATH = ROOT / DB_PATH


def get_connection() -> sqlite3.Connection:
    if not DB_PATH.is_file():
        raise FileNotFoundError(
            f"Database not found: {DB_PATH}. "
            "Run `python scripts/build_red_cliff_seed.py` first."
        )
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
