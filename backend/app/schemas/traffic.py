from pydantic import BaseModel
from typing import List, Optional

class TrafficIncidentSchema(BaseModel):
    id: str
    roadName: str
    locality: str
    type: str # Breakdown, Accident, Construction, Waterlogging, Congestion Spill
    severity: str # Minor, Moderate, Critical
    description: str
    coordinates: List[float] # [lng, lat]
    reportedAt: str
    estimatedClearance: str
    laneImpact: str
    source: str
    isLive: bool = True

class RoadSegmentSchema(BaseModel):
    id: str
    name: str
    corridor: str
    type: str
    coordinates: List[List[float]] # [[lng, lat], ...]
    congestionLevel: str # Low, Moderate, High, Severe
    avgSpeedKmH: float
    freeFlowSpeedKmH: float
    speedLimitKmH: float
    travelTimeMin: Optional[float]
    normalTimeMin: float
    lengthKm: float
    activeIncidentsCount: int
    flowVehiclesPerHour: int
    congestionRatio: float
    source: str
    isLive: bool = True
    sourceTimestamp: Optional[str] = None  # TomTom HTTP Date response timestamp; flow payload has no measurement timestamp.
    trafficGeometry: Optional[List[List[float]]] = None  # TomTom's matched flow segment, [longitude, latitude].

class TrafficResponseSchema(BaseModel):
    roads: List[RoadSegmentSchema]
    incidents: List[TrafficIncidentSchema]
    totalRoads: int
    averageSpeedKmH: float
    averageCongestionPercent: float
    highCongestionRoadsCount: int
    lastUpdated: str
    source: str
    status: str # "LIVE", "PARTIAL", "CACHED", "API_KEY_REQUIRED", "API_ERROR"
    errorMessage: Optional[str] = None
    cacheAgeSeconds: Optional[int] = None
