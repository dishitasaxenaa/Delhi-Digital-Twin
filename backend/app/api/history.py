from fastapi import APIRouter, Query
from typing import List, Dict, Any
from datetime import datetime, timezone, timedelta
from backend.app.core.database import get_db_cursor

router = APIRouter(prefix="/api/history", tags=["Historical Telemetry"])

@router.get("/aqi")
def get_aqi_history(
    hours: int = Query(24, ge=1, le=168, description="Hours of historical data to retrieve"),
    station_id: str = Query(None, description="Optional filter by station ID"),
):
    """
    Returns stored historical AQI readings from database.
    """
    since_iso = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
    with get_db_cursor() as cur:
        if station_id:
            cur.execute(
                "SELECT * FROM aqi_readings WHERE timestamp >= ? AND station_id = ? ORDER BY timestamp DESC LIMIT 500",
                (since_iso, station_id)
            )
        else:
            cur.execute(
                "SELECT * FROM aqi_readings WHERE timestamp >= ? ORDER BY timestamp DESC LIMIT 500",
                (since_iso,)
            )
        rows = cur.fetchall()

    return [
        {
            "id": r["id"],
            "stationId": r["station_id"],
            "stationName": r["station_name"],
            "timestamp": r["timestamp"],
            "aqi": r["aqi"],
            "category": r["category"],
            "pm25": r["pm25"],
            "pm10": r["pm10"],
            "no2": r["no2"],
            "source": r["source"],
            "isLive": bool(r["is_live"]),
        }
        for r in rows
    ]

@router.get("/traffic")
def get_traffic_history(
    hours: int = Query(24, ge=1, le=168, description="Hours of historical data to retrieve"),
    road_id: str = Query(None, description="Optional filter by road ID"),
):
    """
    Returns stored historical traffic readings from database.
    """
    since_iso = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
    with get_db_cursor() as cur:
        if road_id:
            cur.execute(
                "SELECT * FROM traffic_readings WHERE timestamp >= ? AND road_id = ? ORDER BY timestamp DESC LIMIT 500",
                (since_iso, road_id)
            )
        else:
            cur.execute(
                "SELECT * FROM traffic_readings WHERE timestamp >= ? ORDER BY timestamp DESC LIMIT 500",
                (since_iso,)
            )
        rows = cur.fetchall()

    return [
        {
            "id": r["id"],
            "roadId": r["road_id"],
            "roadName": r["road_name"],
            "timestamp": r["timestamp"],
            "currentSpeed": r["current_speed"],
            "freeFlowSpeed": r["free_flow_speed"],
            "congestionRatio": r["congestion_ratio"],
            "congestionLevel": r["congestion_level"],
            "travelTimeMin": r["travel_time_min"],
            "source": r["source"],
            "isLive": bool(r["is_live"]),
        }
        for r in rows
    ]
