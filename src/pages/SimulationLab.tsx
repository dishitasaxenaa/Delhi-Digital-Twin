import React, { useState } from 'react';
import { 
  Compass, 
  Play, 
  GitCompare, 
  Sliders, 
  CheckCircle2, 
  Info,
  RotateCcw,
  Cpu
} from 'lucide-react';
import { readyScenarios, SimulationScenario } from '../services/simulationService';
import { getAllRoads } from '../services/trafficService';

interface SimulationLabProps {
  initialRoadName?: string;
  onBackToDashboard: () => void;
}

export const SimulationLab: React.FC<SimulationLabProps> = ({
  initialRoadName,
  onBackToDashboard,
}) => {
  const roads = getAllRoads();
  const [selectedScenario, setSelectedScenario] = useState<SimulationScenario>(readyScenarios[0]);
  const [selectedRoad, setSelectedRoad] = useState<string>(
    initialRoadName || readyScenarios[0].targetCorridor
  );
  const [interventionType, setInterventionType] = useState<string>('Road Closure & Diversion');
  const [diversionPct, setDiversionPct] = useState<number>(65);
  const [signalGreenDelta, setSignalGreenDelta] = useState<number>(20);
  const [freightRestriction, setFreightRestriction] = useState<boolean>(true);
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'running' | 'completed'>('idle');

  const handleRunSimulation = () => {
    setSimulationStatus('running');
    setTimeout(() => {
      setSimulationStatus('completed');
    }, 1200);
  };

  const handleReset = () => {
    setSimulationStatus('idle');
    setDiversionPct(65);
    setSignalGreenDelta(20);
    setFreightRestriction(true);
  };

  return (
    <div className="flex-1 h-full bg-[#080c14] overflow-y-auto custom-scrollbar p-6 select-none text-slate-100">
      {/* Simulation Lab Header */}
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-[#0d1524] border border-[#1f2e4d] shadow-xl relative overflow-hidden">
          <div className="flex items-center space-x-3.5 z-10">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-purple-600/30 border border-purple-400/40">
              <Compass className="text-white" size={24} />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-wider text-white">
                  MUNICIPAL SIMULATION LAB
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-purple-950/80 text-purple-300 border border-purple-700/50 rounded">
                  STAGE 2 PREVIEW
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                What-If Scenario Sandbox for Urban Mobility & Emissions Policy Testing
              </p>
            </div>
          </div>

          <div className="mt-4 md:mt-0 flex items-center space-x-3 z-10">
            <button
              onClick={onBackToDashboard}
              className="px-4 py-2 rounded-xl bg-[#131e33] hover:bg-[#1a2942] border border-[#1f2e4d] text-xs font-mono text-slate-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <span>← Back to Command Center</span>
            </button>
            <button
              onClick={handleRunSimulation}
              disabled={simulationStatus === 'running'}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-xs font-mono flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
            >
              {simulationStatus === 'running' ? (
                <>
                  <Cpu className="animate-spin" size={14} />
                  <span>Computing SUMO Pipeline...</span>
                </>
              ) : (
                <>
                  <Play size={14} />
                  <span>Run Scenario Model</span>
                </>
              )}
            </button>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-purple-900/20 to-transparent pointer-events-none"></div>
        </div>

        {/* Notice on Simulation Architecture */}
        <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-start space-x-3 text-xs text-purple-200">
          <Info size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-purple-300">
              Future Simulation Engine Integration Blueprint
            </p>
            <p className="text-purple-200/80 text-[11px] leading-relaxed">
              This module provides the frontend control surface for municipal traffic engineers and urban planners. In Stage 2, it connects via WebSocket to the open-source <strong>SUMO (Simulation of Urban MObility)</strong> micro-simulation engine using Python TraCI, alongside atmospheric dispersion models to evaluate real-time road closures, dynamic signal splits, and GRAP emergency measures before city implementation.
            </p>
          </div>
        </div>

        {/* Grid: Left Scenario Configurator & Right Baseline vs Proposed Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Intervention Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Presets Card */}
            <div className="p-4 rounded-xl bg-[#0d1524] border border-[#1f2e4d] space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                Standard Municipal Scenarios
              </span>

              <div className="space-y-2">
                {readyScenarios.map((scen) => (
                  <div
                    key={scen.id}
                    onClick={() => {
                      setSelectedScenario(scen);
                      setSelectedRoad(scen.targetCorridor);
                      setInterventionType(scen.interventionType);
                    }}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedScenario.id === scen.id
                        ? 'bg-purple-950/40 border-purple-500/60 shadow-sm shadow-purple-500/10'
                        : 'bg-[#131e33] border-[#1f2e4d] hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-white">{scen.title}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-purple-900/60 text-purple-300 border border-purple-700/40">
                        {scen.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-2">
                      {scen.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                      <span>Corridor: {scen.targetCorridor.split('(')[0]}</span>
                      <span className="text-purple-300 flex items-center gap-1">
                        Select ↗
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Parameter Configurator */}
            <div className="p-4 rounded-xl bg-[#0d1524] border border-[#1f2e4d] space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sliders size={13} className="text-purple-400" />
                  <span>Custom Intervention Builder</span>
                </span>
                <button
                  onClick={handleReset}
                  className="text-[10px] text-slate-400 hover:text-white font-mono flex items-center gap-1"
                >
                  <RotateCcw size={11} />
                  <span>Reset</span>
                </button>
              </div>

              {/* 1. Target Road */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 block font-medium">
                  1. Target Road / Geographical Sector:
                </label>
                <select
                  value={selectedRoad}
                  onChange={(e) => setSelectedRoad(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#131e33] border border-[#1f2e4d] text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                >
                  {roads.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Intervention Mode */}
              <div className="space-y-1.5">
                <label className="text-xs text-slate-300 block font-medium">
                  2. Municipal Intervention Strategy:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {[
                    'Road Closure & Diversion',
                    'Adaptive Signal Tuning',
                    'Heavy Vehicle Restriction',
                    'Odd-Even Scheme',
                  ].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setInterventionType(mode)}
                      className={`p-2 rounded-lg border text-left transition-all ${
                        interventionType === mode
                          ? 'bg-purple-950/60 border-purple-400 text-purple-200'
                          : 'bg-[#131e33] border-[#1f2e4d] text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Parameter Sliders */}
              <div className="space-y-3 pt-2 border-t border-[#1f2e4d]">
                {/* Diversion Rate Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Traffic Diversion Volume</span>
                    <span className="text-purple-300 font-bold">{diversionPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={diversionPct}
                    onChange={(e) => setDiversionPct(Number(e.target.value))}
                    className="w-full accent-purple-500 h-1.5 bg-[#131e33] rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">
                    Routes remainder through Barapullah & DND flyway corridors
                  </span>
                </div>

                {/* Signal Green Phase Delta Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Signal Green Phase Adjustment</span>
                    <span className="text-purple-300 font-bold">+{signalGreenDelta}s</span>
                  </div>
                  <input
                    type="range"
                    min="-30"
                    max="60"
                    value={signalGreenDelta}
                    onChange={(e) => setSignalGreenDelta(Number(e.target.value))}
                    className="w-full accent-purple-500 h-1.5 bg-[#131e33] rounded-lg cursor-pointer"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">
                    Adaptive signal cycle duration for choke-point clearing
                  </span>
                </div>

                {/* Heavy Freight Checkbox */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#131e33] border border-[#1f2e4d]">
                  <span className="text-xs text-slate-300">
                    Enforce GRAP IV Commercial Truck Ban
                  </span>
                  <input
                    type="checkbox"
                    checked={freightRestriction}
                    onChange={(e) => setFreightRestriction(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-purple-600 focus:ring-purple-500 w-4 h-4"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Baseline vs Proposed Comparison (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Comparative Matrix Card */}
            <div className="p-4 rounded-xl bg-[#0d1524] border border-[#1f2e4d] space-y-4">
              <div className="flex items-center justify-between border-b border-[#1f2e4d] pb-3">
                <div className="flex items-center space-x-2">
                  <GitCompare className="text-purple-400" size={16} />
                  <span className="font-semibold text-sm text-white">
                    Baseline vs Proposed Impact Projection
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#131e33] text-slate-300 border border-[#1f2e4d]">
                  Target: {selectedRoad.split('(')[0]}
                </span>
              </div>

              {/* Side-by-Side Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Baseline Column */}
                <div className="p-4 rounded-xl bg-[#131e33]/70 border border-[#1f2e4d] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                      Current Baseline
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                      Standard Ops
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-[#0d1524] border border-[#1f2e4d]">
                      <span className="text-[10px] text-slate-400 block">Corridor Flow Speed</span>
                      <span className="text-lg font-bold text-rose-400">
                        {selectedScenario.baselineMetric.avgSpeed}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#0d1524] border border-[#1f2e4d]">
                      <span className="text-[10px] text-slate-400 block">Congestion Density</span>
                      <span className="text-lg font-bold text-amber-400">
                        {selectedScenario.baselineMetric.congestionRate}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#0d1524] border border-[#1f2e4d]">
                      <span className="text-[10px] text-slate-400 block">Local AQI Concentration</span>
                      <span className="text-lg font-bold text-rose-400">
                        {selectedScenario.baselineMetric.estAQIImpact}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Proposed Scenario Column */}
                <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/40 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                      Proposed Simulation
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-900/60 text-purple-300 border border-purple-700/50">
                      Intervention Active
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs font-mono">
                    <div className="p-2.5 rounded-lg bg-[#0d1524] border border-purple-500/30">
                      <span className="text-[10px] text-slate-400 block">Simulated Flow Speed</span>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-lg font-bold text-emerald-400">
                          {selectedScenario.projectedMetric.avgSpeed}
                        </span>
                        <span className="text-[10px] text-emerald-400">Improvement</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#0d1524] border border-purple-500/30">
                      <span className="text-[10px] text-slate-400 block">Simulated Congestion</span>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-lg font-bold text-cyan-300">
                          {selectedScenario.projectedMetric.congestionRate}
                        </span>
                        <span className="text-[10px] text-cyan-400">-24% Load</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#0d1524] border border-purple-500/30">
                      <span className="text-[10px] text-slate-400 block">Simulated Air Quality</span>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-lg font-bold text-emerald-400">
                          {selectedScenario.projectedMetric.estAQIImpact}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Spillover Risk Assessment */}
              <div className="p-3 rounded-lg bg-[#131e33] border border-[#1f2e4d] text-xs font-mono space-y-1">
                <span className="text-slate-400 block text-[10px]">
                  NETWORK SPILLOVER PRE-CHECK (ADJACENT CORRIDORS):
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Diversion will absorb up to 1,200 veh/hr on Barapullah Elevated Road with nominal 4 min additional transit time. Low congestion spill risk on DND approach.
                </p>
              </div>
            </div>

            {/* SUMO & CPCB Architecture Specification */}
            <div className="p-4 rounded-xl bg-[#0d1524] border border-[#1f2e4d] space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                Stage 2 Pipeline Specification (SUMO + TraCI)
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#131e33] border border-[#1f2e4d] space-y-1">
                  <div className="flex items-center space-x-1.5 text-cyan-400 font-mono font-semibold text-[11px]">
                    <CheckCircle2 size={13} />
                    <span>OSM Network Ingestion</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Automated conversion of Delhi OpenStreetMap .osm files via netconvert to generate SUMO road network graphs.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#131e33] border border-[#1f2e4d] space-y-1">
                  <div className="flex items-center space-x-1.5 text-purple-400 font-mono font-semibold text-[11px]">
                    <CheckCircle2 size={13} />
                    <span>TraCI Python Controller</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Real-time API commands to dynamically reroute origin-destination matrices, adjust signal phase green times, and simulate closures.
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-[#131e33] border border-[#1f2e4d] space-y-1">
                  <div className="flex items-center space-x-1.5 text-rose-400 font-mono font-semibold text-[11px]">
                    <CheckCircle2 size={13} />
                    <span>HBEFA Emission Modeling</span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-relaxed">
                    Microscopic calculation of vehicle PM2.5, NOx, and CO2 emissions linked to instantaneous acceleration and idling profiles.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
