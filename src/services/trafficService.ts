import { TrafficCongestionLevel, RoadSegment, TrafficIncident } from '../types';
import { delhiRoads } from '../data/delhiRoads';
import { delhiIncidents } from '../data/delhiIncidents';

export function getCongestionColor(level: TrafficCongestionLevel): string {
  switch (level) {
    case 'Low':
      return '#10b981'; // Green
    case 'Moderate':
      return '#facc15'; // Yellow
    case 'High':
      return '#f97316'; // Orange
    case 'Severe':
      return '#ef4444'; // Red
  }
}

export function getCongestionBadgeClass(level: TrafficCongestionLevel): string {
  switch (level) {
    case 'Low':
      return 'bg-emerald-950/70 text-emerald-400 border border-emerald-500/40';
    case 'Moderate':
      return 'bg-amber-950/70 text-amber-300 border border-amber-500/40';
    case 'High':
      return 'bg-orange-950/70 text-orange-400 border border-orange-500/40';
    case 'Severe':
      return 'bg-red-950/80 text-red-400 border border-red-500/50 animate-pulse';
  }
}

export function getAllRoads(): RoadSegment[] {
  return delhiRoads;
}

export function getRoadById(id: string): RoadSegment | undefined {
  return delhiRoads.find((r) => r.id === id);
}

export function getAllIncidents(): TrafficIncident[] {
  return delhiIncidents;
}

export function getRoadsGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: delhiRoads.map((road) => ({
      type: 'Feature' as const,
      id: road.id,
      properties: {
        id: road.id,
        name: road.name,
        corridor: road.corridor,
        type: road.type,
        congestionLevel: road.congestionLevel,
        avgSpeedKmH: road.avgSpeedKmH,
        speedLimitKmH: road.speedLimitKmH,
        travelTimeMin: road.travelTimeMin,
        normalTimeMin: road.normalTimeMin,
        lengthKm: road.lengthKm,
        activeIncidentsCount: road.activeIncidentsCount,
        flowVehiclesPerHour: road.flowVehiclesPerHour,
        color: getCongestionColor(road.congestionLevel),
      },
      geometry: {
        type: 'LineString' as const,
        coordinates: road.coordinates,
      },
    })),
  };
}

export function getIncidentsGeoJSON() {
  return {
    type: 'FeatureCollection' as const,
    features: delhiIncidents.map((incident) => ({
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
      },
      geometry: {
        type: 'Point' as const,
        coordinates: incident.coordinates,
      },
    })),
  };
}
