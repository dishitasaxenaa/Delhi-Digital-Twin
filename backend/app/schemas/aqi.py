from pydantic import BaseModel, Field
from typing import List, Optional

class AQIStationSchema(BaseModel):
    id: str
    name: str
    locality: str
    district: str
    coordinates: List[float] # [lng, lat]
    aqi: int
    category: str # Good, Satisfactory, Moderate, Poor, Very Poor, Severe
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    no2: Optional[float] = None
    co: Optional[float] = None
    o3: Optional[float] = None
    so2: Optional[float] = None
    dominantPollutant: str
    timestamp: str
    source: str
    isLive: bool = True
    isCalculated: bool = False

class AQIResponseSchema(BaseModel):
    stations: List[AQIStationSchema]
    totalStations: int
    reportingStations: int
    overallAQI: int
    overallCategory: str
    lastUpdated: str
    source: str
    status: str # "LIVE", "CACHED", "API_ERROR", "UNCONFIGURED"
    errorMessage: Optional[str] = None
