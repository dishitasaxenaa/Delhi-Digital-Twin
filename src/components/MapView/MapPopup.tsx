import React from 'react';
import { 
  X, 
  Wind, 
  Car, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  ArrowRight,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { SelectedFeature } from '../../types';
import { getAQIColor, getAQIBadgeClass } from '../../services/aqiService';
import { getCongestionColor, getCongestionBadgeClass } from '../../services/trafficService';

interface MapPopupProps {
  selectedFeature: SelectedFeature;
  onClose: () => void;
  onNavigateToSimulation?: (roadName: string) => void;
}

export const MapPopup: React.FC<MapPopupProps> = ({
  selectedFeature,
  onClose,
  onNavigateToSimulation,
}) => {
  if (!selectedFeature) return null;

  return (
    <div className="absolute top-5 right-5 z-20 w-88 max-w-[calc(100vw-40px)] bg-[#080c14]/95 border border-[#1f2e4d] rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden text-xs text-slate-200 select-none animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-auto">
      {/* ======================================================== */}
      {/* 1. AQI STATION POPUP */}
      {/* ======================================================== */}
      {selectedFeature.type === 'station' && (
        <div>
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#111827] to-[#131e33] border-b border-[#1f2e4d] flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold font-mono text-sm shadow-md"
                style={{ backgroundColor: getAQIColor(selectedFeature.data.category) }}
              >
                <Wind size={16} />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">
                    CPCB CAAQMS Station
                  </span>
                  {selectedFeature.data.isLive && (
                    <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                      LIVE
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-100 text-sm leading-tight">
                  {selectedFeature.data.name}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-3.5 space-y-3">
            {/* Locality & District */}
            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
              <MapPin size={13} className="text-cyan-400 flex-shrink-0" />
              <span className="truncate">{selectedFeature.data.locality}, {selectedFeature.data.district}</span>
            </div>

            {/* Main AQI Value Banner */}
            <div className="p-3 rounded-xl bg-[#0d1524] border border-[#1f2e4d] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Air Quality Index
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-mono font-extrabold text-white">
                    {selectedFeature.data.aqi > 0 ? selectedFeature.data.aqi : '--'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">NAQI</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold tracking-wide ${getAQIBadgeClass(selectedFeature.data.category)}`}>
                  {selectedFeature.data.category}
                </span>
                <span className="text-[9px] text-slate-400 font-mono block mt-1">
                  Dominant: {selectedFeature.data.dominantPollutant}
                </span>
              </div>
            </div>

            {/* Pollutants Breakdown Grid */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">
                  Sensor Pollutants Telemetry
                </span>
                {selectedFeature.data.isCalculated && (
                  <span className="text-[9px] font-mono text-cyan-400 flex items-center gap-1">
                    <CheckCircle2 size={10} />
                    <span>CPCB NAQI Method</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-1.5 font-mono text-center">
                <div className="p-2 rounded-lg bg-[#131e33] border border-[#1f2e4d]">
                  <span className="text-[9px] text-slate-400 block">PM2.5</span>
                  <span className="text-xs font-bold text-rose-400 block mt-0.5">
                    {selectedFeature.data.pm25 !== null && selectedFeature.data.pm25 !== undefined ? selectedFeature.data.pm25 : '--'}
                  </span>
                  <span className="text-[8px] text-slate-500">µg/m³</span>
                </div>
                <div className="p-2 rounded-lg bg-[#131e33] border border-[#1f2e4d]">
                  <span className="text-[9px] text-slate-400 block">PM10</span>
                  <span className="text-xs font-bold text-orange-400 block mt-0.5">
                    {selectedFeature.data.pm10 !== null && selectedFeature.data.pm10 !== undefined ? selectedFeature.data.pm10 : '--'}
                  </span>
                  <span className="text-[8px] text-slate-500">µg/m³</span>
                </div>
                <div className="p-2 rounded-lg bg-[#131e33] border border-[#1f2e4d]">
                  <span className="text-[9px] text-slate-400 block">NO2</span>
                  <span className="text-xs font-bold text-amber-400 block mt-0.5">
                    {selectedFeature.data.no2 !== null && selectedFeature.data.no2 !== undefined ? selectedFeature.data.no2 : '--'}
                  </span>
                  <span className="text-[8px] text-slate-500">µg/m³</span>
                </div>
                <div className="p-2 rounded-lg bg-[#131e33] border border-[#1f2e4d]">
                  <span className="text-[9px] text-slate-400 block">CO</span>
                  <span className="text-xs font-bold text-slate-200 block mt-0.5">
                    {selectedFeature.data.co !== null && selectedFeature.data.co !== undefined ? selectedFeature.data.co : '--'}
                  </span>
                  <span className="text-[8px] text-slate-500">mg/m³</span>
                </div>
                <div className="p-2 rounded-lg bg-[#131e33] border border-[#1f2e4d]">
                  <span className="text-[9px] text-slate-400 block">O3</span>
                  <span className="text-xs font-bold text-cyan-300 block mt-0.5">
                    {selectedFeature.data.o3 !== null && selectedFeature.data.o3 !== undefined ? selectedFeature.data.o3 : '--'}
                  </span>
                  <span className="text-[8px] text-slate-500">µg/m³</span>
                </div>
                <div className="p-2 rounded-lg bg-[#131e33] border border-[#1f2e4d]">
                  <span className="text-[9px] text-slate-400 block">SO2</span>
                  <span className="text-xs font-bold text-slate-200 block mt-0.5">
                    {selectedFeature.data.so2 !== null && selectedFeature.data.so2 !== undefined ? selectedFeature.data.so2 : '--'}
                  </span>
                  <span className="text-[8px] text-slate-500">µg/m³</span>
                </div>
              </div>
            </div>

            {/* Footer / Timestamp */}
            <div className="pt-2 border-t border-[#1f2e4d] flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Clock size={11} className="text-cyan-400" />
                <span>{selectedFeature.data.timestamp}</span>
              </span>
              <span className="text-slate-500 truncate max-w-[140px]" title={selectedFeature.data.source}>
                {selectedFeature.data.source}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ROAD CORRIDOR POPUP */}
      {/* ======================================================== */}
      {selectedFeature.type === 'road' && (
        <div>
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#111827] to-[#131e33] border-b border-[#1f2e4d] flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold font-mono text-sm shadow-md"
                style={{ backgroundColor: getCongestionColor(selectedFeature.data.congestionLevel) }}
              >
                <Car size={16} />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 block">
                    {selectedFeature.data.type} Corridor
                  </span>
                  {selectedFeature.data.isLive ? (
                    <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                      LIVE SENSOR
                    </span>
                  ) : (
                    <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                      FLOW BASELINE
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-slate-100 text-sm leading-tight">
                  {selectedFeature.data.name}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-3.5 space-y-3">
            {/* Corridor Subtitle */}
            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px]">
              <MapPin size={13} className="text-cyan-400 flex-shrink-0" />
              <span className="truncate">{selectedFeature.data.corridor}</span>
            </div>

            {/* Main Speed & Congestion Card */}
            <div className="p-3 rounded-xl bg-[#0d1524] border border-[#1f2e4d] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  Current Observed Speed
                </span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-mono font-extrabold text-white">
                    {selectedFeature.data.avgSpeedKmH}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">km/h</span>
                </div>
                <span className="text-[9px] text-slate-500 font-mono block">
                  Free-Flow: {selectedFeature.data.freeFlowSpeedKmH || selectedFeature.data.speedLimitKmH} km/h
                </span>
              </div>
              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold tracking-wide ${getCongestionBadgeClass(selectedFeature.data.congestionLevel)}`}>
                  {selectedFeature.data.congestionLevel} Congestion
                </span>
                <span className="text-[9px] text-cyan-400 font-mono block mt-1">
                  Speed Ratio: {Math.round((selectedFeature.data.congestionRatio || (selectedFeature.data.avgSpeedKmH / (selectedFeature.data.freeFlowSpeedKmH || 60))) * 100)}%
                </span>
              </div>
            </div>

            {/* Travel Time Comparison */}
            <div className="grid grid-cols-2 gap-2 font-mono">
              <div className="p-2.5 rounded-lg bg-[#131e33] border border-[#1f2e4d]">
                <span className="text-[9px] text-slate-400 block">Current Travel Time</span>
                <span className="text-base font-bold text-amber-400 block mt-0.5">
                  {selectedFeature.data.travelTimeMin} min
                </span>
                <span className="text-[8px] text-rose-400 block">
                  +{Math.max(0, Math.round(selectedFeature.data.travelTimeMin - selectedFeature.data.normalTimeMin))} min delay
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#131e33] border border-[#1f2e4d]">
                <span className="text-[9px] text-slate-400 block">Free Flow Time</span>
                <span className="text-base font-bold text-emerald-400 block mt-0.5">
                  {selectedFeature.data.normalTimeMin} min
                </span>
                <span className="text-[8px] text-slate-400 block">
                  Length: {selectedFeature.data.lengthKm} km
                </span>
              </div>
            </div>

            {/* Active Incidents Alert on this corridor */}
            {selectedFeature.data.activeIncidentsCount > 0 && (
              <div className="p-2 rounded-lg bg-red-950/40 border border-red-500/40 flex items-center space-x-2 text-[11px] text-red-300">
                <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                <span>
                  {selectedFeature.data.activeIncidentsCount} active incident(s) reported on this stretch
                </span>
              </div>
            )}

            {/* Source info */}
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
              <span>Data Source:</span>
              <span className="text-cyan-400">{selectedFeature.data.source || 'TomTom / OSM Mesh'}</span>
            </div>

            {/* Action button: Send to Simulation Lab */}
            {onNavigateToSimulation && (
              <button
                onClick={() => onNavigateToSimulation(selectedFeature.data.name)}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-cyan-600/20"
              >
                <Compass size={14} />
                <span>Ask What-If Analysis</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. TRAFFIC INCIDENT POPUP */}
      {/* ======================================================== */}
      {selectedFeature.type === 'incident' && (
        <div>
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#1f1510] to-[#131e33] border-b border-[#1f2e4d] flex items-start justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold font-mono text-sm shadow-md">
                <AlertTriangle size={16} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 block">
                  Active Traffic Incident
                </span>
                <h3 className="font-bold text-slate-100 text-sm leading-tight">
                  {selectedFeature.data.type}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-3.5 space-y-3">
            <div>
              <span className="font-semibold text-slate-100 block">{selectedFeature.data.roadName}</span>
              <span className="text-[11px] text-slate-400 block mt-0.5">{selectedFeature.data.locality}</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0d1524] border border-[#1f2e4d]">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Dispatch Summary
              </span>
              <p className="text-slate-200 leading-relaxed text-[11px]">
                {selectedFeature.data.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-300 font-mono text-[10px]">
              <div className="p-2 rounded-lg bg-[#131e33] border border-[#1f2e4d]">
                <span className="text-slate-400 block">Lane Impact:</span>
                <span className="text-amber-400 font-semibold block mt-0.5">
                  {selectedFeature.data.laneImpact}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-[#131e33] border border-[#1f2e4d]">
                <span className="text-slate-400 block">Severity:</span>
                <span className={`font-semibold block mt-0.5 ${
                  selectedFeature.data.severity === 'Critical' ? 'text-red-400' : 'text-amber-400'
                }`}>
                  {selectedFeature.data.severity}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#1f2e4d] flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>Reported: {selectedFeature.data.reportedAt}</span>
              <span className="text-cyan-400">Est. Clearance: {selectedFeature.data.estimatedClearance}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
