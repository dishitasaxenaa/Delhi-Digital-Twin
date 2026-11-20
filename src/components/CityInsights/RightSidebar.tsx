import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  AlertOctagon, 
  Wind, 
  Car, 
  Flame, 
  Database,
  Info
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
import { AQIStation, RoadSegment, CitySummary, HourlyMetric } from '../../types';
import { getAllStations, getAQIBadgeClass } from '../../services/aqiService';
import { getAllRoads } from '../../services/trafficService';
import { initialCitySummary } from '../../data/cityInsightsData';

interface RightSidebarProps {
  onSelectStation: (station: AQIStation) => void;
  onSelectRoad: (road: RoadSegment) => void;
  citySummary?: CitySummary;
  stations?: AQIStation[];
  roads?: RoadSegment[];
  trends?: HourlyMetric[];
  hasSufficientHistory?: boolean;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  onSelectStation,
  onSelectRoad,
  citySummary = initialCitySummary,
  stations,
  roads,
  trends = [],
  hasSufficientHistory = false,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'aqi' | 'traffic' | 'correlation'>('aqi');
  const activeStations = stations && stations.length > 0 ? stations : getAllStations();
  const activeRoads = roads && roads.length > 0 ? roads : getAllRoads();

  // Top 5 Hotspots dynamically sorted by AQI
  const dynamicHotspots = [...activeStations]
    .filter(s => s.aqi > 0)
    .sort((a, b) => b.aqi - a.aqi)
    .slice(0, 5);

  // Top 5 Congested Corridors dynamically sorted by slowest speed
  const dynamicCongestedRoads = [...activeRoads]
    .sort((a, b) => a.avgSpeedKmH - b.avgSpeedKmH)
    .slice(0, 5);

