"""
Official Central Pollution Control Board (CPCB) India National Air Quality Index (NAQI)
Calculator implementation based on MoEFCC / CPCB technical guidelines.
"""
from typing import Dict, Tuple, Optional

# CPCB Sub-Index Breakpoint Tables
# Format: (C_low, C_high, I_low, I_high)
BREAKPOINTS = {
    "pm25": [
        (0, 30, 0, 50),
        (31, 60, 51, 100),
        (61, 90, 101, 200),
        (91, 120, 201, 300),
        (121, 250, 301, 400),
        (251, 500, 401, 500),
    ],
    "pm10": [
        (0, 50, 0, 50),
        (51, 100, 51, 100),
        (101, 250, 101, 200),
        (251, 350, 201, 300),
        (351, 430, 301, 400),
        (431, 600, 401, 500),
    ],
    "no2": [
        (0, 40, 0, 50),
        (41, 80, 51, 100),
        (81, 180, 101, 200),
        (181, 280, 201, 300),
        (281, 400, 301, 400),
        (401, 600, 401, 500),
    ],
    "so2": [
        (0, 40, 0, 50),
        (41, 80, 51, 100),
        (81, 380, 101, 200),
        (381, 800, 201, 300),
        (801, 1600, 301, 400),
        (1601, 2500, 401, 500),
    ],
    "co": [
        (0.0, 1.0, 0, 50),
        (1.1, 2.0, 51, 100),
        (2.1, 10.0, 101, 200),
        (10.1, 17.0, 201, 300),
        (17.1, 34.0, 301, 400),
        (34.1, 50.0, 401, 500),
    ],
    "o3": [
        (0, 50, 0, 50),
        (51, 100, 51, 100),
        (101, 168, 101, 200),
        (169, 208, 201, 300),
        (209, 748, 301, 400),
        (749, 1000, 401, 500),
    ],
}

def get_category_from_aqi(aqi: int) -> str:
    if aqi <= 50:
        return "Good"
    elif aqi <= 100:
        return "Satisfactory"
    elif aqi <= 200:
        return "Moderate"
    elif aqi <= 300:
        return "Poor"
    elif aqi <= 400:
        return "Very Poor"
    else:
        return "Severe"

def calculate_sub_index(pollutant: str, concentration: float) -> Optional[int]:
    """Calculate single pollutant sub-index using linear interpolation."""
    if pollutant not in BREAKPOINTS or concentration is None or concentration < 0:
        return None

    ranges = BREAKPOINTS[pollutant]
    for b_lo, b_hi, i_lo, i_hi in ranges:
        if b_lo <= concentration <= b_hi:
            sub = ((i_hi - i_lo) / (b_hi - b_lo)) * (concentration - b_lo) + i_lo
            return round(sub)

    # Beyond upper bound
    if concentration > ranges[-1][1]:
        return 500
    return None

def calculate_cpcb_aqi(pollutants: Dict[str, Optional[float]]) -> Tuple[int, str, str, Dict[str, int]]:
    """
    Computes overall CPCB AQI as max of individual sub-indices.
    Returns: (aqi, category, dominant_pollutant, sub_indices_dict)
    """
    sub_indices: Dict[str, int] = {}

    for pol, val in pollutants.items():
        if val is not None:
            sub = calculate_sub_index(pol.lower(), val)
            if sub is not None:
                sub_indices[pol.upper()] = sub

    if not sub_indices:
        return 0, "Unknown", "None", {}

    dominant_pollutant = max(sub_indices, key=sub_indices.get)
    max_aqi = sub_indices[dominant_pollutant]
    category = get_category_from_aqi(max_aqi)

    return max_aqi, category, dominant_pollutant, sub_indices
