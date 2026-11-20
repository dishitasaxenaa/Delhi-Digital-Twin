import { AQICategory, AQIStation } from '../types';
import { delhiStations } from '../data/delhiStations';

export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 0) return 'Unavailable';
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Satisfactory';
  if (aqi <= 200) return 'Moderate';
  if (aqi <= 300) return 'Poor';
  if (aqi <= 400) return 'Very Poor';
  return 'Severe';
}

export function getAQIColor(value: number | AQICategory): string {
  const category = typeof value === 'number' ? getAQICategory(value) : value;
  switch (category) {
    case 'Good':
      return '#10b981'; // Green
    case 'Satisfactory':
      return '#84cc16'; // Light Green
    case 'Moderate':
      return '#eab308'; // Yellow
    case 'Poor':
      return '#f97316'; // Orange
    case 'Very Poor':
      return '#ef4444'; // Red
    case 'Severe':
      return '#881337'; // Deep Maroon
    default:
      return '#64748b';
  }
}

export function getAQIBadgeClass(category: AQICategory | string): string {
  switch (category) {
    case 'Good':
      return 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/40';
    case 'Satisfactory':
      return 'bg-lime-950/70 text-lime-400 border border-lime-500/40';
    case 'Moderate':
      return 'bg-amber-950/70 text-amber-300 border border-amber-500/40';
    case 'Poor':
      return 'bg-orange-950/70 text-orange-400 border border-orange-500/40';
    case 'Very Poor':
      return 'bg-red-950/70 text-red-400 border border-red-500/40';
    case 'Severe':
      return 'bg-rose-950/90 text-rose-300 border border-rose-600/60 animate-pulse';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-700';
  }
}

export function getAllStations(): AQIStation[] {
  return delhiStations;
}

export function getStationById(id: string, customList?: AQIStation[]): AQIStation | undefined {
  const list = customList && customList.length > 0 ? customList : delhiStations;
  return list.find((s) => s.id === id);
}

// Convert stations to GeoJSON Point FeatureCollection for MapLibre
export function getStationsGeoJSON(customStations?: AQIStation[]) {
  const stations = customStations && customStations.length > 0 ? customStations : delhiStations;
  return {
    type: 'FeatureCollection' as const,
    features: stations.map((station) => ({
      type: 'Feature' as const,
      id: station.id,
      properties: {
        id: station.id,
        name: station.name,
        locality: station.locality,
        district: station.district,
        aqi: station.aqi,
        category: station.category,
        pm25: station.pm25,
        pm10: station.pm10,
        no2: station.no2,
        co: station.co,
        o3: station.o3,
        so2: station.so2,
        dominantPollutant: station.dominantPollutant,
        timestamp: station.timestamp,
        source: station.source,
        isLive: station.isLive,
        isCalculated: station.isCalculated,
        weight: Math.min(Math.max((station.aqi - 50) / 450, 0.1), 1.0),
      },
      geometry: {
        type: 'Point' as const,
        coordinates: station.coordinates,
      },
    })),
  };
}

// Generate interpolated AQI grid points across NCT Delhi for smooth heatmap rendering
export function getAQIHeatmapGeoJSON(customStations?: AQIStation[]) {
  const stations = customStations && customStations.length > 0 ? customStations : delhiStations;
  const points: {
    type: 'Feature';
    properties: { aqi: number; weight: number };
    geometry: { type: 'Point'; coordinates: [number, number] };
  }[] = [];

  // Delhi bounding box steps
  const minLng = 76.88;
  const maxLng = 77.34;
  const minLat = 28.43;
  const maxLat = 28.86;

  const latSteps = 16;
  const lngSteps = 18;

  const latDelta = (maxLat - minLat) / latSteps;
  const lngDelta = (maxLng - minLng) / lngSteps;

  for (let i = 0; i <= lngSteps; i++) {
    for (let j = 0; j <= latSteps; j++) {
      const lng = minLng + i * lngDelta;
      const lat = minLat + j * latDelta;

      // Inverse Distance Weighting (IDW) from all reporting stations
      let weightedAqiSum = 0;
      let totalWeight = 0;

      for (const station of stations) {
        if (station.aqi <= 0) continue;
        const dLng = lng - station.coordinates[0];
        const dLat = lat - station.coordinates[1];
        const distSq = dLng * dLng + dLat * dLat;
        const dist = Math.sqrt(distSq);

        // Power parameter p=2.2
        const w = 1 / Math.pow(Math.max(dist, 0.015), 2.2);
        weightedAqiSum += station.aqi * w;
        totalWeight += w;
      }

      const interpolatedAqi = totalWeight > 0 ? Math.round(weightedAqiSum / totalWeight) : 200;
      const normalizedWeight = Math.min(Math.max((interpolatedAqi - 40) / 460, 0.05), 1.0);

      points.push({
        type: 'Feature',
        properties: {
          aqi: interpolatedAqi,
          weight: normalizedWeight,
        },
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
      });
    }
  }

  // Also include the actual station points with high weight
  for (const st of stations) {
    if (st.aqi <= 0) continue;
    points.push({
      type: 'Feature',
      properties: {
        aqi: st.aqi,
        weight: Math.min(Math.max((st.aqi - 40) / 460, 0.1), 1.0),
      },
      geometry: {
        type: 'Point',
        coordinates: st.coordinates,
      },
    });
  }

  return {
    type: 'FeatureCollection' as const,
    features: points,
  };
}
