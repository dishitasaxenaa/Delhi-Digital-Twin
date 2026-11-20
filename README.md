# Delhi Digital Twin – Stage 2: Real-Time Data Integration
### Urban Intelligence & Simulation Platform for NCT Delhi, India

An upgraded, production-ready Digital Twin of the National Capital Territory (NCT) of Delhi, integrating real-world air quality telemetry, arterial traffic flow models, and persistent historical storage via a Python FastAPI backend and interactive MapLibre GL frontend.

---

## 🏗️ Architecture Overview

```
Digital Twin/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── aqi.py              # GET /api/aqi, GET /api/aqi/stations
│   │   │   ├── traffic.py          # GET /api/traffic, GET /api/traffic/roads, GET /api/traffic/incidents
│   │   │   ├── city.py             # GET /api/city/summary
│   │   │   └── history.py          # GET /api/history/aqi, GET /api/history/traffic
│   │   ├── core/
│   │   │   ├── config.py           # Pydantic Settings (.env configuration & thresholds)
│   │   │   ├── cpcb_calculator.py  # Official CPCB National Air Quality Index (NAQI) calculation
│   │   │   └── database.py         # Persistent DB manager (SQLite & PostgreSQL / PostGIS)
│   │   ├── models/
│   │   │   └── historical.py       # Telemetry schema definitions (AQI, Traffic, Incidents)
│   │   ├── schemas/
│   │   │   ├── aqi.py              # Pydantic models for station readings & pollutants
│   │   │   ├── traffic.py          # Pydantic models for road flows & congestion categories
│   │   │   └── city.py             # Pydantic models for aggregated city metrics
│   │   ├── services/
│   │   │   ├── aqi_service.py      # Real-time CPCB / Open-Meteo multi-sensor mesh adapter
│   │   │   ├── traffic_service.py  # TomTom Traffic Flow & Incidents adapter with configurable ratios
│   │   │   ├── cache_service.py    # Thread-safe in-memory TTL caching
│   │   │   └── history_service.py  # Deduplicated database recording & historical aggregation
│   │   └── main.py                 # FastAPI application, CORS, lifespan & background polling
│   ├── requirements.txt
│   └── run_server.py               # One-click backend startup runner
├── src/                            # Preserved Frontend React 18 + TypeScript + MapLibre GL
│   ├── hooks/
│   │   └── useTelemetry.ts         # Live polling hook (Traffic 2m, AQI 15m)
│   ├── services/
│   │   ├── apiClient.ts            # Frontend HTTP client connecting to /api endpoints
│   │   ├── aqiService.ts           # Dynamic IDW heatmap interpolation & GeoJSON converters
│   │   └── trafficService.ts       # Dynamic road network GeoJSON & congestion styling
│   ├── components/                 # Command Center UI (Navbar, MapView, Popups, Sidebars)
│   └── pages/                      # Dashboard & SimulationLab
├── .env.example                    # Template environment variables
├── .env                            # Active local configuration
├── package.json
└── vite.config.ts                  # Vite config with backend proxy (/api -> http://127.0.0.1:8000)
```

---

## 📡 API Data Sources & Methodology

### 1. Air Quality Telemetry & CPCB Indexing
- **Primary Live Data Engine**: Open-Meteo Atmospheric Real-Time Mesh (Copernicus CAMS & GEMS live atmospheric data at 0.1° resolution across NCT Delhi).
- **Government Sources Supported**:
  - Central Pollution Control Board (CPCB) CAAQMS via `data.gov.in` (`DATA_GOV_IN_API_KEY`)
  - OpenAQ v3 API (`OPENAQ_API_KEY`)
  - World Air Quality Index / AQICN (`WAQI_API_TOKEN`)
- **Official CPCB Calculation Methodology**:
  - Implemented strictly per the official MoEFCC / CPCB National Air Quality Index (NAQI) guidelines.
  - Linear sub-index interpolation across official breakpoints for **PM2.5, PM10, NO2, SO2, CO, and O3**.
  - Overall AQI computed as the maximum sub-index ($AQI = \max(I_i)$) with dominant pollutant identification.
  - Clearly identifies whether values are direct station telemetry or CPCB-calculated from live pollutant concentrations.
