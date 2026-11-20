export type AQICategory = 
  | 'Good'          // 0 - 50
  | 'Satisfactory'  // 51 - 100
  | 'Moderate'      // 101 - 200
  | 'Poor'          // 201 - 300
  | 'Very Poor'     // 301 - 400
  | 'Severe';       // 401 - 500

export type TrafficCongestionLevel = 'Low' | 'Moderate' | 'High' | 'Severe';

export interface AQIStation {
  id: string;
  name: string;
  locality: string;
  district: string;
  coordinates: [number, number]; // [lng, lat]
  aqi: number;
  category: AQICategory;
  pm25: number;      // µg/m³
  pm10: number;      // µg/m³
  no2: number;       // µg/m³
  co: number;        // mg/m³
  o3: number;        // µg/m³
  so2: number;       // µg/m³
  dominantPollutant: 'PM2.5' | 'PM10' | 'NO2' | 'O3' | 'CO';
  timestamp: string;
  source: string;
}

export interface RoadSegment {
  id: string;
  name: string;
  corridor: string;
  type: 'Expressway' | 'Ring Road' | 'Arterial' | 'Flyover' | 'Sub-Arterial';
  coordinates: [number, number][]; // LineString coords [lng, lat]
  congestionLevel: TrafficCongestionLevel;
  avgSpeedKmH: number;
  speedLimitKmH: number;
  travelTimeMin: number;
  normalTimeMin: number;
  lengthKm: number;
  activeIncidentsCount: number;
  flowVehiclesPerHour: number;
}

export type IncidentType = 'Breakdown' | 'Accident' | 'Construction' | 'Waterlogging' | 'Congestion Spill';
export type IncidentSeverity = 'Minor' | 'Moderate' | 'Critical';

export interface TrafficIncident {
  id: string;
  roadName: string;
  locality: string;
  type: IncidentType;
  severity: IncidentSeverity;
  description: string;
  coordinates: [number, number]; // [lng, lat]
  reportedAt: string;
  estimatedClearance: string;
  laneImpact: string;
}

export interface CitySummary {
  overallAQI: number;
  overallAQICategory: AQICategory;
  avgCongestionPercent: number;
  avgSpeedKmH: number;
  highPollutionZonesCount: number;
  highCongestionRoadsCount: number;
  activeIncidentsCount: number;
  reportingStationsCount: number;
  totalStationsCount: number;
  lastUpdated: string;
}

export interface HourlyMetric {
  time: string;
  aqi: number;
  congestion: number; // 0 - 100%
  speed: number;      // km/h
  pm25: number;
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
