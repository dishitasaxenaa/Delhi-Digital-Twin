import { useState, useEffect, useCallback, useRef } from 'react';
import { AQIStation, RoadSegment, TrafficIncident, CitySummary } from '../types';
import { fetchLiveAQI, fetchLiveTraffic, fetchCitySummary } from '../services/apiClient';
import { delhiStations } from '../data/delhiStations';
import { delhiRoads } from '../data/delhiRoads';
import { delhiIncidents } from '../data/delhiIncidents';
import { initialCitySummary } from '../data/cityInsightsData';

const TRAFFIC_REFRESH_MS = 120_000;  // 2 minutes
const AQI_REFRESH_MS = 900_000;      // 15 minutes

export function useTelemetry() {
  const [stations, setStations] = useState<AQIStation[]>(delhiStations);
  const [roads, setRoads] = useState<RoadSegment[]>(delhiRoads);
  const [incidents, setIncidents] = useState<TrafficIncident[]>(delhiIncidents);
  const [citySummary, setCitySummary] = useState<CitySummary>(initialCitySummary);

  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Connecting to Telemetry...');
  const [aqiSource, setAqiSource] = useState<string>('Live CPCB / Open-Meteo Mesh');
  const [trafficSource, setTrafficSource] = useState<string>('TomTom Traffic API');
  const [aqiStatus, setAqiStatus] = useState<string>('CONNECTING');
  const [trafficStatus, setTrafficStatus] = useState<string>('CONNECTING');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);

  const loadData = useCallback(async (force = false) => {
    try {
      setIsRefreshing(true);
      const [aqiRes, trafficRes, summaryRes] = await Promise.allSettled([
        fetchLiveAQI(force),
        fetchLiveTraffic(force),
        fetchCitySummary(),
      ]);

      if (!isMountedRef.current) return;

      // Process AQI response
      if (aqiRes.status === 'fulfilled') {
        const val = aqiRes.value;
        if (val.stations && val.stations.length > 0) {
          setStations(val.stations);
        }
        setAqiSource(val.source || 'Live CPCB Mesh');
        setAqiStatus(val.status || 'LIVE');
        if (val.errorMessage) setErrorMessage(val.errorMessage);
      } else {
        setAqiStatus('OFFLINE');
      }

      // Process Traffic response
      if (trafficRes.status === 'fulfilled') {
        const val = trafficRes.value;
        if (val.roads && val.roads.length > 0) {
          setRoads(val.roads);
        }
        if (val.incidents) {
          setIncidents(val.incidents);
        }
        setTrafficSource(val.source || 'TomTom Traffic API');
        setTrafficStatus(val.status || 'LIVE');
      } else {
        setTrafficStatus('OFFLINE');
      }

      // Process City Summary response
      if (summaryRes.status === 'fulfilled') {
        setCitySummary(summaryRes.value);
        setLastUpdated(summaryRes.value.lastUpdated || new Date().toLocaleTimeString());
      } else {
        setLastUpdated(new Date().toLocaleTimeString());
      }

    } catch (err: any) {
      if (isMountedRef.current) {
        setErrorMessage(err.message || 'Telemetry connection error');
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    loadData(false);

    // Automatic polling timers
    const trafficTimer = setInterval(() => {
      loadData(false);
    }, TRAFFIC_REFRESH_MS);

    const aqiTimer = setInterval(() => {
      loadData(false);
    }, AQI_REFRESH_MS);

    return () => {
      isMountedRef.current = false;
      clearInterval(trafficTimer);
      clearInterval(aqiTimer);
    };
  }, [loadData]);

  return {
    stations,
    roads,
    incidents,
    citySummary,
    loading,
    isRefreshing,
    lastUpdated,
    aqiSource,
    trafficSource,
    aqiStatus,
    trafficStatus,
    errorMessage,
    refreshData: () => loadData(true),
  };
}
