from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, Index
from backend.app.core.database import Base

class AQIReading(Base):
    __tablename__ = "aqi_readings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    station_id = Column(String(64), index=True, nullable=False)
    station_name = Column(String(128), nullable=False)
    locality = Column(String(128), nullable=True)
    district = Column(String(64), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    recorded_time_str = Column(String(64), nullable=True)
    
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    aqi = Column(Integer, nullable=False)
    category = Column(String(32), nullable=False)
    
    pm25 = Column(Float, nullable=True)
    pm10 = Column(Float, nullable=True)
    no2 = Column(Float, nullable=True)
    co = Column(Float, nullable=True)
    o3 = Column(Float, nullable=True)
    so2 = Column(Float, nullable=True)
    
    dominant_pollutant = Column(String(16), nullable=True)
    source = Column(String(128), nullable=False)
    is_live = Column(Boolean, default=True)
    is_calculated = Column(Boolean, default=False)

    __table_args__ = (
        Index("idx_station_time", "station_id", "timestamp"),
    )

class TrafficReading(Base):
    __tablename__ = "traffic_readings"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    road_id = Column(String(64), index=True, nullable=False)
    road_name = Column(String(128), nullable=False)
    corridor = Column(String(128), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    
    current_speed = Column(Float, nullable=False)
    free_flow_speed = Column(Float, nullable=False)
    congestion_ratio = Column(Float, nullable=False) # current / free-flow
    congestion_level = Column(String(32), nullable=False) # Low, Moderate, High, Severe
    
    travel_time_min = Column(Float, nullable=True)
    normal_time_min = Column(Float, nullable=True)
    active_incidents_count = Column(Integer, default=0)
    
    source = Column(String(128), nullable=False)
    is_live = Column(Boolean, default=True)

    __table_args__ = (
        Index("idx_road_time", "road_id", "timestamp"),
    )

class IncidentRecord(Base):
    __tablename__ = "incident_records"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    external_id = Column(String(64), index=True, nullable=True)
    road_name = Column(String(128), nullable=False)
    locality = Column(String(128), nullable=True)
    incident_type = Column(String(64), nullable=False)
    severity = Column(String(32), nullable=False)
    description = Column(Text, nullable=True)
    
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    reported_at = Column(String(64), nullable=True)
    estimated_clearance = Column(String(128), nullable=True)
    source = Column(String(128), nullable=False)
    is_live = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
