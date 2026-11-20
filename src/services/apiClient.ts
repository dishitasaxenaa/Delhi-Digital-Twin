import { AQIStation, RoadSegment, TrafficIncident, CitySummary } from '../types';

const API_BASE = '/api';

export interface AQIApiResponse {
  stations: AQIStation[];
  totalStations: number;
  reportingStations: number;
  overallAQI: number;
  overallCategory: string;
  lastUpdated: string;
  source: string;
  status: string;
  errorMessage?: string;
}

export interface TrafficApiResponse {
  roads: RoadSegment[];
  incidents: TrafficIncident[];
  totalRoads: number;
  averageSpeedKmH: number;
  averageCongestionPercent: number;
  highCongestionRoadsCount: number;
  lastUpdated: string;
  source: string;
  status: string;
  errorMessage?: string;
}

export async function fetchLiveAQI(forceRefresh = false): Promise<AQIApiResponse> {
  const url = `${API_BASE}/aqi${forceRefresh ? '?force_refresh=true' : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`AQI API responded with ${res.status}: ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchLiveTraffic(forceRefresh = false): Promise<TrafficApiResponse> {
  const url = `${API_BASE}/traffic${forceRefresh ? '?force_refresh=true' : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Traffic API responded with ${res.status}: ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchCitySummary(): Promise<CitySummary> {
  const res = await fetch(`${API_BASE}/city/summary`);
  if (!res.ok) {
    throw new Error(`City Summary API responded with ${res.status}: ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchAQIHistory(hours = 24, stationId?: string): Promise<any[]> {
  const query = new URLSearchParams({ hours: hours.toString() });
  if (stationId) query.append('station_id', stationId);
  const res = await fetch(`${API_BASE}/history/aqi?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`History API responded with ${res.status}`);
  }
  return await res.json();
}
