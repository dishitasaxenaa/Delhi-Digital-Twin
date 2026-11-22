"""One-time, repeatable import of Stage 1/2 telemetry into PostgreSQL.

The SQLite source is opened read-only and is never changed or removed. Run after
PostgreSQL is provisioned and the backend schema has been initialized.
"""
import argparse
import hashlib
import sqlite3
from pathlib import Path

TABLES = ("aqi_readings", "traffic_readings", "incident_records")
BOOLEAN_COLUMNS = {"is_live", "is_calculated"}

def migrate(source: Path, database_url: str):
    from psycopg2 import connect
    

    source_key = hashlib.sha256(source.read_bytes()).hexdigest()
    source_uri = source.resolve().as_uri() + "?mode=ro"
    sqlite_conn = sqlite3.connect(source_uri, uri=True)
    sqlite_conn.row_factory = sqlite3.Row
    pg = connect(database_url)
    totals = {}
    try:
        with pg.cursor() as cursor:
            cursor.execute("SELECT to_regclass('public.aqi_readings')")
            if cursor.fetchone()[0] is None:
                raise RuntimeError("PostgreSQL schema is missing. Start the backend once to initialize it first.")
            cursor.execute("""CREATE TABLE IF NOT EXISTS legacy_migration_ledger (
                source_key TEXT NOT NULL, table_name TEXT NOT NULL, source_id BIGINT NOT NULL,
                imported_id BIGINT NOT NULL, PRIMARY KEY(source_key,table_name,source_id))""")
            for table in TABLES:
                exists = sqlite_conn.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?", (table,)).fetchone()
                if not exists:
                    totals[table] = 0
                    continue
                source_columns = [c[1] for c in sqlite_conn.execute(f"PRAGMA table_info({table})")]
                cursor.execute("SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name=%s", (table,))
                target_columns = {row[0] for row in cursor.fetchall()}
                columns = [c for c in source_columns if c in target_columns and c != "id"]
                if "id" not in source_columns or not columns:
                    raise RuntimeError(f"Cannot safely map the source schema for {table}.")
                rows = sqlite_conn.execute(f"SELECT * FROM {table}").fetchall()
                if not rows:
                    totals[table] = 0
                    continue
                quoted = ",".join('"' + c.replace('"', '""') + '"' for c in columns)
                placeholders = ",".join(["%s"] * len(columns))
                sql = f"INSERT INTO {table} ({quoted}) VALUES ({placeholders}) RETURNING id"
                id_index = source_columns.index("id")
                copied = 0
                for row in rows:
                    source_id = int(row[id_index])
                    cursor.execute("SELECT 1 FROM legacy_migration_ledger WHERE source_key=%s AND table_name=%s AND source_id=%s", (source_key, table, source_id))
                    if cursor.fetchone(): continue
                    converted = []
                    for column in columns:
                        value = row[source_columns.index(column)]
                        if column in BOOLEAN_COLUMNS and value is not None:
                            value = bool(value)
                        converted.append(value)
                    cursor.execute(sql, tuple(converted))
                    imported_id = cursor.fetchone()[0]
                    cursor.execute("INSERT INTO legacy_migration_ledger(source_key,table_name,source_id,imported_id) VALUES(%s,%s,%s,%s)", (source_key, table, source_id, imported_id))
                    copied += 1
                totals[table] = copied
        pg.commit()
    except Exception:
        pg.rollback()
        raise
    finally:
        sqlite_conn.close()
        pg.close()
    return totals

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=Path("delhi_digital_twin.db"))
    parser.add_argument("--database-url", help="PostgreSQL DSN; defaults to DATABASE_URL")
    args = parser.parse_args()
    if not args.source.is_file():
        raise SystemExit(f"SQLite source not found: {args.source}")
    from backend.app.core.config import settings
    dsn = args.database_url or settings.DATABASE_URL
    if not dsn.startswith("postgresql"):
        raise SystemExit("Migration target must be PostgreSQL.")
    print(migrate(args.source, dsn))
