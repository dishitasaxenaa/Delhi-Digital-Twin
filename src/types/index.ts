export type AQICategory = 
  | 'Good'          // 0 - 50
  | 'Satisfactory'  // 51 - 100
  | 'Moderate'      // 101 - 200
  | 'Poor'          // 201 - 300
  | 'Very Poor'     // 301 - 400
  | 'Severe'        // 401 - 500
  | 'Unavailable';

export type TrafficCongestionLevel = 'Low' | 'Moderate' | 'High' | 'Severe';

export interface AQIStation {
  id: string;
  name: string;
  locality: string;
  district: string;
  coordinates: [number, number]; // [lng, lat]
  aqi: number;
  category: AQICategory;
  pm25?: number | null;      // µg/m³
  pm10?: number | null;      // µg/m³
  no2?: number | null;       // µg/m³
  co?: number | null;        // mg/m³
  o3?: number | null;        // µg/m³
  so2?: number | null;       // µg/m³
  dominantPollutant: string;
  timestamp: string;
  source: string;
  isLive?: boolean;
  isCalculated?: boolean;
}

export interface RoadSegment {
  id: string;
  name: string;
  corridor: string;
  type: 'Expressway' | 'Ring Road' | 'Arterial' | 'Flyover' | 'Sub-Arterial' | string;
  coordinates: [number, number][]; // LineString coords [lng, lat]
  congestionLevel: TrafficCongestionLevel;
  avgSpeedKmH: number;
  freeFlowSpeedKmH?: number;
  speedLimitKmH: number;
  travelTimeMin: number;
  normalTimeMin: number;
  lengthKm: number;
  activeIncidentsCount: number;
  flowVehiclesPerHour: number;
  congestionRatio?: number;
  source?: string;
  isLive?: boolean;
  trafficGeometry?: [number, number][];
  sourceTimestamp?: string;
}

export type IncidentType = 'Breakdown' | 'Accident' | 'Construction' | 'Waterlogging' | 'Congestion Spill';
export type IncidentSeverity = 'Minor' | 'Moderate' | 'Critical';

export interface TrafficIncident {
  id: string;
  roadName: string;
  locality: string;
  type: IncidentType | string;
  severity: IncidentSeverity | string;
  description: string;
  coordinates: [number, number]; // [lng, lat]
  reportedAt: string;
  estimatedClearance: string;
  laneImpact: string;
  source?: string;
  isLive?: boolean;
}

export interface HourlyMetric {
  time: string;
  aqi: number;
  congestion: number; // 0 - 100%
  speed: number;      // km/h
  pm25: number;
  isHistorical?: boolean;
}

export interface CitySummary {
  overallAQI: number;
  overallAQICategory: AQICategory | string;
  avgCongestionPercent: number;
  avgSpeedKmH: number;
  highPollutionZonesCount: number;
  highCongestionRoadsCount: number;
  activeIncidentsCount: number;
  reportingStationsCount: number;
  totalStationsCount: number;
  lastUpdated: string;
  calculationMethod?: string;
  sourceSummary?: string;
  aqiStatus?: string;      // "LIVE", "CACHED", "ERROR"
  trafficStatus?: string;  // "LIVE", "CACHED", "API_KEY_REQUIRED", "ERROR"
  hasSufficientHistory?: boolean;
  trends?: HourlyMetric[];
}

export interface MapLayerState {
  traffic: boolean;
  aqiHeatmap: boolean;
  aqiStations: boolean;
  incidents: boolean;
  delhiBoundary: boolean;
}

export type MapStyleType = 'dark' | 'light' | 'satellite';

export type SelectedFeature = 
  | { type: 'station'; data: AQIStation }
  | { type: 'road'; data: RoadSegment }
  | { type: 'incident'; data: TrafficIncident }
  | null;
