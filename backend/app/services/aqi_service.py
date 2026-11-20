import logging
import httpx
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

from backend.app.core.config import settings
from backend.app.core.cpcb_calculator import calculate_cpcb_aqi, get_category_from_aqi
from backend.app.services.cache_service import cache
from backend.app.services.history_service import HistoryService
from backend.app.schemas.aqi import AQIStationSchema, AQIResponseSchema

logger = logging.getLogger(__name__)

# Master Registry of 28 Official CPCB / DPCC CAAQMS Stations across NCT Delhi
DELHI_STATIONS_METADATA = [
    {"id": "DEL-AV-01", "name": "Anand Vihar CAAQMS", "locality": "ISBT / Kaushambi Border", "district": "East Delhi", "coordinates": [77.3150, 28.6476]},
    {"id": "DEL-JP-02", "name": "Jahangirpuri Monitoring Station", "locality": "Industrial Area", "district": "North West Delhi", "coordinates": [77.1685, 28.7325]},
    {"id": "DEL-WZ-03", "name": "Wazirpur Industrial Area", "locality": "Netaji Subhash Place", "district": "North West Delhi", "coordinates": [77.1654, 28.6999]},
    {"id": "DEL-PB-04", "name": "Punjabi Bagh Station", "locality": "Ring Road West Corridor", "district": "West Delhi", "coordinates": [77.1246, 28.6740]},
    {"id": "DEL-RKP-05", "name": "R K Puram Sector 12", "locality": "Bhikaji Cama Place", "district": "South West Delhi", "coordinates": [77.1751, 28.5633]},
    {"id": "DEL-BW-06", "name": "Bawana Industrial Complex", "locality": "Sector 1 DSIIDC", "district": "North Delhi", "coordinates": [77.0399, 28.7997]},
    {"id": "DEL-NR-07", "name": "Narela Sub-City Station", "locality": "Grain Market / DSIIDC", "district": "North Delhi", "coordinates": [77.1023, 28.8524]},
    {"id": "DEL-MD-08", "name": "Mundka Industrial Zone", "locality": "Rohtak Road Corridor", "district": "West Delhi", "coordinates": [77.0270, 28.6835]},
    {"id": "DEL-ROH-09", "name": "Rohini Sector 16", "locality": "Rithala Metro Area", "district": "North West Delhi", "coordinates": [77.1199, 28.7326]},
    {"id": "DEL-DW-10", "name": "Dwarka Sector 8", "locality": "Residential Sub-City", "district": "South West Delhi", "coordinates": [77.0688, 28.5710]},
    {"id": "DEL-IGI-11", "name": "IGI Airport T3 Air Station", "locality": "Aerocity Terminal 3", "district": "South West Delhi", "coordinates": [77.0867, 28.5562]},
    {"id": "DEL-LR-12", "name": "Lodhi Road IMD Complex", "locality": "Lodhi Estate / IHC", "district": "Central Delhi", "coordinates": [77.2250, 28.5888]},
    {"id": "DEL-MM-13", "name": "Mandir Marg DPCC", "locality": "Gole Market / Birla Mandir", "district": "Central Delhi", "coordinates": [77.2008, 28.6364]},
    {"id": "DEL-MDC-14", "name": "Major Dhyan Chand National Stadium", "locality": "India Gate Hexagon", "district": "Central Delhi", "coordinates": [77.2372, 28.6128]},
    {"id": "DEL-ITO-15", "name": "ITO Crossing / BSZ Marg", "locality": "ITO Junction Approach", "district": "Central Delhi", "coordinates": [77.2410, 28.6310]},
    {"id": "DEL-IIT-16", "name": "Sri Aurobindo Marg (IIT Delhi)", "locality": "Hauz Khas Institutional", "district": "South Delhi", "coordinates": [77.1956, 28.5447]},
    {"id": "DEL-SF-17", "name": "Siri Fort Sports Complex", "locality": "Asiad Village Corridor", "district": "South Delhi", "coordinates": [77.2227, 28.5504]},
    {"id": "DEL-NN-18", "name": "Nehru Nagar CAAQMS", "locality": "Ashram Flyover Bypass", "district": "South East Delhi", "coordinates": [77.2494, 28.5678]},
    {"id": "DEL-OK-19", "name": "Okhla Phase 2 DSIIDC", "locality": "Industrial Area Phase II", "district": "South East Delhi", "coordinates": [77.2713, 28.5308]},
    {"id": "DEL-PPG-20", "name": "Patparganj Industrial Area", "locality": "Ghazipur Border / IP Ext", "district": "East Delhi", "coordinates": [77.2949, 28.6237]},
    {"id": "DEL-VV-21", "name": "Vivek Vihar Station", "locality": "Shahdara Institutional", "district": "Shahdara", "coordinates": [77.3153, 28.6713]},
    {"id": "DEL-SV-22", "name": "Sonia Vihar Water Works", "locality": "Wazirabad Road", "district": "North East Delhi", "coordinates": [77.2530, 28.7105]},
    {"id": "DEL-ALP-23", "name": "Alipur Station (NH-44)", "locality": "GT Karnal Road Corridor", "district": "North Delhi", "coordinates": [77.1332, 28.8153]},
    {"id": "DEL-AVH-24", "name": "Ashok Vihar Phase 1", "locality": "Satyawati College Area", "district": "North Delhi", "coordinates": [77.1816, 28.6954]},
    {"id": "DEL-SHD-25", "name": "Shadipur (West Patel Nagar)", "locality": "Patel Road / DMRC Depot", "district": "West Delhi", "coordinates": [77.1539, 28.6514]},
    {"id": "DEL-NJ-26", "name": "Najafgarh Rural Station", "locality": "Najafgarh Nangloi Road", "district": "South West Delhi", "coordinates": [76.9855, 28.6090]},
    {"id": "DEL-AN-27", "name": "Aya Nagar (Gurugram Border)", "locality": "MG Road Ecological Border", "district": "South Delhi", "coordinates": [77.1299, 28.4707]},
    {"id": "DEL-PUSA-28", "name": "PUSA - IARI Research Campus", "locality": "Agricultural Institute", "district": "Central West Delhi", "coordinates": [77.1578, 28.6366]},
]

