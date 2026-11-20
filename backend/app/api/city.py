from fastapi import APIRouter
from datetime import datetime, timezone
from backend.app.services.aqi_service import AQIService
from backend.app.services.traffic_service import TrafficService
from backend.app.services.history_service import HistoryService
from backend.app.schemas.city import CitySummarySchema, HourlyTrendSchema

router = APIRouter(prefix="/api/city", tags=["City Intelligence"])

@router.get("/summary", response_model=CitySummarySchema)
async def get_city_summary():
    """
    Returns aggregated smart-city command center summary.
    Combines live AQI, traffic conditions, active incidents, and stored historical trends.
    """
    aqi_data = await AQIService.get_aqi_data()
    traffic_data = await TrafficService.get_traffic_data()

    # Count high-pollution zones (AQI > 300)
    high_poll_zones = len([s for s in aqi_data.stations if s.aqi > 300])

    # Fetch real stored history
    history_trends = HistoryService.get_hourly_historical_trends(hours=24)
    has_history = len(history_trends) >= 2

    # If insufficient history is stored yet, we present the partial data points or current point
    trend_schemas = [HourlyTrendSchema(**t) for t in history_trends]

    calculation_method = (
        "Overall Delhi AQI is calculated as the arithmetic mean of all actively reporting "
        f"monitoring stations ({aqi_data.reportingStations}/{aqi_data.totalStations} stations reporting)."
    )

    source_summary = f"Air Quality: {aqi_data.source} | Traffic: {traffic_data.source}"

    return CitySummarySchema(
        overallAQI=aqi_data.overallAQI,
        overallAQICategory=aqi_data.overallCategory,
        avgCongestionPercent=traffic_data.averageCongestionPercent,
        avgSpeedKmH=traffic_data.averageSpeedKmH,
        highPollutionZonesCount=high_poll_zones,
        highCongestionRoadsCount=traffic_data.highCongestionRoadsCount,
        activeIncidentsCount=len(traffic_data.incidents),
        reportingStationsCount=aqi_data.reportingStations,
        totalStationsCount=aqi_data.totalStations,
        lastUpdated=datetime.now(timezone.utc).strftime("%d %b %Y, %H:%M:%S UTC"),
        calculationMethod=calculation_method,
        sourceSummary=source_summary,
        aqiStatus=aqi_data.status,
        trafficStatus=traffic_data.status,
        trends=trend_schemas,
        hasSufficientHistory=has_history,
    )
