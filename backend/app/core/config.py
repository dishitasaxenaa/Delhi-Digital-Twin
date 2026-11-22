import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Delhi Digital Twin Backend"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/delhi_digital_twin"

    # Traffic API (TomTom)
    TOMTOM_API_KEY: Optional[str] = None
    TRAFFIC_LOW_THRESHOLD: float = 0.80       # >80% free-flow speed -> Low
    TRAFFIC_MODERATE_THRESHOLD: float = 0.60  # 60-80% -> Moderate
    TRAFFIC_HIGH_THRESHOLD: float = 0.40      # 40-60% -> High (below 40% -> Severe)

    # Air Quality APIs
    OPENAQ_API_KEY: Optional[str] = None
    DATA_GOV_IN_API_KEY: Optional[str] = None
    WAQI_API_TOKEN: Optional[str] = None

    # Cache TTL in seconds
    TRAFFIC_CACHE_TTL: int = 120   # 2 minutes
    AQI_CACHE_TTL: int = 900       # 15 minutes

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
