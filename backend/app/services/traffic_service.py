import logging
import httpx
import math
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from backend.app.core.config import settings
from backend.app.services.cache_service import cache
from backend.app.services.history_service import HistoryService
from backend.app.schemas.traffic import RoadSegmentSchema, TrafficIncidentSchema, TrafficResponseSchema

logger = logging.getLogger(__name__)

# Master Registry of 17 Key Arterial Corridors across NCT Delhi with accurate WGS-84 coordinates
DELHI_ROADS_METADATA = [
    {
        "id": "ROAD-RR-S",
        "name": "Ring Road (South Section: Dhaula Kuan - AIIMS - Ashram)",
        "corridor": "Mahatma Gandhi Marg South",
        "type": "Ring Road",
        "coordinates": [
            [77.1610, 28.5912], [77.1720, 28.5750], [77.1900, 28.5700],
            [77.2080, 28.5680], [77.2280, 28.5670], [77.2420, 28.5685], [77.2580, 28.5710]
        ],
        "speedLimitKmH": 60,
        "lengthKm": 11.2,
        "samplePoint": (28.5680, 77.2080), # AIIMS
        "baselineSpeed": 22.0,
        "freeFlowSpeed": 60.0,
    },
    {
        "id": "ROAD-RR-W",
        "name": "Ring Road (West Section: Punjabi Bagh - Rajouri Garden - Naraina)",
        "corridor": "Mahatma Gandhi Marg West",
        "type": "Ring Road",
        "coordinates": [
            [77.1310, 28.6750], [77.1260, 28.6530], [77.1350, 28.6360],
            [77.1420, 28.6180], [77.1500, 28.6010], [77.1610, 28.5912]
        ],
        "speedLimitKmH": 60,
        "lengthKm": 9.8,
        "samplePoint": (28.6360, 77.1350), # Rajouri Garden
        "baselineSpeed": 26.0,
        "freeFlowSpeed": 60.0,
    },
    {
        "id": "ROAD-RR-N",
        "name": "Ring Road (North Section: Azadpur - Model Town - ISBT Kashmere Gate)",
        "corridor": "Mahatma Gandhi Marg North",
        "type": "Ring Road",
        "coordinates": [
            [77.1780, 28.7060], [77.1950, 28.7010], [77.2150, 28.6940],
            [77.2290, 28.6810], [77.2340, 28.6690], [77.2450, 28.6560]
        ],
        "speedLimitKmH": 60,
        "lengthKm": 8.9,
        "samplePoint": (28.6810, 77.2290), # Chandgiram Akhara
        "baselineSpeed": 24.0,
        "freeFlowSpeed": 60.0,
    },
    {
        "id": "ROAD-RR-E",
        "name": "Ring Road (East Bypass: Rajghat - Sarai Kale Khan - Ashram)",
        "corridor": "Yamuna Bypass / Mahatma Gandhi Marg East",
        "type": "Ring Road",
        "coordinates": [
            [77.2450, 28.6560], [77.2490, 28.6380], [77.2550, 28.6140],
            [77.2580, 28.5880], [77.2580, 28.5710]
        ],
        "speedLimitKmH": 60,
        "lengthKm": 9.4,
        "samplePoint": (28.6140, 77.2550), # Pragati Maidan
        "baselineSpeed": 20.0,
        "freeFlowSpeed": 60.0,
    },
    {
        "id": "ROAD-ORR-S",
        "name": "Outer Ring Road (South: IIT Flyover - Nehru Place - Modi Mill)",
        "corridor": "Outer Ring Road South",
        "type": "Ring Road",
        "coordinates": [
            [77.1580, 28.5480], [77.1880, 28.5440], [77.2140, 28.5420],
            [77.2380, 28.5470], [77.2530, 28.5510], [77.2710, 28.5580], [77.2880, 28.5630]
        ],
        "speedLimitKmH": 70,
        "lengthKm": 11.5,
        "samplePoint": (28.5470, 77.2380), # Chirag Delhi
        "baselineSpeed": 28.0,
        "freeFlowSpeed": 70.0,
    },
    {
        "id": "ROAD-ORR-N",
        "name": "Outer Ring Road (North: Mukarba Chowk - Burari - Wazirabad)",
        "corridor": "Outer Ring Road North",
        "type": "Ring Road",
        "coordinates": [
            [77.1530, 28.7250], [77.1850, 28.7290], [77.2100, 28.7270], [77.2340, 28.7180]
        ],
        "speedLimitKmH": 70,
        "lengthKm": 8.2,
        "samplePoint": (28.7270, 77.2100), # Burari
        "baselineSpeed": 42.0,
        "freeFlowSpeed": 70.0,
    },
    {
        "id": "ROAD-BP-ELEV",
        "name": "Barapullah Elevated Corridor (Sarai Kale Khan to INA Market)",
        "corridor": "Barapullah Phase I & II",
        "type": "Flyover",
        "coordinates": [
            [77.2580, 28.5880], [77.2450, 28.5820], [77.2310, 28.5770],
            [77.2160, 28.5720], [77.2080, 28.5680]
        ],
        "speedLimitKmH": 60,
        "lengthKm": 5.8,
        "samplePoint": (28.5770, 77.2310), # JLN Stadium
        "baselineSpeed": 44.0,
        "freeFlowSpeed": 60.0,
    },
    {
        "id": "ROAD-NH48-EXP",
        "name": "NH-48 (Delhi - Gurugram Expressway: Dhaula Kuan to Rajokri)",
        "corridor": "Airport Expressway / National Highway 48",
        "type": "Expressway",
        "coordinates": [
            [77.1610, 28.5912], [77.1420, 28.5680], [77.1200, 28.5440],
            [77.1020, 28.5280], [77.0870, 28.5080]
        ],
        "speedLimitKmH": 80,
        "lengthKm": 13.5,
        "samplePoint": (28.5440, 77.1200), # Mahipalpur
        "baselineSpeed": 25.0,
        "freeFlowSpeed": 80.0,
    },
    {
        "id": "ROAD-NH44-GTK",
        "name": "NH-44 (GT Karnal Road: Mukarba Chowk to Singhu Border)",
        "corridor": "Grand Trunk Road North Corridor",
        "type": "Expressway",
        "coordinates": [
            [77.1530, 28.7250], [77.1460, 28.7600], [77.1350, 28.8100],
            [77.1310, 28.8450], [77.1260, 28.8780]
        ],
        "speedLimitKmH": 80,
        "lengthKm": 17.8,
        "samplePoint": (28.8100, 77.1350), # Alipur
        "baselineSpeed": 62.0,
        "freeFlowSpeed": 80.0,
    },
    {
        "id": "ROAD-DME-MEERUT",
        "name": "Delhi-Meerut Expressway (Akshardham to UP Gate / Ghazipur)",
        "corridor": "NH-9 / Delhi-Meerut Expressway Phase 1",
        "type": "Expressway",
        "coordinates": [
            [77.2790, 28.6180], [77.2980, 28.6250], [77.3170, 28.6310], [77.3380, 28.6380]
        ],
        "speedLimitKmH": 90,
        "lengthKm": 8.7,
        "samplePoint": (28.6250, 77.2980), # Mayur Vihar
        "baselineSpeed": 68.0,
        "freeFlowSpeed": 90.0,
    },
    {
        "id": "ROAD-DND-FLY",
        "name": "Delhi-Noida Direct (DND) Flyway",
        "corridor": "Yamuna River Crossing Toll Expressway",
        "type": "Expressway",
        "coordinates": [
            [77.2560, 28.5800], [77.2720, 28.5820], [77.2910, 28.5850], [77.3120, 28.5880]
        ],
        "speedLimitKmH": 70,
        "lengthKm": 6.2,
        "samplePoint": (28.5820, 77.2720), # Yamuna Bridge
        "baselineSpeed": 54.0,
        "freeFlowSpeed": 70.0,
    },
    {
        "id": "ROAD-VIKAS-MARG",
        "name": "Vikas Marg (ITO Bridge to Anand Vihar ISBT)",
        "corridor": "East Delhi Trans-Yamuna Arterial",
        "type": "Arterial",
        "coordinates": [
            [77.2460, 28.6300], [77.2650, 28.6320], [77.2840, 28.6360],
            [77.3020, 28.6420], [77.3150, 28.6476]
        ],
        "speedLimitKmH": 50,
        "lengthKm": 8.1,
        "samplePoint": (28.6320, 77.2650), # Laxmi Nagar
        "baselineSpeed": 16.0,
        "freeFlowSpeed": 50.0,
    },
    {
        "id": "ROAD-ROHTAK-NH9",
        "name": "Rohtak Road (NH-9: Punjabi Bagh to Tikri Border)",
        "corridor": "West Delhi Rohtak Corridor",
        "type": "Arterial",
        "coordinates": [
            [77.1310, 28.6750], [77.0980, 28.6790], [77.0650, 28.6810],
            [77.0270, 28.6835], [76.9750, 28.6880], [76.9200, 28.6920]
        ],
        "speedLimitKmH": 60,
        "lengthKm": 18.2,
        "samplePoint": (28.6810, 77.0650), # Nangloi
        "baselineSpeed": 18.0,
        "freeFlowSpeed": 60.0,
    },
    {
        "id": "ROAD-MATHURA-RD",
        "name": "Mathura Road (Ashram Chowk to Badarpur Border)",
        "corridor": "South-East Delhi Industrial Radial",
        "type": "Arterial",
        "coordinates": [
            [77.2580, 28.5710], [77.2680, 28.5520], [77.2820, 28.5320],
            [77.2960, 28.5130], [77.3040, 28.4980], [77.3120, 28.4830]
        ],
        "speedLimitKmH": 60,
        "lengthKm": 11.4,
        "samplePoint": (28.5320, 77.2820), # Okhla
        "baselineSpeed": 24.0,
        "freeFlowSpeed": 60.0,
    },
    {
        "id": "ROAD-MB-ROAD",
        "name": "Mehrauli-Badarpur (MB) Road",
        "corridor": "South Delhi Cross-Connector",
        "type": "Sub-Arterial",
        "coordinates": [
            [77.1850, 28.5180], [77.2080, 28.5170], [77.2400, 28.5140],
            [77.2650, 28.5100], [77.2900, 28.5060], [77.3120, 28.4830]
        ],
        "speedLimitKmH": 50,
        "lengthKm": 12.8,
        "samplePoint": (28.5140, 77.2400), # Sangam Vihar
        "baselineSpeed": 15.0,
        "freeFlowSpeed": 50.0,
    },
    {
        "id": "ROAD-DWARKA-EXP",
        "name": "Dwarka Expressway / UER-II (Shiv Murti to Dwarka Sec 21)",
        "corridor": "Western Express Bypass / UER-II",
        "type": "Expressway",
        "coordinates": [
            [77.1020, 28.5280], [77.0680, 28.5360], [77.0520, 28.5520],
            [77.0380, 28.5790], [77.0150, 28.6180]
        ],
        "speedLimitKmH": 90,
        "lengthKm": 13.9,
        "samplePoint": (28.5520, 77.0520), # Sector 21
        "baselineSpeed": 72.0,
        "freeFlowSpeed": 90.0,
    },
    {
        "id": "ROAD-NAJAFGARH-RD",
        "name": "Najafgarh Road (Moti Nagar - Tilak Nagar - Uttam Nagar)",
        "corridor": "West Delhi Blue Line Corridor",
        "type": "Arterial",
        "coordinates": [
            [77.1420, 28.6570], [77.1200, 28.6480], [77.0980, 28.6380],
            [77.0650, 28.6250], [77.0350, 28.6180], [76.9920, 28.6120]
        ],
        "speedLimitKmH": 50,
        "lengthKm": 14.6,
        "samplePoint": (28.6380, 77.0980), # Tilak Nagar
        "baselineSpeed": 20.0,
        "freeFlowSpeed": 50.0,
    },
]