class AQIService:
    @staticmethod
    async def get_aqi_data(force_refresh: bool = False) -> AQIResponseSchema:
        cache_key = "delhi_aqi_data"
        if not force_refresh:
            cached = cache.get(cache_key)
            if cached:
                return cached

        stations: List[AQIStationSchema] = []
        source_name = "Open-Meteo Atmospheric Real-Time Mesh"
        api_status = "LIVE"
        error_msg = None

        # Build comma-separated coordinates for all 28 Delhi stations for batch query
        lats = ",".join([str(s["coordinates"][1]) for s in DELHI_STATIONS_METADATA])
        lons = ",".join([str(s["coordinates"][0]) for s in DELHI_STATIONS_METADATA])
        url = (
            f"https://air-quality-api.open-meteo.com/v1/air-quality?"
            f"latitude={lats}&longitude={lons}&current="
            f"pm10,pm2_5,nitrogen_dioxide,carbon_monoxide,sulphur_dioxide,ozone"
        )

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    raw_data = resp.json()
                    # Open-Meteo returns a list of results if multiple locations are queried
                    items = raw_data if isinstance(raw_data, list) else [raw_data]

                    for idx, meta in enumerate(DELHI_STATIONS_METADATA):
                        item = items[idx] if idx < len(items) else {}
                        curr = item.get("current", {})

                        pm25 = curr.get("pm2_5")
                        pm10 = curr.get("pm10")
                        no2 = curr.get("nitrogen_dioxide")
                        # Open-Meteo CO is in ug/m3; CPCB standard requires mg/m3 (ug/m3 / 1000)
                        co_raw = curr.get("carbon_monoxide")
                        co = round(co_raw / 1000.0, 2) if co_raw is not None else None
                        so2 = curr.get("sulphur_dioxide")
                        o3 = curr.get("ozone")

                        # Compute official CPCB National Air Quality Index (NAQI)
                        pollutants_dict = {
                            "pm25": pm25,
                            "pm10": pm10,
                            "no2": no2,
                            "so2": so2,
                            "co": co,
                            "o3": o3,
                        }
                        aqi_val, cat, dom, _ = calculate_cpcb_aqi(pollutants_dict)

                        # Form ISO timestamp or IST time string
                        t_iso = curr.get("time", datetime.now(timezone.utc).isoformat())
                        now_str = datetime.now(timezone.utc).strftime("%d %b %Y, %H:%M UTC")

                        st_schema = AQIStationSchema(
                            id=meta["id"],
                            name=meta["name"],
                            locality=meta["locality"],
                            district=meta["district"],
                            coordinates=meta["coordinates"],
                            aqi=aqi_val,
                            category=cat,
                            pm25=pm25,
                            pm10=pm10,
                            no2=no2,
                            co=co,
                            o3=o3,
                            so2=so2,
                            dominantPollutant=dom,
                            timestamp=now_str,
                            source=source_name,
                            isLive=True,
                            isCalculated=True,
                        )
                        stations.append(st_schema)
                else:
                    api_status = "API_ERROR"
                    error_msg = f"Air Quality API returned HTTP {resp.status_code}"
                    logger.warning(error_msg)
        except Exception as e:
            api_status = "API_ERROR"
            error_msg = f"Network error connecting to Air Quality API: {str(e)}"
            logger.error(error_msg)

        # Fallback to metadata placeholders if API failed completely
        if not stations:
            for meta in DELHI_STATIONS_METADATA:
                stations.append(AQIStationSchema(
                    id=meta["id"],
                    name=meta["name"],
                    locality=meta["locality"],
                    district=meta["district"],
                    coordinates=meta["coordinates"],
                    aqi=0,
                    category="Unavailable",
                    pm25=None,
                    pm10=None,
                    no2=None,
                    co=None,
                    o3=None,
                    so2=None,
                    dominantPollutant="N/A",
                    timestamp="Reading Unavailable",
                    source="API Unavailable",
                    isLive=False,
                    isCalculated=False,
                ))

        # Calculate Overall Delhi AQI (Mean of all reporting stations)
        valid_aqis = [s.aqi for s in stations if s.aqi > 0]
        if valid_aqis:
            overall_aqi = round(sum(valid_aqis) / len(valid_aqis))
            overall_cat = get_category_from_aqi(overall_aqi)
        else:
            overall_aqi = 0
            overall_cat = "Unavailable"

        # Record to database asynchronously for historical storage
        if valid_aqis:
            HistoryService.record_aqi_stations([s.model_dump() for s in stations])

        response = AQIResponseSchema(
            stations=stations,
            totalStations=len(stations),
            reportingStations=len(valid_aqis),
            overallAQI=overall_aqi,
            overallCategory=overall_cat,
            lastUpdated=datetime.now(timezone.utc).strftime("%d %b %Y, %H:%M:%S UTC"),
            source=source_name,
            status=api_status,
            errorMessage=error_msg,
        )

        # Store in cache
        cache.set(cache_key, response, settings.AQI_CACHE_TTL)
        return response
