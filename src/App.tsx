import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { SimulationLab } from './pages/SimulationLab';
import { MapLayerState } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'simulation'>('dashboard');
  const [simulationRoadTarget, setSimulationRoadTarget] = useState<string | undefined>(undefined);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState<boolean>(true);
  const [resetViewTrigger, setResetViewTrigger] = useState<number>(1);

  // Map Layer Visibility State
  const [layers, setLayers] = useState<MapLayerState>({
    traffic: true,
    aqiHeatmap: true,
    aqiStations: true,
    incidents: true,
    delhiBoundary: true,
  });

  const handleToggleLayer = (layerKey: keyof MapLayerState) => {
    setLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey],
    }));
  };

  const handleNavigateToSimulation = (roadName: string) => {
    setSimulationRoadTarget(roadName);
    setCurrentTab('simulation');
  };

  const handleTriggerResetView = () => {
    setResetViewTrigger((prev) => prev + 1);
  };

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden bg-[#080c14] text-slate-100 font-sans">
      {/* Top Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        layers={layers}
        onToggleLayer={handleToggleLayer}
        leftSidebarOpen={leftSidebarOpen}
        setLeftSidebarOpen={setLeftSidebarOpen}
        rightSidebarOpen={rightSidebarOpen}
        setRightSidebarOpen={setRightSidebarOpen}
        onResetView={handleTriggerResetView}
      />

      {/* Main Content Area: Dashboard or Simulation Lab */}
      {currentTab === 'dashboard' ? (
        <Dashboard
          layers={layers}
          onToggleLayer={handleToggleLayer}
          leftSidebarOpen={leftSidebarOpen}
          setLeftSidebarOpen={setLeftSidebarOpen}
          rightSidebarOpen={rightSidebarOpen}
          setRightSidebarOpen={setRightSidebarOpen}
          onNavigateToSimulation={handleNavigateToSimulation}
          resetViewTrigger={resetViewTrigger}
          onTriggerResetView={handleTriggerResetView}
        />
      ) : (
        <SimulationLab
          initialRoadName={simulationRoadTarget}
          onBackToDashboard={() => setCurrentTab('dashboard')}
        />
      )}
    </div>
  );
};

export default App;
