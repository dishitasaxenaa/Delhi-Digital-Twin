import React from 'react';

interface MapLegendProps {
  showTraffic: boolean;
  showAQI: boolean;
}

export const MapLegend: React.FC<MapLegendProps> = ({ showTraffic, showAQI }) => {
  if (!showTraffic && !showAQI) return null;

  return (
    <div className="absolute bottom-5 left-4 z-10 bg-[#080c14]/90 border border-[#1f2e4d] rounded-xl p-3 backdrop-blur-md shadow-2xl text-[11px] font-mono text-slate-200 select-none space-y-2.5 max-w-xs pointer-events-auto">
      {/* AQI Heatmap Legend */}
      {showAQI && (
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-xs tracking-wider text-slate-100 uppercase">
              AQI Heatmap
            </span>
            <span className="text-[10px] text-slate-400">CPCB Index</span>
          </div>

          {/* Color Gradient Bar */}
          <div className="h-2 w-full rounded-full bg-gradient-to-r from-[#10b981] via-[#eab308] via-[#f97316] via-[#ef4444] to-[#881337] mb-1.5 shadow-inner"></div>

          {/* Legend Items */}
          <div className="grid grid-cols-3 gap-y-1 gap-x-2 text-[10px]">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10b981] inline-block"></span>
              <span className="text-slate-300">Good (0-50)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#84cc16] inline-block"></span>
              <span className="text-slate-300">Sat (51-100)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#eab308] inline-block"></span>
              <span className="text-slate-300">Mod (101-200)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#f97316] inline-block"></span>
              <span className="text-slate-300">Poor (201-300)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#ef4444] inline-block"></span>
              <span className="text-slate-300">V.Poor (301-400)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-[#881337] inline-block"></span>
              <span className="text-rose-400 font-bold">Severe (401+)</span>
            </div>
          </div>
        </div>
      )}

      {/* Traffic Congestion Legend */}
      {showTraffic && (
        <div className={showAQI ? 'pt-2 border-t border-[#1f2e4d]/70' : ''}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-semibold text-xs tracking-wider text-slate-100 uppercase">
              Traffic Congestion
            </span>
            <span className="text-[10px] text-slate-400">Flow Speed</span>
          </div>

          <div className="grid grid-cols-2 gap-1 text-[10px]">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-1.5 rounded-sm bg-[#10b981] inline-block"></span>
              <span className="text-slate-300">Low (&gt;45 km/h)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-1.5 rounded-sm bg-[#facc15] inline-block"></span>
              <span className="text-slate-300">Mod (30-45 km/h)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-1.5 rounded-sm bg-[#f97316] inline-block"></span>
              <span className="text-slate-300">High (18-30 km/h)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-1.5 rounded-sm bg-[#ef4444] inline-block animate-pulse"></span>
              <span className="text-rose-400 font-bold">Severe (&lt;18 km/h)</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
