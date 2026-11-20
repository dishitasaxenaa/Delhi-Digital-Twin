from fastapi import APIRouter, Query
from typing import List
from backend.app.services.aqi_service import AQIService
from backend.app.schemas.aqi import AQIResponseSchema, AQIStationSchema

router = APIRouter(prefix="/api/aqi", tags=["Air Quality"])

@router.get("", response_model=AQIResponseSchema)
async def get_aqi_overview(force_refresh: bool = Query(False, description="Bypass cache and force refresh")):
    """
    Fetch live or latest available air quality telemetry for the NCT of Delhi.
    Computes official CPCB AQI for all 28 monitoring stations.
    """
    return await AQIService.get_aqi_data(force_refresh=force_refresh)

@router.get("/stations", response_model=List[AQIStationSchema])
async def get_aqi_stations(force_refresh: bool = Query(False, description="Bypass cache and force refresh")):
    """
    Returns individual station records with pollutant concentrations and geographical coordinates.
    """
    data = await AQIService.get_aqi_data(force_refresh=force_refresh)
    return data.stations
