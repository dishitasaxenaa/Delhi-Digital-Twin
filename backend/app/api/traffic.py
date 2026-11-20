from fastapi import APIRouter, Query
from typing import List
from backend.app.services.traffic_service import TrafficService
from backend.app.schemas.traffic import TrafficResponseSchema, TrafficIncidentSchema, RoadSegmentSchema

router = APIRouter(prefix="/api/traffic", tags=["Traffic"])

@router.get("", response_model=TrafficResponseSchema)
async def get_traffic_overview(force_refresh: bool = Query(False, description="Bypass cache and force refresh")):
    """
    Fetch live or latest available traffic flow conditions across major Delhi arterial corridors.
    Uses TomTom Traffic Flow API when configured.
    """
    return await TrafficService.get_traffic_data(force_refresh=force_refresh)

@router.get("/roads", response_model=List[RoadSegmentSchema])
async def get_traffic_roads(force_refresh: bool = Query(False, description="Bypass cache and force refresh")):
    """
    Returns actual Delhi road segments with congestion levels, current speed, and free-flow speed.
    """
    data = await TrafficService.get_traffic_data(force_refresh=force_refresh)
    return data.roads

@router.get("/incidents", response_model=List[TrafficIncidentSchema])
async def get_traffic_incidents(force_refresh: bool = Query(False, description="Bypass cache and force refresh")):
    """
    Returns active traffic incident markers across Delhi.
    """
    data = await TrafficService.get_traffic_data(force_refresh=force_refresh)
    return data.incidents
