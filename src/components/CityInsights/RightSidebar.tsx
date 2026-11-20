import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertOctagon, 
  Wind, 
  Car, 
  Flame, 
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  ComposedChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine 
} from 'recharts';
import { 
  hourlyTrendsData, 
  correlationData, 
  initialCitySummary, 
  highPollutionHotspots, 
  highCongestionCorridors 
} from '../../data/cityInsightsData';
import { AQIStation, RoadSegment } from '../../types';
import { getAllStations } from '../../services/aqiService';
import { getAllRoads } from '../../services/trafficService';

interface RightSidebarProps {
  onSelectStation: (station: AQIStation) => void;
  onSelectRoad: (road: RoadSegment) => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  onSelectStation,
  onSelectRoad,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'aqi' | 'traffic' | 'correlation'>('aqi');
  const allStations = getAllStations();
  const allRoads = getAllRoads();

  return (
    <aside className="w-84 md:w-92 h-full bg-[#080c14]/95 border-l border-[#1f2e4d] flex flex-col overflow-hidden backdrop-blur-md z-20 transition-all select-none">
      {/* Header */}
      <div className="p-3.5 border-b border-[#1f2e4d] flex items-center justify-between bg-[#0d1524]">
        <div className="flex items-center space-x-2">
          <BarChart3 className="text-cyan-400" size={16} />
          <span className="text-xs font-semibold tracking-wider text-slate-200 uppercase font-mono">
            City Insights & Analytics
          </span>
        </div>
        <div className="flex items-center space-x-1 px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50 text-[10px] font-mono">
          <Activity size={10} className="animate-spin text-amber-400" />
          <span>SYNTHETIC</span>
        </div>
      </div>

      {/* Main Insights Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3.5 text-xs text-slate-200">
        
        {/* City Summary Top Metric Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              NCT Delhi Aggregated Metrics
            </span>
            <span className="text-[9px] font-mono text-cyan-400">
              Updated 13:00 IST
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {/* Overall AQI Card */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#1a1118] to-[#131e33] border border-rose-500/40 relative overflow-hidden shadow-lg shadow-rose-950/20">
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span className="flex items-center gap-1 font-medium text-slate-300">
                  <Wind size={13} className="text-rose-400" />
                  <span>Delhi AQI</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-700/50">
                  {initialCitySummary.overallAQICategory}
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-2xl font-mono font-extrabold text-rose-300">
                  {initialCitySummary.overallAQI}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Weighted Avg</span>
              </div>
              <div className="text-[10px] text-rose-400/90 font-mono mt-1 flex items-center justify-between">
                <span>Dominant: PM2.5</span>
                <span>28 Stations</span>
              </div>
            </div>

            {/* Congestion Index Card */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#1a1711] to-[#131e33] border border-amber-500/40 relative overflow-hidden shadow-lg shadow-amber-950/20">
              <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
                <span className="flex items-center gap-1 font-medium text-slate-300">
                  <Car size={13} className="text-amber-400" />
                  <span>Congestion</span>
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700/50">
                  High
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-2xl font-mono font-extrabold text-amber-300">
                  {initialCitySummary.avgCongestionPercent}%
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Network load</span>
              </div>
              <div className="text-[10px] text-amber-400/90 font-mono mt-1 flex items-center justify-between">
                <span>+18% Peak Rush</span>
                <span>17 Corridors</span>
              </div>
            </div>
          </div>

          {/* Secondary 3-Card Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg bg-[#0d1524] border border-[#1f2e4d]">
              <span className="text-[10px] text-slate-400 font-mono block">Avg Speed</span>
              <span className="text-base font-mono font-bold text-white block mt-0.5">
                {initialCitySummary.avgSpeedKmH}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">km/h city-wide</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0d1524] border border-[#1f2e4d]">
              <span className="text-[10px] text-slate-400 font-mono block">Pollution Zones</span>
              <span className="text-base font-mono font-bold text-rose-400 block mt-0.5">
                {initialCitySummary.highPollutionZonesCount}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">AQI &gt; 350 Severe</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0d1524] border border-[#1f2e4d]">
              <span className="text-[10px] text-slate-400 font-mono block">Choke Points</span>
              <span className="text-base font-mono font-bold text-orange-400 block mt-0.5">
                {initialCitySummary.highCongestionRoadsCount}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Speed &lt; 18 km/h</span>
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CHARTS CONTAINER (AQI Trend, Congestion Trend, Traffic vs AQI) */}
        {/* ======================================================== */}
        <div className="bg-[#0d1524] rounded-xl border border-[#1f2e4d] p-3 shadow-sm">
          {/* Chart Switcher Tabs */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#1f2e4d]/70">
            <div className="flex items-center space-x-1">
              <TrendingUp size={13} className="text-cyan-400" />
              <span className="text-[11px] font-semibold text-slate-200">Temporal Trends</span>
            </div>
            <div className="flex items-center space-x-1 p-0.5 bg-[#131e33] rounded-lg border border-[#1f2e4d] text-[10px] font-mono">
              <button
                onClick={() => setActiveChartTab('aqi')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeChartTab === 'aqi'
                    ? 'bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AQI (24h)
              </button>
              <button
                onClick={() => setActiveChartTab('traffic')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeChartTab === 'traffic'
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Traffic (24h)
              </button>
              <button
                onClick={() => setActiveChartTab('correlation')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeChartTab === 'correlation'
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Correlation
              </button>
            </div>
          </div>

          {/* Chart 1: AQI 24h Trend */}
          {activeChartTab === 'aqi' && (
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2">
                <span>Diurnal AQI Pattern (CPCB Simulated Grid)</span>
                <span className="text-rose-400 font-semibold">Peak 19:00: 440 AQI</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourlyTrendsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="aqiAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2e4d" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={{ stroke: '#1f2e4d' }}
                      interval={3}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false} 
                      domain={[250, 480]}
                      axisLine={{ stroke: '#1f2e4d' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0d1524', borderColor: '#1f2e4d', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(val: number) => [`${val} AQI`, 'Air Quality']}
                      labelFormatter={(label) => `Time: ${label}`}
                    />
                    <ReferenceLine y={400} stroke="#881337" strokeDasharray="3 3" label={{ value: 'Severe (400)', fill: '#fda4af', fontSize: 9 }} />
                    <Area 
                      type="monotone" 
                      dataKey="aqi" 
                      stroke="#ef4444" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#aqiAreaGrad)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 2: Traffic Congestion 24h Trend */}
          {activeChartTab === 'traffic' && (
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2">
                <span>Traffic Congestion % & Speed Profile</span>
                <span className="text-amber-400 font-semibold">Morning & Evening Spikes</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyTrendsData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2e4d" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={{ stroke: '#1f2e4d' }}
                      interval={3}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false} 
                      domain={[0, 100]}
                      axisLine={{ stroke: '#1f2e4d' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0d1524', borderColor: '#1f2e4d', borderRadius: '8px', fontSize: '11px' }}
                      formatter={(val: number, name: string) => [
                        name === 'congestion' ? `${val}% Load` : `${val} km/h`, 
                        name === 'congestion' ? 'Congestion' : 'Avg Speed'
                      ]}
                      labelFormatter={(label) => `Hour: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="congestion" 
                      name="congestion"
                      stroke="#f59e0b" 
                      strokeWidth={2} 
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="speed" 
                      name="speed"
                      stroke="#06b6d4" 
                      strokeWidth={1.5} 
                      strokeDasharray="4 4"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Chart 3: Traffic vs AQI Comparison */}
          {activeChartTab === 'correlation' && (
            <div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2">
                <span>Vehicle Volume vs Ambient AQI Surge</span>
                <span className="text-cyan-400 font-semibold">R² = 0.81 (Strong)</span>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={correlationData} margin={{ top: 5, right: -10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2e4d" vertical={false} />
                    <XAxis 
                      dataKey="time" 
                      stroke="#64748b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={{ stroke: '#1f2e4d' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="#64748b" 
                      fontSize={9} 
                      tickLine={false} 
                      axisLine={{ stroke: '#1f2e4d' }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="#64748b" 
                      fontSize={9} 
                      domain={[300, 460]}
                      tickLine={false} 
                      axisLine={{ stroke: '#1f2e4d' }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0d1524', borderColor: '#1f2e4d', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Bar 
                      yAxisId="left" 
                      dataKey="trafficVolume" 
                      name="Vehicles/hr" 
                      fill="#3b82f6" 
                      opacity={0.65} 
                      radius={[3, 3, 0, 0]} 
                    />
                    <Line 
                      yAxisId="right" 
                      type="monotone" 
                      dataKey="aqiValue" 
                      name="AQI Level" 
                      stroke="#f97316" 
                      strokeWidth={2} 
                      dot={{ r: 3, fill: '#f97316' }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-1 pt-1 border-t border-[#1f2e4d]/50">
            <span>Source: Simulated Urban Transport Telemetry</span>
            <span>Refreshes 60s</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* HIGH-POLLUTION ZONES (CRITICAL HOTSPOTS) */}
        {/* ======================================================== */}
        <div className="bg-[#0d1524] rounded-xl border border-[#1f2e4d] p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <Flame size={14} className="text-rose-400" />
              <span className="font-semibold text-slate-200 text-xs">High-Pollution Hotspots</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-rose-950 text-rose-300 border border-rose-800/40">
              5 Critical
            </span>
          </div>

          <div className="space-y-1.5">
            {highPollutionHotspots.map((spot, idx) => {
              const matchedStation = allStations.find(s => s.name.toLowerCase().includes(spot.name.toLowerCase().split(' ')[0]));
              return (
                <div
                  key={idx}
                  onClick={() => matchedStation && onSelectStation(matchedStation)}
                  className="p-2 rounded-lg bg-[#131e33] hover:bg-[#1a2942] border border-[#1f2e4d] hover:border-rose-500/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {spot.name}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      Cause: {spot.primary}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800/40 block">
                      {spot.aqi} AQI
                    </span>
                    <span className="text-[8px] text-cyan-400 font-mono mt-0.5 block hover:underline">
                      Fly To ↗
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ======================================================== */}
        {/* HIGH-CONGESTION ROADS (BOTTLENECKS) */}
        {/* ======================================================== */}
        <div className="bg-[#0d1524] rounded-xl border border-[#1f2e4d] p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <AlertOctagon size={14} className="text-amber-400" />
              <span className="font-semibold text-slate-200 text-xs">Severe Congestion Arterials</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-800/40">
              5 Stretches
            </span>
          </div>

          <div className="space-y-1.5">
            {highCongestionCorridors.map((corridor, idx) => {
              const matchedRoad = allRoads.find(r => r.name.toLowerCase().includes(corridor.name.toLowerCase().split(' ')[0]));
              return (
                <div
                  key={idx}
                  onClick={() => matchedRoad && onSelectRoad(matchedRoad)}
                  className="p-2 rounded-lg bg-[#131e33] hover:bg-[#1a2942] border border-[#1f2e4d] hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="pr-2">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                        {corridor.name}
                      </span>
                    </div>
                    <span className="text-[9px] text-rose-400 font-mono block mt-0.5">
                      Delay: {corridor.delay}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800/40 block">
                      {corridor.speed}
                    </span>
                    <span className="text-[8px] text-cyan-400 font-mono mt-0.5 block hover:underline">
                      Inspect ↗
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Disclaimer Card */}
        <div className="p-2.5 rounded-lg bg-[#0d1524]/60 border border-[#1f2e4d]/40 text-[10px] text-slate-400 font-mono">
          <p className="leading-relaxed">
            <span className="text-amber-400 font-semibold">STAGE 1 PROTOCOL:</span> All telemetry streams, vehicle speeds, and AQI spatial interpolations are simulated for frontend testing and UI demonstration. Ready for live API adapters in Stage 2.
          </p>
        </div>

      </div>
    </aside>
  );
};
