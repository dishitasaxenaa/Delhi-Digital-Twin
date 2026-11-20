import { TrafficCongestionLevel, RoadSegment, TrafficIncident } from '../types';
import { delhiRoads } from '../data/delhiRoads';
import { delhiIncidents } from '../data/delhiIncidents';

export function getCongestionColor(level: TrafficCongestionLevel | string): string {
  switch (level) {
    case 'Low':
      return '#10b981'; // Green
    case 'Moderate':
      return '#facc15'; // Yellow
    case 'High':
      return '#f97316'; // Orange
    case 'Severe':
      return '#ef4444'; // Red
    default:
      return '#64748b';
  }
}

export function getCongestionBadgeClass(level: TrafficCongestionLevel | string): string {
  switch (level) {
    case 'Low':
      return 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/40';
    case 'Moderate':
      return 'bg-amber-950/70 text-amber-300 border border-amber-500/40';
    case 'High':
      return 'bg-orange-950/70 text-orange-400 border border-orange-500/40';
    case 'Severe':
      return 'bg-red-950/80 text-red-400 border border-red-500/50 animate-pulse';
    default:
      return 'bg-slate-800 text-slate-300 border border-slate-700';
  }
}

export function getAllRoads(): RoadSegment[] {
  return delhiRoads;
}

export function getRoadById(id: string, customRoads?: RoadSegment[]): RoadSegment | undefined {
  const list = customRoads && customRoads.length > 0 ? customRoads : delhiRoads;
  return list.find((r) => r.id === id);
}

export function getAllIncidents(): TrafficIncident[] {
  return delhiIncidents;
}

export function getRoadsGeoJSON(customRoads?: RoadSegment[]) {
  const roads = customRoads && customRoads.length > 0 ? customRoads : delhiRoads;
  return {
    type: 'FeatureCollection' as const,
    features: roads.map((road) => ({
      type: 'Feature' as const,
      id: road.id,
      properties: {
        id: road.id,
        name: road.name,
        corridor: road.corridor,
        type: road.type,
        congestionLevel: road.congestionLevel,
        avgSpeedKmH: road.avgSpeedKmH,
        freeFlowSpeedKmH: road.freeFlowSpeedKmH,
        speedLimitKmH: road.speedLimitKmH,
        travelTimeMin: road.travelTimeMin,
        normalTimeMin: road.normalTimeMin,
        lengthKm: road.lengthKm,
        activeIncidentsCount: road.activeIncidentsCount,
        flowVehiclesPerHour: road.flowVehiclesPerHour,
        color: getCongestionColor(road.congestionLevel),
        source: road.source,
        isLive: road.isLive,
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: road.coordinates,
      },
    })),
  };
}

export function getIncidentsGeoJSON(customIncidents?: TrafficIncident[]) {
  const incidents = customIncidents && customIncidents.length > 0 ? customIncidents : delhiIncidents;
  return {
    type: 'FeatureCollection' as const,
    features: incidents.map((incident) => ({
      type: 'Feature' as const,
      id: incident.id,
      properties: {
        id: incident.id,
        roadName: incident.roadName,
        locality: incident.locality,
        type: incident.type,
        severity: incident.severity,
        description: incident.description,
        reportedAt: incident.reportedAt,
        estimatedClearance: incident.estimatedClearance,
        laneImpact: incident.laneImpact,
        source: incident.source,
        isLive: incident.isLive,
      },
      geometry: {
        type: 'Point' as const,
        coordinates: incident.coordinates,
      },
    })),
  };
}