  const isLiveFeed = citySummary.aqiStatus === 'LIVE';

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
        <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 text-[10px] font-mono">
          <span className={`w-1.5 h-1.5 rounded-full ${isLiveFeed ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          <span>{isLiveFeed ? 'LIVE TELEMETRY' : 'CACHED FEED'}</span>
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
              {citySummary.lastUpdated}
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
                <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold ${getAQIBadgeClass(citySummary.overallAQICategory as any)}`}>
                  {citySummary.overallAQICategory}
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-2xl font-mono font-extrabold text-rose-300">
                  {citySummary.overallAQI > 0 ? citySummary.overallAQI : '--'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Arithmetic Mean</span>
              </div>
              <div className="text-[10px] text-rose-400/90 font-mono mt-1 flex items-center justify-between">
                <span>Dominant: PM2.5</span>
                <span>{citySummary.reportingStationsCount}/{citySummary.totalStationsCount} Stations</span>
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
                  {citySummary.avgCongestionPercent > 50 ? 'High' : 'Moderate'}
                </span>
              </div>
              <div className="flex items-baseline space-x-1.5 mt-0.5">
                <span className="text-2xl font-mono font-extrabold text-amber-300">
                  {Math.round(citySummary.avgCongestionPercent)}%
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Velocity Load</span>
              </div>
              <div className="text-[10px] text-amber-400/90 font-mono mt-1 flex items-center justify-between">
                <span>Flow Index</span>
                <span>{activeRoads.length} Corridors</span>
              </div>
            </div>
          </div>

          {/* Secondary 3-Card Row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-lg bg-[#0d1524] border border-[#1f2e4d]">
              <span className="text-[10px] text-slate-400 font-mono block">Avg Speed</span>
              <span className="text-base font-mono font-bold text-white block mt-0.5">
                {citySummary.avgSpeedKmH}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">km/h city-wide</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0d1524] border border-[#1f2e4d]">
              <span className="text-[10px] text-slate-400 font-mono block">Pollution Zones</span>
              <span className="text-base font-mono font-bold text-rose-400 block mt-0.5">
                {citySummary.highPollutionZonesCount}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">AQI &gt; 300</span>
            </div>

            <div className="p-2.5 rounded-lg bg-[#0d1524] border border-[#1f2e4d]">
              <span className="text-[10px] text-slate-400 font-mono block">Choke Points</span>
              <span className="text-base font-mono font-bold text-orange-400 block mt-0.5">
                {citySummary.highCongestionRoadsCount}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">Ratio &lt; 0.60</span>
            </div>
          </div>

          {/* Calculation Definition Pill */}
          <div className="p-2 rounded-lg bg-[#0d1524]/60 border border-[#1f2e4d]/40 flex items-start space-x-2 text-[10px] text-slate-400 font-mono">
            <Info size={12} className="text-cyan-400 flex-shrink-0 mt-0.5" />
            <p>
              {citySummary.calculationMethod || "Overall Delhi AQI is the arithmetic mean across all reporting CPCB stations."}
            </p>
          </div>
        </div>

        {/* ======================================================== */}
        {/* CHARTS CONTAINER (Historical Telemetry or Insufficient State) */}
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
                AQI
              </button>
              <button
                onClick={() => setActiveChartTab('traffic')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeChartTab === 'traffic'
                    ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Traffic
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

          {/* Insufficient Historical Data State (Requirement 8) */}
          {!hasSufficientHistory || trends.length < 2 ? (
            <div className="py-6 px-3 text-center space-y-2 bg-[#131e33]/40 rounded-lg border border-[#1f2e4d]/50">
              <Database className="mx-auto text-cyan-400 animate-pulse" size={24} />
              <div className="font-semibold text-slate-200 text-xs font-mono">
                Historical Data Logging Active
              </div>
              <p className="text-[10px] text-slate-400 font-mono leading-relaxed max-w-xs mx-auto">
                Real-world telemetry is being recorded to the database on each polling cycle. Charts will automatically populate as multi-hour history accumulates. No fabricated trends are displayed.
              </p>
              <div className="text-[9px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-1 rounded inline-block border border-cyan-800/40">
                Polling Interval: Traffic (2m) • AQI (15m)
              </div>
            </div>
          ) : (
            <div>
              {/* Chart 1: AQI Trend */}
              {activeChartTab === 'aqi' && (
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2">
                    <span>Stored Historical AQI Profile</span>
                    <span className="text-rose-400 font-semibold">{trends[trends.length - 1]?.aqi} AQI</span>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trends} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
                        />
                        <YAxis 
                          stroke="#64748b" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={{ stroke: '#1f2e4d' }}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0d1524', borderColor: '#1f2e4d', borderRadius: '8px', fontSize: '11px' }}
                          formatter={(val: number) => [`${val} AQI`, 'Observed AQI']}
                          labelFormatter={(label) => `Time: ${label}`}
                        />
                        <ReferenceLine y={400} stroke="#881337" strokeDasharray="3 3" label={{ value: 'Severe', fill: '#fda4af', fontSize: 9 }} />
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

              {/* Chart 2: Traffic Trend */}
              {activeChartTab === 'traffic' && (
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2">
                    <span>Speed & Congestion % History</span>
                    <span className="text-amber-400 font-semibold">{trends[trends.length - 1]?.speed} km/h</span>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trends} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1f2e4d" vertical={false} />
                        <XAxis 
                          dataKey="time" 
                          stroke="#64748b" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={{ stroke: '#1f2e4d' }}
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
                        />
                        <Line 
                          type="monotone" 
                          dataKey="congestion" 
                          name="Congestion %"
                          stroke="#f59e0b" 
                          strokeWidth={2} 
                          dot={false}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="speed" 
                          name="Speed (km/h)"
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

              {/* Chart 3: Correlation */}
              {activeChartTab === 'correlation' && (
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-2">
                    <span>Congestion Ratio vs Ambient AQI</span>
                    <span className="text-cyan-400 font-semibold">Live Correlation</span>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={trends} margin={{ top: 5, right: -10, left: -20, bottom: 0 }}>
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
                          tickLine={false} 
                          axisLine={{ stroke: '#1f2e4d' }}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0d1524', borderColor: '#1f2e4d', borderRadius: '8px', fontSize: '11px' }}
                        />
                        <Bar 
                          yAxisId="left" 
                          dataKey="congestion" 
                          name="Congestion %" 
                          fill="#3b82f6" 
                          opacity={0.65} 
                          radius={[3, 3, 0, 0]} 
                        />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="aqi" 
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
            </div>
          )}

          <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-1 pt-1 border-t border-[#1f2e4d]/50">
            <span>Source: {citySummary.sourceSummary || 'Real Telemetry Stream'}</span>
            <span>Live Sync</span>
          </div>
        </div>

        {/* ======================================================== */}
        {/* HIGH-POLLUTION ZONES (CRITICAL HOTSPOTS FROM LIVE DATA) */}
        {/* ======================================================== */}
        <div className="bg-[#0d1524] rounded-xl border border-[#1f2e4d] p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <Flame size={14} className="text-rose-400" />
              <span className="font-semibold text-slate-200 text-xs">Highest AQI Stations</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-rose-950 text-rose-300 border border-rose-800/40">
              Top 5 Telemetry
            </span>
          </div>

          <div className="space-y-1.5">
            {dynamicHotspots.map((st) => (
              <div
                key={st.id}
                onClick={() => onSelectStation(st)}
                className="p-2 rounded-lg bg-[#131e33] hover:bg-[#1a2942] border border-[#1f2e4d] hover:border-rose-500/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {st.name}
                    </span>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-0.5">
                    {st.district} • Dominant: {st.dominantPollutant}
                  </span>
                </div>
                <div className="text-right">
                  <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800/40 block">
                    {st.aqi} AQI
                  </span>
                  <span className="text-[8px] text-cyan-400 font-mono mt-0.5 block hover:underline">
                    Fly To ↗
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* HIGH-CONGESTION ROADS (BOTTLENECKS FROM LIVE DATA) */}
        {/* ======================================================== */}
        <div className="bg-[#0d1524] rounded-xl border border-[#1f2e4d] p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5">
              <AlertOctagon size={14} className="text-amber-400" />
              <span className="font-semibold text-slate-200 text-xs">Slowest Arterial Stretches</span>
            </div>
            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-800/40">
              Top 5 Delay
            </span>
          </div>

          <div className="space-y-1.5">
            {dynamicCongestedRoads.map((road) => (
              <div
                key={road.id}
                onClick={() => onSelectRoad(road)}
                className="p-2 rounded-lg bg-[#131e33] hover:bg-[#1a2942] border border-[#1f2e4d] hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="pr-2">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[11px] font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {road.name.split('(')[0]}
                    </span>
                  </div>
                  <span className="text-[9px] text-rose-400 font-mono block mt-0.5">
                    Delay: +{Math.max(0, Math.round(road.travelTimeMin - road.normalTimeMin))} min
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800/40 block">
                    {road.avgSpeedKmH} km/h
                  </span>
                  <span className="text-[8px] text-cyan-400 font-mono mt-0.5 block hover:underline">
                    Inspect ↗
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </aside>
  );
};
