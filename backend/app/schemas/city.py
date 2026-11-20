from pydantic import BaseModel
from typing import List, Optional

class HourlyTrendSchema(BaseModel):
    time: str
    aqi: int
    congestion: int
    speed: float
    pm25: float
    isHistorical: bool = False

class CitySummarySchema(BaseModel):
    overallAQI: int
    overallAQICategory: str
    avgCongestionPercent: float
    avgSpeedKmH: float
    highPollutionZonesCount: int
    highCongestionRoadsCount: int
    activeIncidentsCount: int
    reportingStationsCount: int
    totalStationsCount: int
    lastUpdated: str
    calculationMethod: str
    sourceSummary: str
    aqiStatus: str # "LIVE", "CACHED", "ERROR"
    trafficStatus: str # "LIVE", "CACHED", "API_KEY_REQUIRED", "ERROR"
    trends: List[HourlyTrendSchema]
    hasSufficientHistory: bool = False
