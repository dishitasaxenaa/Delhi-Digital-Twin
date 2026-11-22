import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.core.database import init_db
from backend.app.api.aqi import router as aqi_router
from backend.app.api.traffic import router as traffic_router
from backend.app.api.city import router as city_router
from backend.app.api.history import router as history_router
from backend.app.api.simulations import router as simulations_router
from backend.app.services.aqi_service import AQIService
from backend.app.services.traffic_service import TrafficService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("delhi_digital_twin")

async def background_telemetry_collector():
    """Background task that runs periodically to fetch and store telemetry history."""
    logger.info("Background telemetry collector started.")
    # Allow server to initialize first
    await asyncio.sleep(2)
    while True:
        try:
            logger.info("Executing periodic telemetry polling & database sync...")
            await AQIService.get_aqi_data(force_refresh=True)
            await TrafficService.get_traffic_data(force_refresh=True)
        except Exception as e:
            logger.error(f"Error in background collector: {e}")
        # Sleep for traffic interval (120s)
        await asyncio.sleep(settings.TRAFFIC_CACHE_TTL)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database schema
    logger.info("Initializing Delhi Digital Twin database schema...")
    init_db()
    # Start background collector task
    collector_task = asyncio.create_task(background_telemetry_collector())
    yield
    # Shutdown: Cancel background task
    collector_task.cancel()
    logger.info("Delhi Digital Twin backend stopped.")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API and Telemetry Integration Engine for the Delhi Digital Twin Platform",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(aqi_router)
app.include_router(traffic_router)
app.include_router(city_router)
app.include_router(history_router)
app.include_router(simulations_router)

@app.get("/")
def get_root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "ONLINE",
        "database": settings.DATABASE_URL.split(":")[0],
        "endpoints": [
            "/api/traffic",
            "/api/traffic/roads",
            "/api/traffic/incidents",
            "/api/aqi",
            "/api/aqi/stations",
            "/api/city/summary",
            "/api/history/aqi",
            "/api/history/traffic",
            "/docs",
        ],
    }
