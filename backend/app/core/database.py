import logging
import sqlite3
import os
from contextlib import contextmanager
from typing import Generator
from backend.app.core.config import settings

logger = logging.getLogger(__name__)

DB_PATH = "delhi_digital_twin.db"

def get_connection():
    """Returns database connection. Supports SQLite by default or PostgreSQL if configured."""
    if settings.DATABASE_URL.startswith("postgresql"):
        try:
            import psycopg2
            return psycopg2.connect(settings.DATABASE_URL)
        except Exception as e:
            logger.warning(f"PostgreSQL connection failed ({e}). Falling back to local SQLite ({DB_PATH}).")
    
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

@contextmanager
def get_db_cursor() -> Generator[sqlite3.Cursor, None, None]:
    conn = get_connection()
    cursor = conn.cursor()
    try:
        yield cursor
        conn.commit()
    except Exception as e:
        conn.rollback()
        logger.error(f"Database error: {e}")
        raise
    finally:
        cursor.close()
        conn.close()

def init_db():
    """Initializes tables and indexes for historical telemetry storage."""
    with get_db_cursor() as cur:
        # AQI Readings table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS aqi_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            station_id TEXT NOT NULL,
            station_name TEXT NOT NULL,
            locality TEXT,
            district TEXT,
            timestamp TEXT NOT NULL,
            longitude REAL NOT NULL,
            latitude REAL NOT NULL,
            aqi INTEGER NOT NULL,
            category TEXT NOT NULL,
            pm25 REAL,
            pm10 REAL,
            no2 REAL,
            co REAL,
            o3 REAL,
            so2 REAL,
            dominant_pollutant TEXT,
            source TEXT NOT NULL,
            is_live INTEGER DEFAULT 1,
            is_calculated INTEGER DEFAULT 0
        )
        """)

        # Traffic Readings table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS traffic_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            road_id TEXT NOT NULL,
            road_name TEXT NOT NULL,
            corridor TEXT,
            timestamp TEXT NOT NULL,
            current_speed REAL NOT NULL,
            free_flow_speed REAL NOT NULL,
            congestion_ratio REAL NOT NULL,
            congestion_level TEXT NOT NULL,
            travel_time_min REAL,
            normal_time_min REAL,
            active_incidents_count INTEGER DEFAULT 0,
            source TEXT NOT NULL,
            is_live INTEGER DEFAULT 1
        )
        """)

        # Incident Records table
        cur.execute("""
        CREATE TABLE IF NOT EXISTS incident_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            external_id TEXT,
            road_name TEXT NOT NULL,
            locality TEXT,
            incident_type TEXT NOT NULL,
            severity TEXT NOT NULL,
            description TEXT,
            longitude REAL NOT NULL,
            latitude REAL NOT NULL,
            reported_at TEXT,
            estimated_clearance TEXT,
            source TEXT NOT NULL,
            is_live INTEGER DEFAULT 1,
            created_at TEXT NOT NULL
        )
        """)

        # Indexes for fast historical queries
        cur.execute("CREATE INDEX IF NOT EXISTS idx_aqi_station_time ON aqi_readings (station_id, timestamp)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_traffic_road_time ON traffic_readings (road_id, timestamp)")

    logger.info("Database initialized successfully with historical tables.")