# Known representative traffic incidents across key bottlenecks
DEFAULT_INCIDENTS = [
    {
        "id": "INC-01",
        "roadName": "NH-48 / Mahipalpur Underpass",
        "locality": "Aerocity Flyover merge (Gurugram bound)",
        "type": "Breakdown",
        "severity": "Critical",
        "description": "Heavy commercial vehicle axle failure blocking 2 middle lanes.",
        "coordinates": [77.1200, 28.5440],
        "reportedAt": "12:42 IST",
        "estimatedClearance": "14:15 IST",
        "laneImpact": "2 of 4 lanes blocked",
        "source": "Delhi Traffic Police CAD",
        "isLive": False,
    },
    {
        "id": "INC-02",
        "roadName": "Ring Road (Ashram Chowk)",
        "locality": "Ashram Underpass entry towards Lajpat Nagar",
        "type": "Congestion Spill",
        "severity": "Critical",
        "description": "Bottleneck caused by disabled city bus at underpass bottleneck.",
        "coordinates": [77.2580, 28.5710],
        "reportedAt": "12:15 IST",
        "estimatedClearance": "13:45 IST",
        "laneImpact": "Right lane constricted",
        "source": "Delhi Traffic Police CAD",
        "isLive": False,
    },
    {
        "id": "INC-03",
        "roadName": "Vikas Marg / Laxmi Nagar",
        "locality": "Opposite Metro Pillar 38",
        "type": "Accident",
        "severity": "Moderate",
        "description": "Collision between two cars. Vehicles on shoulder.",
        "coordinates": [77.2650, 28.6320],
        "reportedAt": "13:05 IST",
        "estimatedClearance": "13:35 IST",
        "laneImpact": "Shoulder only",
        "source": "Delhi Traffic Police CAD",
        "isLive": False,
    },
]

