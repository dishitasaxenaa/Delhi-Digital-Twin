"""PostgreSQL-only persistence. No fallback database is permitted."""
import logging
from contextlib import contextmanager
from typing import Generator
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

def get_connection():
    if not settings.DATABASE_URL.startswith(("postgresql://", "postgresql+psycopg2://")):
        raise RuntimeError("DATABASE_URL must point to PostgreSQL; SQLite is not supported.")
    import psycopg2
    from psycopg2.extras import RealDictCursor
    return psycopg2.connect(settings.DATABASE_URL.replace("postgresql+psycopg2://", "postgresql://"), cursor_factory=RealDictCursor)

class Cursor:
    def __init__(self, raw): self.raw = raw
    def execute(self, sql, params=None): return self.raw.execute(sql.replace("?", "%s"), params)
    def fetchone(self): return self.raw.fetchone()
    def fetchall(self): return self.raw.fetchall()
    def __iter__(self): return iter(self.raw)

@contextmanager
def get_db_cursor() -> Generator[Cursor, None, None]:
    conn = get_connection()
    cursor = Cursor(conn.cursor())
    try:
        yield cursor
        conn.commit()
    except Exception:
        conn.rollback()
        logger.exception("Database transaction failed")
        raise
    finally:
        cursor.raw.close()
        conn.close()

def init_db():
    """Create PostgreSQL tables for telemetry and What-If history (no extensions)."""
    with get_db_cursor() as cur:
        cur.execute("""CREATE TABLE IF NOT EXISTS aqi_readings (
          id BIGSERIAL PRIMARY KEY, station_id TEXT NOT NULL, station_name TEXT NOT NULL,
          locality TEXT, district TEXT, timestamp TIMESTAMPTZ NOT NULL, longitude DOUBLE PRECISION NOT NULL,
          latitude DOUBLE PRECISION NOT NULL, aqi INTEGER NOT NULL, category TEXT NOT NULL,
          pm25 DOUBLE PRECISION, pm10 DOUBLE PRECISION, no2 DOUBLE PRECISION, co DOUBLE PRECISION,
          o3 DOUBLE PRECISION, so2 DOUBLE PRECISION, dominant_pollutant TEXT, source TEXT NOT NULL,
          is_live BOOLEAN DEFAULT TRUE, is_calculated BOOLEAN DEFAULT FALSE)""")
        cur.execute("""CREATE TABLE IF NOT EXISTS traffic_readings (
          id BIGSERIAL PRIMARY KEY, road_id TEXT NOT NULL, road_name TEXT NOT NULL, corridor TEXT,
          timestamp TIMESTAMPTZ NOT NULL, current_speed DOUBLE PRECISION NOT NULL, free_flow_speed DOUBLE PRECISION NOT NULL,
          congestion_ratio DOUBLE PRECISION NOT NULL, congestion_level TEXT NOT NULL, flow_vehicles_per_hour DOUBLE PRECISION,
          travel_time_min DOUBLE PRECISION,
          normal_time_min DOUBLE PRECISION, active_incidents_count INTEGER DEFAULT 0, source TEXT NOT NULL, is_live BOOLEAN DEFAULT TRUE)""")
        cur.execute("""CREATE TABLE IF NOT EXISTS incident_records (
          id BIGSERIAL PRIMARY KEY, external_id TEXT, road_name TEXT NOT NULL, locality TEXT, incident_type TEXT NOT NULL,
          severity TEXT NOT NULL, description TEXT, longitude DOUBLE PRECISION NOT NULL, latitude DOUBLE PRECISION NOT NULL,
          reported_at TEXT, estimated_clearance TEXT, source TEXT NOT NULL, is_live BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL)""")
        cur.execute("ALTER TABLE traffic_readings ADD COLUMN IF NOT EXISTS flow_vehicles_per_hour DOUBLE PRECISION")
        cur.execute("""CREATE TABLE IF NOT EXISTS what_if_history (
          id BIGSERIAL PRIMARY KEY, question TEXT NOT NULL, result_json JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())""")
        for statement in (
          "CREATE INDEX IF NOT EXISTS idx_aqi_station_time ON aqi_readings(station_id,timestamp DESC)",
          "CREATE INDEX IF NOT EXISTS idx_traffic_road_time ON traffic_readings(road_id,timestamp DESC)",
          "CREATE INDEX IF NOT EXISTS idx_what_if_time ON what_if_history(created_at DESC)",
        ): cur.execute(statement)
    logger.info("PostgreSQL schema initialized")