- **28 Authentic CAAQMS Stations**: Anand Vihar, Jahangirpuri, Wazirpur, Punjabi Bagh, RK Puram, Bawana, Narela, Mundka, Rohini Sec 16, Dwarka Sec 8, IGI Airport T3, Lodhi Road, Mandir Marg, Major Dhyan Chand Stadium, ITO, IIT Delhi, Siri Fort, Nehru Nagar, Okhla Phase 2, Patparganj, Vivek Vihar, Sonia Vihar, Alipur, Ashok Vihar, Shadipur, Najafgarh, Aya Nagar, PUSA.

### 2. Traffic Flow & Congestion Modeling
- **Primary Source**: **TomTom Traffic Flow & Incident API** (`https://developer.tomtom.com/`).
- **Configurable Speed Ratio Thresholds**:
  Congestion level is calculated using the ratio of observed speed to free-flow speed:
  $$\text{Ratio} = \frac{\text{Current Speed}}{\text{Free-Flow Speed}}$$
  - **Low Congestion**: $\text{Ratio} \ge 80\%$ (configurable via `TRAFFIC_LOW_THRESHOLD=0.80`)
  - **Moderate Congestion**: $60\% \le \text{Ratio} < 80\%$ (via `TRAFFIC_MODERATE_THRESHOLD=0.60`)
  - **High Congestion**: $40\% \le \text{Ratio} < 60\%$ (via `TRAFFIC_HIGH_THRESHOLD=0.40`)
  - **Severe Congestion**: $\text{Ratio} < 40\%$
- **Delhi Arterial Network**: 17 major road stretches including Ring Road (South, West, North, East Yamuna Bypass), Outer Ring Road, NH-48 (Delhi-Gurugram), NH-44 (GT Karnal Rd), Barapullah Elevated Road, Vikas Marg, DND Flyway, Rohtak Road (NH-9), Mathura Road, MB Road, and Dwarka Expressway.
- **Graceful Unconfigured / Offline Behavior**: When `TOMTOM_API_KEY` is not configured, the backend returns status `API_KEY_REQUIRED` with baseline arterial velocities and real road geometries, never silently claiming mock data is real-time.

---

## 💾 Persistent Database & Historical Telemetry Storage

- **Database Engine**: Persistent storage via SQLite (`delhi_digital_twin.db`) out-of-the-box, with built-in connection support for **PostgreSQL + PostGIS** (`DATABASE_URL=postgresql://user:password@localhost:5432/delhi_digital_twin`).
- **Deduplication**: Automatically suppresses duplicate records within telemetry refresh windows (15 min for AQI, 2 min for Traffic).
- **Historical Analysis (Requirement 8)**:
  - Stored records are queried via `GET /api/history/aqi` and `GET /api/history/traffic`.
  - When history is accumulating (< 2 hours), the dashboard displays an informative "Historical Logging Active" badge and transparently avoids displaying fabricated trend lines.
  - When $\ge 2$ hours of data are collected, charts automatically render real observed diurnal and rush-hour curves.

---

## ⚡ Quick Start Guide

### 1. Start the FastAPI Backend

In your first terminal:
```powershell
# Navigate to project directory
cd "c:\Users\dishi\OneDrive\Desktop\Digital Twin"

# Start FastAPI backend server
python backend/run_server.py
```
Backend runs on `http://127.0.0.1:8000`. You can inspect interactive OpenAPI documentation at `http://127.0.0.1:8000/docs`.

### 2. Start the Frontend

In your second terminal:
```powershell
cd "c:\Users\dishi\OneDrive\Desktop\Digital Twin"

# Launch Vite development server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🔑 Environment Variables Configuration (`.env`)

Edit `.env` to configure external provider keys:

```ini
# Database: SQLite (default) or PostgreSQL with PostGIS
DATABASE_URL=sqlite:///./delhi_digital_twin.db

# TomTom Traffic API (https://developer.tomtom.com/)
TOMTOM_API_KEY=

# Air Quality Provider Keys (Optional)
DATA_GOV_IN_API_KEY=
OPENAQ_API_KEY=
WAQI_API_TOKEN=

# Configurable Traffic Thresholds (Speed / FreeFlow Speed Ratio)
TRAFFIC_LOW_THRESHOLD=0.80
TRAFFIC_MODERATE_THRESHOLD=0.60
TRAFFIC_HIGH_THRESHOLD=0.40

# Cache TTL (seconds)
TRAFFIC_CACHE_TTL=120
AQI_CACHE_TTL=900
```