def classify_congestion(ratio: float) -> str:
    """Classifies congestion level based on project configurable thresholds."""
    if ratio >= settings.TRAFFIC_LOW_THRESHOLD:
        return "Low"
    elif ratio >= settings.TRAFFIC_MODERATE_THRESHOLD:
        return "Moderate"
    elif ratio >= settings.TRAFFIC_HIGH_THRESHOLD:
        return "High"
    else:
        return "Severe"

class TrafficService:
    @staticmethod
    async def get_traffic_data(force_refresh: bool = False) -> TrafficResponseSchema:
        cache_key = "delhi_traffic_data"
        if not force_refresh:
            cached = cache.get(cache_key)
            if cached:
                cached_at = cache.get_cached_time(cache_key)
                cache_age = max(0, int(datetime.now(timezone.utc).timestamp() - cached_at)) if cached_at else None
                return cached.model_copy(update={"status": "CACHED", "cacheAgeSeconds": cache_age})

        roads: List[RoadSegmentSchema] = []
        incidents: List[TrafficIncidentSchema] = []
        api_status = "LIVE"
        request_errors: List[str] = []
        error_msg = None
        fetched_at = datetime.now(timezone.utc)
        source_timestamp = None
        source_name = "TomTom Traffic Flow API"
        has_tomtom_key = bool(settings.TOMTOM_API_KEY and settings.TOMTOM_API_KEY.strip())

        if has_tomtom_key:
            # Query TomTom Traffic Flow API for each corridor's geographical sample coordinate
            async with httpx.AsyncClient(timeout=8.0) as client:
                for meta in DELHI_ROADS_METADATA:
                    lat, lon = meta["samplePoint"]
                    url = (
                        f"https://api.tomtom.com/traffic/services/4/flowSegmentData/absolute/10/json?"
                        f"point={lat},{lon}&key={settings.TOMTOM_API_KEY}"
                    )
                    try:
                        resp = await client.get(url)
                        if resp.status_code == 200:
                            data = resp.json().get("flowSegmentData", {})
                            raw_current_speed = data.get("currentSpeed")
                            raw_free_flow_speed = data.get("freeFlowSpeed")
                            if raw_current_speed is None or raw_free_flow_speed is None:
                                request_errors.append(
                                    f"{meta['name']}: TomTom response omitted currentSpeed or freeFlowSpeed."
                                )
                                continue
                            try:
                                curr_speed = float(raw_current_speed)
                                ff_speed = float(raw_free_flow_speed)
                            except (TypeError, ValueError):
                                request_errors.append(f"{meta['name']}: TomTom returned non-numeric speed fields.")
                                continue
                            if not math.isfinite(curr_speed) or not math.isfinite(ff_speed) or curr_speed < 0 or ff_speed <= 0:
                                request_errors.append(f"{meta['name']}: TomTom returned invalid speed fields.")
                                continue
                            flow_geometry = []
                            coordinates = (data.get("coordinates") or {}).get("coordinate", [])
                            for point in coordinates:
                                try:
                                    lon, lat = float(point["longitude"]), float(point["latitude"])
                                except (KeyError, TypeError, ValueError):
                                    continue
                                if math.isfinite(lon) and math.isfinite(lat):
                                    flow_geometry.append([lon, lat])
                            ratio = curr_speed / ff_speed
                            cat = classify_congestion(ratio)
                            source_timestamp = resp.headers.get("Date") or source_timestamp

                            # Estimate travel time: length / (speed / 60)
                            travel_time = round((meta["lengthKm"] / curr_speed) * 60, 1) if curr_speed > 0 else None
                            normal_time = round((meta["lengthKm"] / max(ff_speed, 20.0)) * 60, 1)

                            roads.append(RoadSegmentSchema(
                                id=meta["id"],
                                name=meta["name"],
                                corridor=meta["corridor"],
                                type=meta["type"],
                                coordinates=meta["coordinates"],
                                congestionLevel=cat,
                                avgSpeedKmH=curr_speed,
                                freeFlowSpeedKmH=ff_speed,
                                speedLimitKmH=meta["speedLimitKmH"],
                                travelTimeMin=travel_time,
                                normalTimeMin=normal_time,
                                lengthKm=meta["lengthKm"],
                                activeIncidentsCount=0,
                                flowVehiclesPerHour=round(curr_speed * 90),
                                congestionRatio=ratio,
                                source="TomTom Traffic Flow API",
                                isLive=True,
                                sourceTimestamp=resp.headers.get("Date") or fetched_at.isoformat(),
                                trafficGeometry=flow_geometry if len(flow_geometry) >= 2 else None,
                            ))
                        else:
                            # HTTP error from TomTom (e.g. 403 Invalid Key or 429 Rate Limit)
                            request_errors.append(f"{meta['name']}: TomTom API returned HTTP {resp.status_code}.")
                    except Exception as e:
                        # Never include the request URL in an error; the URL
                        # contains the TomTom API key as a query parameter.
                        request_errors.append(f"{meta['name']}: TomTom request failed ({type(e).__name__}).")

            if request_errors:
                api_status = "PARTIAL" if roads else "API_ERROR"

            # Also query TomTom Incident Details within Delhi BBox
            if has_tomtom_key and roads:
                try:
                    inc_url = (
                        f"https://api.tomtom.com/traffic/services/5/incidentDetails?"
                        f"bbox=76.84,28.40,77.35,28.88&key={settings.TOMTOM_API_KEY}"
                    )
                    async with httpx.AsyncClient(timeout=8.0) as client:
                        inc_resp = await client.get(inc_url)
                        if inc_resp.status_code == 200:
                            inc_data = inc_resp.json().get("incidents", [])
                            for idx, inc in enumerate(inc_data[:10]):
                                geom = inc.get("geometry", {})
                                coords = geom.get("coordinates", [77.2090, 28.6139])
                                # TomTom coordinates may be nested line or point
                                pt = coords[0] if isinstance(coords[0], list) else coords
                                props = inc.get("properties", {})
                                events = props.get("events", [{}])
                                desc = events[0].get("description", "Live Traffic Delay")
                                incidents.append(TrafficIncidentSchema(
                                    id=f"TT-INC-{idx}",
                                    roadName=props.get("from", "Delhi Arterial Road"),
                                    locality="NCT Delhi Traffic Mesh",
                                    type="Congestion Spill",
                                    severity="Moderate",
                                    description=desc,
                                    coordinates=pt,
                                    reportedAt="Live TomTom Feed",
                                    estimatedClearance="Pending Clearing",
                                    laneImpact="Lane Constriction Reported",
                                    source="TomTom Incident API",
                                    isLive=True,
                                ))
                except Exception as e:
                    logger.warning(f"TomTom Incident API fetch failed: {e}")

        # Preserve the dashboard's labelled offline reference corridors when
        # live data is unavailable. They remain isLive=False and are excluded
        # from What-If baseline selection.
        if not roads:
            if not has_tomtom_key:
                api_status = "API_KEY_REQUIRED"
                error_msg = "TOMTOM_API_KEY is not configured in .env. Live traffic observations are unavailable."
                source_name = "Delhi Arterial Network (Key Required for Live Sensors)"
            else:
                api_status = "API_ERROR"
                error_msg = "; ".join(request_errors) or "TomTom returned no usable live traffic observations."
                source_name = "Delhi Arterial Network (Fallback)"

            for meta in DELHI_ROADS_METADATA:
                curr_spd = meta["baselineSpeed"]
                ff_spd = meta["freeFlowSpeed"]
                ratio = round(curr_spd / max(ff_spd, 1.0), 2)
                cat = classify_congestion(ratio)
                travel_time = round((meta["lengthKm"] / max(curr_spd, 5.0)) * 60, 1)
                normal_time = round((meta["lengthKm"] / max(ff_spd, 20.0)) * 60, 1)

                roads.append(RoadSegmentSchema(
                    id=meta["id"],
                    name=meta["name"],
                    corridor=meta["corridor"],
                    type=meta["type"],
                    coordinates=meta["coordinates"],
                    congestionLevel=cat,
                    avgSpeedKmH=curr_spd,
                    freeFlowSpeedKmH=ff_spd,
                    speedLimitKmH=meta["speedLimitKmH"],
                    travelTimeMin=travel_time,
                    normalTimeMin=normal_time,
                    lengthKm=meta["lengthKm"],
                    activeIncidentsCount=1 if "Ashram" in meta["name"] or "Mahipalpur" in meta["name"] else 0,
                    flowVehiclesPerHour=round(curr_spd * 90),
                    congestionRatio=ratio,
                    source=source_name,
                    isLive=False,
                ))

            # Add default incidents
            for inc in DEFAULT_INCIDENTS:
                incidents.append(TrafficIncidentSchema(**inc))

        # Calculate city aggregated traffic metrics
        avg_speed = round(sum([r.avgSpeedKmH for r in roads]) / len(roads), 1) if roads else 0.0
        # Average congestion % based on (1 - ratio) * 100
        avg_cong_pct = round(sum([(1.0 - r.congestionRatio) * 100 for r in roads]) / len(roads), 1) if roads else 0.0
        high_cong_count = len([r for r in roads if r.congestionLevel in ["High", "Severe"]])

        # Store in database
        HistoryService.record_traffic_roads([r.model_dump() for r in roads])

        response = TrafficResponseSchema(
            roads=roads,
            incidents=incidents,
            totalRoads=len(roads),
            averageSpeedKmH=avg_speed,
            averageCongestionPercent=max(0.0, avg_cong_pct),
            highCongestionRoadsCount=high_cong_count,
            lastUpdated=(source_timestamp or fetched_at.strftime("%a, %d %b %Y %H:%M:%S GMT")),
            source=source_name,
            status=api_status,
            errorMessage="; ".join(request_errors) if roads and request_errors else error_msg,
        )

        cache.set(cache_key, response, settings.TRAFFIC_CACHE_TTL)
        return response
