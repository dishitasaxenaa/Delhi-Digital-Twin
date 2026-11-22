"""Formula-based traffic What-If estimates and PostgreSQL history."""
import json
import logging
from typing import Literal

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from backend.app.core.database import get_db_cursor
from backend.app.services.formula_what_if_service import calculate_what_if
from backend.app.services.traffic_service import TrafficService

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/simulations", tags=["Traffic What-If"])


class WhatIfRequest(BaseModel):
    road_id: str = Field(min_length=1, max_length=100)
    scenario_type: Literal["traffic_demand", "signal_green_time"]
    direction: Literal["increase", "decrease"]
    change_percent: float = Field(gt=0, le=100)


@router.post("")
async def estimate_traffic(request: WhatIfRequest):
    traffic = await TrafficService.get_traffic_data()
    roads = [road.model_dump() for road in traffic.roads
             if road.isLive and "TomTom" in road.source]
    if not roads:
        raise HTTPException(503, "Live TomTom traffic observations are unavailable. Refresh traffic data before calculating an estimate.")
    road = next((item for item in roads if item["id"] == request.road_id), None)
    if road is None:
        raise HTTPException(422, "Select a road with a current TomTom observation.")
    try:
        result = calculate_what_if(
            road, scenario_type=request.scenario_type, direction=request.direction,
            change_percent=request.change_percent,
        )
    except ValueError as exc:
        raise HTTPException(422, str(exc)) from exc
    except (KeyError, TypeError, ZeroDivisionError) as exc:
        logger.exception("Could not calculate What-If estimate")
        raise HTTPException(422, "The selected road is missing required traffic inputs.") from exc
    with get_db_cursor() as cur:
        cur.execute("INSERT INTO what_if_history(question,result_json) VALUES(%s,%s::jsonb)",
                    (result["question"], json.dumps(result)))
    return result


@router.get("")
def get_what_if_history(limit: int = Query(25, ge=1, le=100)):
    with get_db_cursor() as cur:
        cur.execute("""SELECT id,question,result_json,created_at FROM what_if_history
            WHERE result_json->>'engine'='bpr_formula' ORDER BY created_at DESC LIMIT %s""", (limit,))
        return [dict(row) for row in cur.fetchall()]
