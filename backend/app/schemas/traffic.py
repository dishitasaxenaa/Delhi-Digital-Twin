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
    travelTimeMin: float
    normalTimeMin: float
    lengthKm: float
    activeIncidentsCount: int
    flowVehiclesPerHour: int
    congestionRatio: float
    source: str
    isLive: bool = True

class TrafficResponseSchema(BaseModel):
    roads: List[RoadSegmentSchema]
    incidents: List[TrafficIncidentSchema]
    totalRoads: int
    averageSpeedKmH: float
    averageCongestionPercent: float
    highCongestionRoadsCount: int
    lastUpdated: str
    source: str
    status: str # "LIVE", "CACHED", "API_KEY_REQUIRED", "API_ERROR"
    errorMessage: Optional[str] = None
