import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any
from backend.app.core.database import get_db_cursor

logger = logging.getLogger(__name__)

class HistoryService:
    @staticmethod
    def record_aqi_stations(stations_data: List[Dict[str, Any]]) -> int:
        """Stores AQI readings in database, avoiding duplicates within a 15-minute window."""
        saved_count = 0
        try:
            now_iso = datetime.now(timezone.utc).isoformat()
            threshold_iso = (datetime.now(timezone.utc) - timedelta(minutes=14)).isoformat()

            with get_db_cursor() as cur:
                for st in stations_data:
                    station_id = st.get("id")
                    # Check for recent record
                    cur.execute(
                        "SELECT id FROM aqi_readings WHERE station_id = ? AND timestamp >= ? LIMIT 1",
                        (station_id, threshold_iso)
                    )
                    if cur.fetchone() is None:
                        coords = st.get("coordinates", [0.0, 0.0])
                        cur.execute("""
                        INSERT INTO aqi_readings (
                            station_id, station_name, locality, district, timestamp,
                            longitude, latitude, aqi, category, pm25, pm10, no2, co, o3, so2,
                            dominant_pollutant, source, is_live, is_calculated
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            station_id,
                            st.get("name", "Unknown"),
                            st.get("locality", ""),
                            st.get("district", ""),
                            now_iso,
                            coords[0],
                            coords[1],
                            st.get("aqi", 0),
                            st.get("category", "Moderate"),
                            st.get("pm25"),
                            st.get("pm10"),
                            st.get("no2"),
                            st.get("co"),
                            st.get("o3"),
                            st.get("so2"),
                            st.get("dominantPollutant", "PM2.5"),
                            st.get("source", "Real API"),
                            bool(st.get("isLive", True)),
                            bool(st.get("isCalculated", False)),
                        ))
                        saved_count += 1
            if saved_count > 0:
                logger.info(f"Persisted {saved_count} new AQI station readings.")
        except Exception as e:
            logger.error(f"Failed to record AQI readings: {e}")
        return saved_count

    @staticmethod
    def record_traffic_roads(roads_data: List[Dict[str, Any]]) -> int:
        """Stores Traffic readings in database, avoiding duplicates within a 2-minute window."""
        saved_count = 0
        try:
            now_iso = datetime.now(timezone.utc).isoformat()
            threshold_iso = (datetime.now(timezone.utc) - timedelta(minutes=2)).isoformat()

            with get_db_cursor() as cur:
                for rd in roads_data:
                    road_id = rd.get("id")
                    cur.execute(
                        "SELECT id FROM traffic_readings WHERE road_id = ? AND timestamp >= ? LIMIT 1",
                        (road_id, threshold_iso)
                    )
                    if cur.fetchone() is None:
                        cur.execute("""
                        INSERT INTO traffic_readings (
                            road_id, road_name, corridor, timestamp, current_speed,
                            free_flow_speed, congestion_ratio, congestion_level, flow_vehicles_per_hour,
                            travel_time_min, normal_time_min, active_incidents_count,
                            source, is_live
                        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            road_id,
                            rd.get("name", "Unknown Road"),
                            rd.get("corridor", ""),
                            now_iso,
                            rd.get("avgSpeedKmH", 0.0),
                            rd.get("freeFlowSpeedKmH", 60.0),
                            rd.get("congestionRatio", 1.0),
                            rd.get("congestionLevel", "Moderate"),
                            rd.get("flowVehiclesPerHour"),
                            rd.get("travelTimeMin", 0.0),
                            rd.get("normalTimeMin", 0.0),
                            rd.get("activeIncidentsCount", 0),
                            rd.get("source", "Traffic API"),
                            bool(rd.get("isLive", True)),
                        ))
                        saved_count += 1
            if saved_count > 0:
                logger.info(f"Persisted {saved_count} new traffic road readings.")
        except Exception as e:
            logger.error(f"Failed to record traffic readings: {e}")
        return saved_count

    @staticmethod
    def get_hourly_historical_trends(hours: int = 24) -> List[Dict[str, Any]]:
        """
        Retrieves real stored historical trends from the database aggregated by hour.
        Returns empty list if insufficient history exists (< 2 hours).
        """
        trends: List[Dict[str, Any]] = []
        try:
            since_iso = (datetime.now(timezone.utc) - timedelta(hours=hours)).isoformat()
            with get_db_cursor() as cur:
                # Group AQI by hour
                cur.execute("""
                SELECT 
                    to_char(date_trunc('hour', timestamp), 'HH24:00') as hr,
                    AVG(aqi) as avg_aqi,
                    AVG(pm25) as avg_pm25
                FROM aqi_readings
                WHERE timestamp >= ?
                GROUP BY date_trunc('hour', timestamp)
                ORDER BY date_trunc('hour', timestamp) ASC
                """, (since_iso,))
                aqi_rows = cur.fetchall()

                # Group Traffic by hour
                cur.execute("""
                SELECT 
                    to_char(date_trunc('hour', timestamp), 'HH24:00') as hr,
                    AVG(current_speed) as avg_speed,
                    AVG(congestion_ratio) as avg_ratio
                FROM traffic_readings
                WHERE timestamp >= ?
                GROUP BY date_trunc('hour', timestamp)
                ORDER BY date_trunc('hour', timestamp) ASC
                """, (since_iso,))
                traffic_rows = cur.fetchall()

                # If insufficient data (< 2 distinct hours), return empty
                distinct_hours = set([r['hr'] for r in aqi_rows] + [r['hr'] for r in traffic_rows])
                if len(distinct_hours) < 2:
                    return []

                aqi_by_hr = {r['hr']: (round(r['avg_aqi']), round(r['avg_pm25'] or 0.0, 1)) for r in aqi_rows}
                traffic_by_hr = {r['hr']: (round(r['avg_speed'], 1), r['avg_ratio']) for r in traffic_rows}

                for hr in sorted(distinct_hours):
                    aqi_val, pm25_val = aqi_by_hr.get(hr, (0, 0.0))
                    speed_val, ratio_val = traffic_by_hr.get(hr, (0.0, 1.0))
                    cong_pct = max(0, min(100, round((1.0 - ratio_val) * 100)))

                    trends.append({
                        "time": hr,
                        "aqi": aqi_val,
                        "congestion": cong_pct,
                        "speed": speed_val,
                        "pm25": pm25_val,
                        "isHistorical": True,
                    })
        except Exception as e:
            logger.error(f"Error fetching historical trends: {e}")
        return trends
