import React, { useState } from 'react';
import { 
  Car, 
  Wind, 
  Map as MapIcon, 
  AlertTriangle, 
  Gauge, 
  Layers, 
  ChevronDown, 
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Info
} from 'lucide-react';
import { 
  MapLayerState, 
  MapStyleType, 
  TrafficCongestionLevel, 
  AQICategory,
  TrafficIncident,
  AQIStation 
} from '../../types';
import { getAllIncidents } from '../../services/trafficService';
import { getAllStations } from '../../services/aqiService';

interface LeftSidebarProps {
  layers: MapLayerState;
  onToggleLayer: (layerKey: keyof MapLayerState) => void;
  mapStyle: MapStyleType;
  onSetMapStyle: (style: MapStyleType) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onSelectIncident: (incident: TrafficIncident) => void;
  onSelectStation: (station: AQIStation) => void;
  selectedCongestionFilter: TrafficCongestionLevel | 'All';
  setSelectedCongestionFilter: (filter: TrafficCongestionLevel | 'All') => void;
  selectedAQIFilter: AQICategory | 'All';
  setSelectedAQIFilter: (filter: AQICategory | 'All') => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  layers,
  onToggleLayer,
  mapStyle,
  onSetMapStyle,
  onZoomIn,
  onZoomOut,
  onResetView,
  onSelectIncident,
  onSelectStation,
  selectedCongestionFilter,
  setSelectedCongestionFilter,
  selectedAQIFilter,
  setSelectedAQIFilter,
}) => {
  const [trafficExpanded, setTrafficExpanded] = useState<boolean>(true);
  const [aqiExpanded, setAqiExpanded] = useState<boolean>(true);
  const [mapControlsExpanded, setMapControlsExpanded] = useState<boolean>(true);
  const [incidentsListExpanded, setIncidentsListExpanded] = useState<boolean>(false);
  const [stationSearch, setStationSearch] = useState<string>('');

  const incidents = getAllIncidents();
  const stations = getAllStations();

  const filteredStations = stationSearch.trim()
    ? stations.filter(s => 
        s.name.toLowerCase().includes(stationSearch.toLowerCase()) || 
        s.district.toLowerCase().includes(stationSearch.toLowerCase()) ||
        s.locality.toLowerCase().includes(stationSearch.toLowerCase())
      )
    : stations.slice(0, 5); // default top 5

  return (
    <aside className="w-80 md:w-88 h-full bg-[#080c14]/95 border-r border-[#1f2e4d] flex flex-col overflow-hidden backdrop-blur-md z-20 transition-all select-none">
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-[#1f2e4d] flex items-center justify-between bg-[#0d1524]">
        <div className="flex items-center space-x-2">
          <Layers className="text-cyan-400" size={16} />
          <span className="text-xs font-semibold tracking-wider text-slate-200 uppercase font-mono">
            Monitoring Controls
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
          DELHI NCT
        </span>
      </div>

      {/* Scrollable Controls Container */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3.5 text-slate-200 text-xs">
        
        {/* ======================================================== */}
        {/* SECTION 1: TRAFFIC MONITORING */}
        {/* ======================================================== */}
        <div className="bg-[#0d1524] rounded-xl border border-[#1f2e4d] overflow-hidden shadow-sm">
          <div 
            onClick={() => setTrafficExpanded(!trafficExpanded)}
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#131e33] transition-colors border-b border-[#1f2e4d]/60"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Car size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-xs tracking-wide">Traffic Monitoring</h3>
                <p className="text-[10px] text-slate-400 font-mono">Speed, Arterials & Incidents</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <label 
                className="relative inline-flex items-center cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <input 
                  type="checkbox" 
                  checked={layers.traffic} 
                  onChange={() => onToggleLayer('traffic')}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              {trafficExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
            </div>
          </div>

          {trafficExpanded && (
            <div className="p-3 space-y-3 bg-[#0a0f1c]/50">
              {/* Avg Speed & Status Indicator */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-[#131e33]/80 border border-[#1f2e4d]">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                    <span>Average Speed</span>
                    <Gauge size={12} className="text-cyan-400" />
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-lg font-mono font-bold text-white">25.2</span>
                    <span className="text-[10px] text-slate-400 font-mono">km/h</span>
                  </div>
                  <div className="text-[9px] text-orange-400 font-mono mt-0.5 flex items-center gap-1">
                    <span>↓ 38% vs free flow</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#131e33]/80 border border-[#1f2e4d]">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                    <span>Network Congestion</span>
                    <Car size={12} className="text-amber-400" />
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-lg font-mono font-bold text-amber-400">66%</span>
                    <span className="text-[10px] text-slate-400 font-mono">Index</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                    High Peak Demand
                  </div>
                </div>
              </div>

              {/* Congestion Levels Legend & Interactive Filter */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Filter size={11} className="text-cyan-400" />
                    <span>Congestion Levels</span>
                  </span>
                  {selectedCongestionFilter !== 'All' && (
                    <button 
                      onClick={() => setSelectedCongestionFilter('All')}
                      className="text-[10px] text-cyan-400 hover:underline font-mono"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                  <button
                    onClick={() => setSelectedCongestionFilter(selectedCongestionFilter === 'Low' ? 'All' : 'Low')}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded border transition-all ${
                      selectedCongestionFilter === 'Low'
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-[#131e33] border-[#1f2e4d] hover:border-emerald-500/50 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981] inline-block shadow-sm shadow-emerald-500/50"></span>
                      <span>Low</span>
                    </span>
                    <span className="text-[10px] text-slate-400">&gt;45 km/h</span>
                  </button>

                  <button
                    onClick={() => setSelectedCongestionFilter(selectedCongestionFilter === 'Moderate' ? 'All' : 'Moderate')}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded border transition-all ${
                      selectedCongestionFilter === 'Moderate'
                        ? 'bg-yellow-950/80 border-yellow-400 text-yellow-300 ring-1 ring-yellow-400'
                        : 'bg-[#131e33] border-[#1f2e4d] hover:border-yellow-500/50 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#facc15] inline-block shadow-sm shadow-yellow-500/50"></span>
                      <span>Moderate</span>
                    </span>
                    <span className="text-[10px] text-slate-400">30-45 km/h</span>
                  </button>

                  <button
                    onClick={() => setSelectedCongestionFilter(selectedCongestionFilter === 'High' ? 'All' : 'High')}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded border transition-all ${
                      selectedCongestionFilter === 'High'
                        ? 'bg-orange-950/80 border-orange-400 text-orange-300 ring-1 ring-orange-400'
                        : 'bg-[#131e33] border-[#1f2e4d] hover:border-orange-500/50 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#f97316] inline-block shadow-sm shadow-orange-500/50"></span>
                      <span>High</span>
                    </span>
                    <span className="text-[10px] text-slate-400">18-30 km/h</span>
                  </button>

                  <button
                    onClick={() => setSelectedCongestionFilter(selectedCongestionFilter === 'Severe' ? 'All' : 'Severe')}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded border transition-all ${
                      selectedCongestionFilter === 'Severe'
                        ? 'bg-red-950/80 border-red-400 text-red-300 ring-1 ring-red-400'
                        : 'bg-[#131e33] border-[#1f2e4d] hover:border-red-500/50 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444] inline-block shadow-sm shadow-red-500/50 animate-pulse"></span>
                      <span>Severe</span>
                    </span>
                    <span className="text-[10px] text-slate-400">&lt;18 km/h</span>
                  </button>
                </div>
              </div>

              {/* Traffic Incidents Section */}
              <div className="pt-2 border-t border-[#1f2e4d]/70">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle size={13} className="text-amber-400" />
                    <span className="font-semibold text-slate-200 text-xs">Traffic Incidents</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-red-950/80 text-red-400 border border-red-800/40">
                      {incidents.length} Active
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={layers.incidents} 
                      onChange={() => onToggleLayer('incidents')}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-3.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-amber-500"></div>
                  </label>
                </div>

                <button
                  onClick={() => setIncidentsListExpanded(!incidentsListExpanded)}
                  className="w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#131e33] hover:bg-[#1a2942] border border-[#1f2e4d] text-[11px] font-mono text-slate-300 transition-colors"
                >
                  <span>{incidentsListExpanded ? 'Hide Incidents List' : 'View Delhi Incidents (' + incidents.length + ')'}</span>
                  {incidentsListExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </button>

                {incidentsListExpanded && (
                  <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                    {incidents.map((inc) => (
                      <div
                        key={inc.id}
                        onClick={() => onSelectIncident(inc)}
                        className="p-2 rounded-lg bg-[#131e33]/90 hover:bg-[#1a2942] border border-[#1f2e4d] hover:border-amber-500/50 cursor-pointer transition-all text-[11px]"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-100 truncate pr-2">{inc.roadName}</span>
                          <span className={`px-1 py-0.2 text-[9px] font-mono rounded ${
                            inc.severity === 'Critical' ? 'bg-red-950 text-red-400 border border-red-800/50' : 'bg-amber-950 text-amber-400'
                          }`}>
                            {inc.type}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-1">{inc.locality}</p>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 mt-1">
                          <span>Reported: {inc.reportedAt}</span>
                          <span className="text-cyan-400 hover:underline">Locate ↗</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* SECTION 2: AIR QUALITY (AQI) MONITORING */}
        {/* ======================================================== */}
        <div className="bg-[#0d1524] rounded-xl border border-[#1f2e4d] overflow-hidden shadow-sm">
          <div 
            onClick={() => setAqiExpanded(!aqiExpanded)}
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#131e33] transition-colors border-b border-[#1f2e4d]/60"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
                <Wind size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-xs tracking-wide">Air Quality Monitoring</h3>
                <p className="text-[10px] text-slate-400 font-mono">Heatmap, PM2.5/PM10 & CPCB</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <label 
                className="relative inline-flex items-center cursor-pointer"
                onClick={(e) => e.stopPropagation()}
              >
                <input 
                  type="checkbox" 
                  checked={layers.aqiHeatmap} 
                  onChange={() => onToggleLayer('aqiHeatmap')}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
              {aqiExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
            </div>
          </div>

          {aqiExpanded && (
            <div className="p-3 space-y-3 bg-[#0a0f1c]/50">
              {/* Particulate Matter Display Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-[#131e33]/80 border border-[#1f2e4d]">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                    <span>City PM2.5 Avg</span>
                    <span className="text-[9px] font-mono text-rose-400">Severe</span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-lg font-mono font-bold text-rose-400">278.4</span>
                    <span className="text-[10px] text-slate-400 font-mono">µg/m³</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                    Std: 60 µg/m³ (4.6x)
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#131e33]/80 border border-[#1f2e4d]">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] mb-1">
                    <span>City PM10 Avg</span>
                    <span className="text-[9px] font-mono text-orange-400">Very Poor</span>
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-lg font-mono font-bold text-orange-400">382.1</span>
                    <span className="text-[10px] text-slate-400 font-mono">µg/m³</span>
                  </div>
                  <div className="text-[9px] text-slate-400 font-mono mt-0.5">
                    Std: 100 µg/m³ (3.8x)
                  </div>
                </div>
              </div>

              {/* AQI Categories (All 6 Specified Categories) */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-300 mb-1.5">
                  <span className="flex items-center gap-1">
                    <Filter size={11} className="text-cyan-400" />
                    <span>AQI Categories</span>
                  </span>
                  {selectedAQIFilter !== 'All' && (
                    <button 
                      onClick={() => setSelectedAQIFilter('All')}
                      className="text-[10px] text-cyan-400 hover:underline font-mono"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                  <button
                    onClick={() => setSelectedAQIFilter(selectedAQIFilter === 'Good' ? 'All' : 'Good')}
                    className={`flex items-center justify-between px-2 py-1.5 rounded border transition-all ${
                      selectedAQIFilter === 'Good'
                        ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 ring-1 ring-emerald-400'
                        : 'bg-[#131e33] border-[#1f2e4d] hover:border-emerald-500/50 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#10b981] inline-block"></span>
                      <span>Good</span>
                    </span>
                    <span className="text-[10px] text-slate-400">0–50</span>
                  </button>

                  <button
                    onClick={() => setSelectedAQIFilter(selectedAQIFilter === 'Satisfactory' ? 'All' : 'Satisfactory')}
                    className={`flex items-center justify-between px-2 py-1.5 rounded border transition-all ${
                      selectedAQIFilter === 'Satisfactory'
                        ? 'bg-lime-950/80 border-lime-400 text-lime-300 ring-1 ring-lime-400'
                        : 'bg-[#131e33] border-[#1f2e4d] hover:border-lime-500/50 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#84cc16] inline-block"></span>
                      <span>Satisfactory</span>
                    </span>
                    <span className="text-[10px] text-slate-400">51–100</span>
                  </button>

                  <button
                    onClick={() => setSelectedAQIFilter(selectedAQIFilter === 'Moderate' ? 'All' : 'Moderate')}
                    className={`flex items-center justify-between px-2 py-1.5 rounded border transition-all ${
                      selectedAQIFilter === 'Moderate'
                        ? 'bg-amber-950/80 border-amber-400 text-amber-300 ring-1 ring-amber-400'
                        : 'bg-[#131e33] border-[#1f2e4d] hover:border-amber-500/50 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#eab308] inline-block"></span>
                      <span>Moderate</span>
                    </span>
                    <span className="text-[10px] text-slate-400">101–200</span>
                  </button>

                  <button
                    onClick={() => setSelectedAQIFilter(selectedAQIFilter === 'Poor' ? 'All' : 'Poor')}
                    className={`flex items-center justify-between px-2 py-1.5 rounded border transition-all ${
                      selectedAQIFilter === 'Poor'
                        ? 'bg-orange-950/80 border-orange-400 text-orange-300 ring-1 ring-orange-400'
                        : 'bg-[#131e33] border-[#1f2e4d] hover:border-orange-500/50 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#f97316] inline-block"></span>
                      <span>Poor</span>
                    </span>
                    <span className="text-[10px] text-slate-400">201–300</span>
                  </button>

                  <button
                    onClick={() => setSelectedAQIFilter(selectedAQIFilter === 'Very Poor' ? 'All' : 'Very Poor')}
                    className={`flex items-center justify-between px-2 py-1.5 rounded border transition-all ${
                      selectedAQIFilter === 'Very Poor'
                        ? 'bg-red-950/80 border-red-400 text-red-300 ring-1 ring-red-400'
                        : 'bg-[#131e33] border-[#1f2e4d] hover:border-red-500/50 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444] inline-block"></span>
                      <span>Very Poor</span>
                    </span>
                    <span className="text-[10px] text-slate-400">301–400</span>
                  </button>

                  <button
                    onClick={() => setSelectedAQIFilter(selectedAQIFilter === 'Severe' ? 'All' : 'Severe')}
                    className={`flex items-center justify-between px-2 py-1.5 rounded border transition-all ${
                      selectedAQIFilter === 'Severe'
                        ? 'bg-rose-950/90 border-rose-500 text-rose-300 ring-1 ring-rose-500'
                        : 'bg-[#131e33] border-[#1f2e4d] hover:border-rose-500/50 text-slate-300'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm bg-[#881337] inline-block shadow-sm shadow-rose-500/50"></span>
                      <span>Severe</span>
                    </span>
                    <span className="text-[10px] text-slate-400">401–500</span>
                  </button>
                </div>
              </div>

              {/* Station Quick Finder */}
              <div className="pt-2 border-t border-[#1f2e4d]/70">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-200">
                    Find CPCB Station ({stations.length})
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={layers.aqiStations} 
                      onChange={() => onToggleLayer('aqiStations')}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-3.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-2.5 after:w-2.5 after:transition-all peer-checked:bg-cyan-500"></div>
                  </label>
                </div>

                <input
                  type="text"
                  placeholder="Search Anand Vihar, Bawana, RK Puram..."
                  value={stationSearch}
                  onChange={(e) => setStationSearch(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#131e33] border border-[#1f2e4d] text-[11px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 mb-2"
                />

                <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar">
                  {filteredStations.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => onSelectStation(st)}
                      className="p-1.5 rounded bg-[#131e33]/70 hover:bg-[#1a2942] border border-[#1f2e4d] hover:border-cyan-500/50 cursor-pointer flex items-center justify-between transition-colors text-[11px]"
                    >
                      <div className="truncate pr-1">
                        <span className="font-medium text-slate-200 block truncate">{st.name}</span>
                        <span className="text-[9px] text-slate-400 block truncate">{st.district}</span>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          st.aqi > 400 ? 'bg-rose-950 text-rose-300' :
                          st.aqi > 300 ? 'bg-red-950 text-red-300' :
                          st.aqi > 200 ? 'bg-orange-950 text-orange-300' : 'bg-amber-950 text-amber-300'
                        }`}>
                          {st.aqi}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* SECTION 3: MAP CONTROLS & BASEMAP STYLES */}
        {/* ======================================================== */}
        <div className="bg-[#0d1524] rounded-xl border border-[#1f2e4d] overflow-hidden shadow-sm">
          <div 
            onClick={() => setMapControlsExpanded(!mapControlsExpanded)}
            className="p-3 flex items-center justify-between cursor-pointer hover:bg-[#131e33] transition-colors border-b border-[#1f2e4d]/60"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <MapIcon size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-100 text-xs tracking-wide">Map Controls</h3>
                <p className="text-[10px] text-slate-400 font-mono">Layers, Basemaps & Camera</p>
              </div>
            </div>
            {mapControlsExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
          </div>

          {mapControlsExpanded && (
            <div className="p-3 space-y-3 bg-[#0a0f1c]/50">
              {/* Basemap Selection */}
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1.5">
                  Basemap Theme
                </span>
                <div className="grid grid-cols-3 gap-1.5 font-mono text-[10px]">
                  <button
                    onClick={() => onSetMapStyle('dark')}
                    className={`py-1.5 px-2 rounded border transition-colors ${
                      mapStyle === 'dark'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-[#131e33] border-[#1f2e4d] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Dark Matter
                  </button>
                  <button
                    onClick={() => onSetMapStyle('light')}
                    className={`py-1.5 px-2 rounded border transition-colors ${
                      mapStyle === 'light'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-[#131e33] border-[#1f2e4d] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Street Light
                  </button>
                  <button
                    onClick={() => onSetMapStyle('satellite')}
                    className={`py-1.5 px-2 rounded border transition-colors ${
                      mapStyle === 'satellite'
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-[#131e33] border-[#1f2e4d] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Satellite
                  </button>
                </div>
              </div>

              {/* Master Layer Toggles List */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Active Overlays
                </span>

                <div 
                  onClick={() => onToggleLayer('traffic')}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#131e33] border border-[#1f2e4d] cursor-pointer hover:border-slate-500 transition-colors"
                >
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Traffic Road Corridors</span>
                  </span>
                  <input type="checkbox" checked={layers.traffic} readOnly className="rounded border-slate-700 bg-slate-900 text-cyan-500" />
                </div>

                <div 
                  onClick={() => onToggleLayer('aqiHeatmap')}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#131e33] border border-[#1f2e4d] cursor-pointer hover:border-slate-500 transition-colors"
                >
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                    <span>AQI Thermal Heatmap</span>
                  </span>
                  <input type="checkbox" checked={layers.aqiHeatmap} readOnly className="rounded border-slate-700 bg-slate-900 text-cyan-500" />
                </div>

                <div 
                  onClick={() => onToggleLayer('aqiStations')}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#131e33] border border-[#1f2e4d] cursor-pointer hover:border-slate-500 transition-colors"
                >
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                    <span>CPCB Monitoring Stations</span>
                  </span>
                  <input type="checkbox" checked={layers.aqiStations} readOnly className="rounded border-slate-700 bg-slate-900 text-cyan-500" />
                </div>

                <div 
                  onClick={() => onToggleLayer('incidents')}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#131e33] border border-[#1f2e4d] cursor-pointer hover:border-slate-500 transition-colors"
                >
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    <span>Live Incidents & Closures</span>
                  </span>
                  <input type="checkbox" checked={layers.incidents} readOnly className="rounded border-slate-700 bg-slate-900 text-cyan-500" />
                </div>

                <div 
                  onClick={() => onToggleLayer('delhiBoundary')}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#131e33] border border-[#1f2e4d] cursor-pointer hover:border-slate-500 transition-colors"
                >
                  <span className="flex items-center gap-2 text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    <span>NCT Delhi Boundary</span>
                  </span>
                  <input type="checkbox" checked={layers.delhiBoundary} readOnly className="rounded border-slate-700 bg-slate-900 text-cyan-500" />
                </div>
              </div>

              {/* Camera Zoom & Reset Controls */}
              <div className="pt-2 border-t border-[#1f2e4d]/70 flex items-center space-x-2">
                <button
                  onClick={onZoomIn}
                  className="flex-1 flex items-center justify-center space-x-1 py-1.5 bg-[#131e33] hover:bg-[#1a2942] border border-[#1f2e4d] rounded-lg text-slate-300 hover:text-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                  <span>Zoom In</span>
                </button>
                <button
                  onClick={onZoomOut}
                  className="flex-1 flex items-center justify-center space-x-1 py-1.5 bg-[#131e33] hover:bg-[#1a2942] border border-[#1f2e4d] rounded-lg text-slate-300 hover:text-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                  <span>Zoom Out</span>
                </button>
                <button
                  onClick={onResetView}
                  className="flex items-center justify-center p-2 bg-[#131e33] hover:bg-cyan-900/30 border border-[#1f2e4d] hover:border-cyan-500/50 rounded-lg text-cyan-400 transition-colors"
                  title="Reset to Entire Delhi View"
                >
                  <Maximize2 size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Technical Specification Footnote */}
        <div className="p-2.5 rounded-lg bg-[#0d1524]/60 border border-[#1f2e4d]/40 text-[10px] text-slate-400 font-mono space-y-1">
          <div className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
            <Info size={12} />
            <span>GEO-SPATIAL MESH</span>
          </div>
          <p>
            Standard WGS-84 projection covering 1,484 km² NCT Delhi with interpolated CPCB inverse distance weighting.
          </p>
        </div>

      </div>
    </aside>
  );
};
