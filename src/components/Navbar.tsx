import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Layers, 
  Compass, 
  Cpu, 
  Clock, 
  Maximize2, 
  PanelLeftClose, 
  PanelLeftOpen, 
  PanelRightClose, 
  PanelRightOpen,
  Car,
  Wind
} from 'lucide-react';
import { MapLayerState } from '../types';

interface NavbarProps {
  currentTab: 'dashboard' | 'simulation';
  setCurrentTab: (tab: 'dashboard' | 'simulation') => void;
  layers: MapLayerState;
  onToggleLayer: (layerKey: keyof MapLayerState) => void;
  leftSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean) => void;
  rightSidebarOpen: boolean;
  setRightSidebarOpen: (open: boolean) => void;
  onResetView: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  layers,
  onToggleLayer,
  leftSidebarOpen,
  setLeftSidebarOpen,
  rightSidebarOpen,
  setRightSidebarOpen,
  onResetView,
}) => {
  const [timeString, setTimeString] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format: Tuesday, 17 Nov 2026 | 13:28:45 IST
      const datePart = now.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const timePart = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
      setTimeString(`${datePart} • ${timePart} IST`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-[#080c14]/95 border-b border-[#1f2e4d] px-4 flex items-center justify-between select-none z-30 backdrop-blur-md relative">
      {/* Left: Branding & Side Toggle */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          className="p-2 rounded-lg bg-[#0d1524] text-slate-400 hover:text-cyan-400 hover:bg-[#131e33] border border-[#1f2e4d] transition-colors"
          title={leftSidebarOpen ? "Collapse Left Panel" : "Expand Left Panel"}
        >
          {leftSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <Cpu className="text-white" size={20} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-extrabold tracking-wider bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
                DELHI DIGITAL TWIN
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-700/50 rounded">
                STAGE 1
              </span>
            </div>
            <p className="text-[11px] text-slate-400 tracking-wide flex items-center gap-1.5">
              <span>Urban Intelligence & Simulation Platform</span>
              <span className="inline-block w-1 h-1 rounded-full bg-slate-600"></span>
              <span className="text-slate-500 font-mono">NCT Delhi</span>
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Navigation Mode Switcher & Quick Layer Toggles */}
      <div className="hidden lg:flex items-center space-x-3">
        {/* Navigation Switcher */}
        <div className="flex items-center p-1 bg-[#0d1524] rounded-lg border border-[#1f2e4d]">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentTab === 'dashboard'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity size={14} className={currentTab === 'dashboard' ? 'text-cyan-400' : ''} />
            <span>Command Center</span>
          </button>

          <button
            onClick={() => setCurrentTab('simulation')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              currentTab === 'simulation'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm shadow-purple-500/10'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass size={14} className={currentTab === 'simulation' ? 'text-purple-400' : ''} />
            <span>Simulation Lab</span>
            <span className="text-[9px] px-1 py-0.2 bg-purple-900/60 text-purple-300 rounded border border-purple-700/40">
              PREVIEW
            </span>
          </button>
        </div>

        {/* Quick Map Controls in Navbar if on Dashboard */}
        {currentTab === 'dashboard' && (
          <div className="flex items-center space-x-1.5 bg-[#0d1524] px-2 py-1 rounded-lg border border-[#1f2e4d]">
            <button
              onClick={() => onToggleLayer('traffic')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                layers.traffic
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
              title="Toggle Traffic Layer"
            >
              <Car size={13} />
              <span>Traffic</span>
            </button>

            <button
              onClick={() => onToggleLayer('aqiHeatmap')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                layers.aqiHeatmap
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
              title="Toggle AQI Heatmap Layer"
            >
              <Wind size={13} />
              <span>AQI Heatmap</span>
            </button>

            <button
              onClick={() => onToggleLayer('aqiStations')}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                layers.aqiStations
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
              title="Toggle Stations Layer"
            >
              <Layers size={13} />
              <span>Stations</span>
            </button>

            <div className="h-4 w-px bg-[#1f2e4d] mx-1"></div>

            <button
              onClick={onResetView}
              className="flex items-center space-x-1 px-2 py-1 rounded text-xs font-mono text-slate-400 hover:text-cyan-300 hover:bg-[#131e33] transition-colors"
              title="Reset Map to Delhi Bounds"
            >
              <Maximize2 size={13} />
              <span>Reset Map</span>
            </button>
          </div>
        )}
      </div>

      {/* Right: Clock & Feed Status & Side Toggle */}
      <div className="flex items-center space-x-3">
        {/* Live Clock */}
        <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-slate-300 bg-[#0d1524] px-3 py-1.5 rounded-lg border border-[#1f2e4d]">
          <Clock size={13} className="text-cyan-400" />
          <span>{timeString}</span>
        </div>

        {/* Live Feed Status Pill */}
        <div className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-[#0d1524] border border-[#1f2e4d]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <div className="text-left">
            <span className="text-[11px] font-mono font-semibold tracking-wider text-emerald-400 block leading-tight">
              LIVE TELEMETRY
            </span>
            <span className="text-[9px] text-slate-400 font-mono block leading-none">
              SIMULATED FEED
            </span>
          </div>
        </div>

        {/* Right Sidebar Toggle */}
        <button
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          className="p-2 rounded-lg bg-[#0d1524] text-slate-400 hover:text-cyan-400 hover:bg-[#131e33] border border-[#1f2e4d] transition-colors"
          title={rightSidebarOpen ? "Collapse Right Panel" : "Expand Right Panel"}
        >
          {rightSidebarOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
        </button>
      </div>
    </header>
  );
};
