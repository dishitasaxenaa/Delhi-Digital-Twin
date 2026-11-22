"""Transparent BPR-based What-If estimates using TomTom or user inputs."""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Literal

BPR_ALPHA = 0.15
BPR_BETA = 4


def calculate_what_if(
    road: dict[str, Any], *, scenario_type: Literal["traffic_demand", "signal_green_time"],
    direction: Literal["increase", "decrease"], change_percent: float,
) -> dict[str, Any]:
    """Estimate a scenario from a TomTom baseline without claiming a vehicle count."""
    tomtom = bool(road.get("isLive") and "TomTom" in road.get("source", ""))
    if not tomtom:
        raise ValueError("A live TomTom observation is required for this estimate.")
    speed = float(road["avgSpeedKmH"])
    free_speed = float(road["freeFlowSpeedKmH"])
    speed_source = "TomTom observation"
    length = float(road.get("lengthKm", 0))
    if not 0 < speed <= free_speed or free_speed <= 0 or length <= 0:
        raise ValueError("Speeds and road length must be positive, and baseline speed cannot exceed free-flow speed.")
    if not 0 < change_percent <= 100:
        raise ValueError("Change magnitude must be greater than 0% and no more than 100%.")

    signed_change = change_percent / 100 * (1 if direction == "increase" else -1)
    demand_factor = 1.0
    capacity_index = 100.0
    if scenario_type == "traffic_demand":
        demand_factor = 1 + signed_change
    elif scenario_type == "signal_green_time":
        capacity_index = 100 * (1 + signed_change)
        if capacity_index <= 0:
            raise ValueError("Green time cannot be reduced to zero.")
    else:
        raise ValueError("Supported scenarios are traffic demand and signal green time only.")

    free_flow_time = length / free_speed * 60
    observed_time = length / speed * 60
    baseline_delay = max(0.0, observed_time / free_flow_time - 1.0)
    # Invert the standard BPR relation to infer a dimensionless baseline v/c
    # ratio from observed TomTom speed; no vehicle-count or capacity is claimed.
    baseline_vc = (baseline_delay / BPR_ALPHA) ** (1 / BPR_BETA)
    estimated_vc = baseline_vc * demand_factor * (100 / capacity_index)
    estimated_time = free_flow_time * (1 + BPR_ALPHA * estimated_vc ** BPR_BETA)
    estimated_speed = length / estimated_time * 60
    baseline_congestion = max(0.0, (1 - speed / free_speed) * 100)
    estimated_congestion = max(0.0, (1 - estimated_speed / free_speed) * 100)

    baseline = {"speed_kmh": speed, "congestion_percent": baseline_congestion,
                "travel_time_minutes": observed_time, "demand_index": 100.0,
                "capacity_index": 100.0, "volume_capacity_ratio": baseline_vc}
    estimate = {"speed_kmh": estimated_speed, "congestion_percent": estimated_congestion,
                "travel_time_minutes": estimated_time, "demand_index": 100 * demand_factor,
                "capacity_index": capacity_index, "volume_capacity_ratio": estimated_vc}
    changes = {}
    for key in ("speed_kmh", "congestion_percent", "travel_time_minutes", "demand_index", "capacity_index"):
        before, after = baseline[key], estimate[key]
        changes[key] = ((after - before) / abs(before) * 100) if before else None
    assumptions = [
        {"name": "Baseline speed", "value": speed, "unit": "km/h", "source": speed_source},
        {"name": "Free-flow speed", "value": free_speed, "unit": "km/h", "source": "TomTom observation"},
        {"name": "Road length", "value": length, "unit": "km", "source": "Road network reference"},
        {"name": "Baseline volume/capacity ratio", "value": baseline_vc, "unit": "dimensionless", "source": "Inferred from observed speed using the inverse BPR relation; not an observed traffic count"},
        {"name": "Relative demand and capacity indices", "value": "baseline = 100", "unit": "index", "source": "Normalized scale, not vehicles/hour"},
        {"name": "BPR alpha", "value": BPR_ALPHA, "unit": "coefficient", "source": "Standard BPR assumption"},
        {"name": "BPR beta", "value": BPR_BETA, "unit": "power", "source": "BPR formula parameter"},
    ]
    scenario_label = "Traffic demand" if scenario_type == "traffic_demand" else "Signal green time"
    question = f"{scenario_label} {direction} by {change_percent:g}% on {road['name']}"
    return {"engine": "bpr_formula", "model": "Formula-based estimate", "status": "estimated",
            "question": question, "scenario_type": scenario_type, "direction": direction,
            "change_percent": change_percent,
            "road": {"id": road["id"], "name": road["name"], "traffic_source": speed_source},
            "baseline": baseline, "estimated": estimate, "percent_changes": changes,
            "assumptions": assumptions,
            "explanation": "Travel time uses the BPR relation t = t_free-flow × (1 + 0.15 × (v/c)^4). Baseline v/c is inferred from TomTom speed; scenario demand scales v/c, while signal green-time changes scale a normalized capacity index proportionally. Relative indices are not vehicle counts or measured capacity.",
            "created_at": datetime.now(timezone.utc).isoformat()}
