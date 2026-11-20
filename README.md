# Delhi Digital Twin – Stage 1 (Interactive Frontend)
### Urban Intelligence & Municipal Simulation Platform for NCT Delhi, India

A high-performance, command-center web application representing the virtual digital twin of the National Capital Territory (NCT) of Delhi. This platform visualizes real-time and simulated arterial traffic congestion, air quality (AQI) spatial heatmaps, and municipal incident monitoring, with a dedicated Simulation Lab module prepared for Stage 2 SUMO micro-simulation integration.

---

## 🛠️ Technology Stack

- **Framework**: React 18 with Vite & TypeScript
- **Styling**: Tailwind CSS (Dark command-center theme `#080c14` / `#0d1524`, cyber cyan & deep blue accents)
- **Map Engine**: MapLibre GL JS v4 with Carto Dark Matter (OpenStreetMap vector tiles), Light Positron, and Satellite basemaps
- **Analytics & Charts**: Recharts (24-hour Diurnal AQI Area Chart, Peak Hour Congestion Line Chart, Traffic Volume vs AQI Surge Composed Chart)
- **Icons**: Lucide React

---

## 🌟 Key Features

### 1. Complete Delhi Geographical Extent
- Accurate WGS-84 boundaries covering the entire 1,484 km² NCT Delhi from Narela / Alipur in the North, Badarpur in the South, Najafgarh in the West, to Anand Vihar in the East.
- OpenStreetMap vector tile integration displaying roads, sectors, colonies, and prominent landmarks.
- Interactive camera controls: Zoom in/out, pan, and instantaneous "Reset Map" to NCT bounds.

### 2. Traffic Flow & Congestion Visualization
- Realistic arterial network mapping major Delhi lifelines:
  - **Ring Road (Mahatma Gandhi Marg)**: South, West, North, and East Yamuna Bypass sections
  - **Outer Ring Road**: North and South corridors
  - **Expressways**: NH-48 (Delhi-Gurugram), NH-44 (GT Karnal Road), Delhi-Meerut Expressway, DND Flyway, Dwarka Expressway (UER-II)
  - **Key Radials**: Barapullah Elevated Road, Vikas Marg, Rohtak Road (NH-9), Mathura Road, Mehrauli-Badarpur (MB) Road, Najafgarh Road
- Four standard color-coded congestion tiers:
  - 🟢 **Low** (>45 km/h)
  - 🟡 **Moderate** (30–45 km/h)
  - 🟠 **High** (18–30 km/h)
  - 🔴 **Severe** (<18 km/h, with animated glow)
- Clickable road segments revealing average vehicle speed, speed limits, travel time vs free-flow delay, vehicle throughput (veh/hr), and active incidents.

### 3. Air Quality (AQI) Heatmap & CPCB Station Network
- **Interpolated Spatial Heatmap**: Inverse Distance Weighting (IDW) interpolation calculated across a high-resolution grid covering Delhi, rendering smooth GPU-accelerated atmospheric concentration fields.
- **28 Authentic CPCB / DPCC Monitoring Stations**:
  - Anand Vihar, Jahangirpuri, Wazirpur, Punjabi Bagh, RK Puram, Bawana, Narela, Mundka, Rohini Sec 16, Dwarka Sec 8, IGI Airport T3, Lodhi Road, Mandir Marg, Major Dhyan Chand Stadium, ITO, IIT Delhi, Siri Fort, Nehru Nagar, Okhla Phase 2, Patparganj, Vivek Vihar, Sonia Vihar, Alipur, Ashok Vihar, Shadipur, Najafgarh, Aya Nagar, Pusa.
- Six standard AQI classification tiers with interactive filter chips:
  - 🟢 **Good** (0–50)
  - 🟢 **Satisfactory** (51–100)
  - 🟡 **Moderate** (101–200)
  - 🟠 **Poor** (201–300)
  - 🔴 **Very Poor** (301–400)
  - 🟣 **Severe** (401–500)
- Contextual Station Drawer displaying exact PM2.5, PM10, NO2, CO, SO2, O3 concentrations, dominant pollutants, and telemetry timestamps.

### 4. City Insights & Analytical Command Center
- Real-time aggregated metrics: City-wide AQI weighted average, network congestion load %, average speed, active incidents, and high-pollution hotspots count.
- Interactive Recharts modules:
  - **AQI 24-hr Diurnal Trend**: Peak tracking with 400 SEVERE threshold benchmark.
  - **Traffic Congestion Profile**: Dual tracking of network load % and flow speed across morning and evening rush hours.
  - **Traffic vs AQI Correlation Chart**: Dual-axis bar and line chart proving emission surges during peak traffic volumes.
- Hotspot quick-jump cards (e.g. Bawana, Anand Vihar, Mundka) that automatically fly the map camera directly to critical zones.

### 5. Future Simulation Lab (Stage 2 Preparation)
- Dedicated municipal planning module for city authorities and traffic engineers.
- Interactive scenario testing interface:
  - Road closure & traffic diversion modeling (e.g., Ashram underpass maintenance diversion via Barapullah and DND).
  - Adaptive signal split optimization (e.g., ITO & Vikas Marg green phase adjustments).
  - Heavy commercial vehicle (HGV) night window restrictions.
- Side-by-side **Baseline vs Proposed** impact projection matrix comparing flow speeds, congestion alleviation, and projected PM2.5/NO2 reduction.
- Technical architecture blueprint for connecting the open-source **SUMO (Simulation of Urban MObility)** Python TraCI engine and CPCB emission models.

---

## 📂 Project Architecture

```
delhi-digital-twin/
├── public/
├── src/
│   ├── components/
│   │   ├── CityInsights/
│   │   │   └── RightSidebar.tsx        # Aggregated metrics, charts, hotspot actions
│   │   ├── MapView/
│   │   │   ├── MapLegend.tsx           # Floating AQI & Traffic legends
│   │   │   ├── MapPopup.tsx            # Contextual details for clicked road/station/incident
│   │   │   └── MapView.tsx             # MapLibre GL WebGL engine & layers
│   │   ├── Navbar.tsx                  # Top header, live clock, status pill, view switcher
│   │   └── Sidebar/
│   │       └── LeftSidebar.tsx         # Traffic, AQI, and Basemap controls & filters
│   ├── data/
│   │   ├── cityInsightsData.ts         # 24h temporal metrics, correlations, summaries
│   │   ├── delhiBoundary.ts           # NCT Delhi GeoJSON boundary and bounds
│   │   ├── delhiIncidents.ts          # Authentic traffic incidents across Delhi
│   │   ├── delhiRoads.ts              # Major expressways, ring roads, arterials
│   │   └── delhiStations.ts           # 28 CPCB monitoring stations with coordinates
│   ├── pages/
│   │   ├── Dashboard.tsx              # Main command center layout
│   │   └── SimulationLab.tsx          # Municipal what-if scenario testing sandbox
│   ├── services/
│   │   ├── aqiService.ts              # AQI calculations, station GeoJSON, IDW heatmap
│   │   ├── simulationService.ts       # Municipal scenario definitions
│   │   └── trafficService.ts          # Road GeoJSON, incident points, color mappings
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces and domain models
│   ├── App.tsx                        # Master layout controller
│   ├── index.css                      # Tailwind styling & MapLibre canvas styles
│   └── main.tsx                       # React application root
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Installation & Run

1. Clone or open the project directory:
   ```bash
   cd "Digital Twin"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. Build for production:
   ```bash
   npm run build
   ```
