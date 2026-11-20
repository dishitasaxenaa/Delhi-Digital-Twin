import React, { useState } from 'react';
import { LeftSidebar } from '../components/Sidebar/LeftSidebar';
import { RightSidebar } from '../components/CityInsights/RightSidebar';
import { MapView } from '../components/MapView/MapView';
import { 
  MapLayerState, 
  MapStyleType, 
  SelectedFeature, 
  TrafficCongestionLevel, 
  AQICategory,
  TrafficIncident,
  AQIStation,
  RoadSegment,
  CitySummary 
} from '../types';

interface DashboardProps {
  layers: MapLayerState;
  onToggleLayer: (layerKey: keyof MapLayerState) => void;
  leftSidebarOpen: boolean;
  setLeftSidebarOpen: (open: boolean) => void;
  rightSidebarOpen: boolean;
  setRightSidebarOpen: (open: boolean) => void;
  onNavigateToSimulation: (roadName: string) => void;
  resetViewTrigger: number;
  onTriggerResetView: () => void;
  stations?: AQIStation[];
  roads?: RoadSegment[];
  incidents?: TrafficIncident[];
  citySummary?: CitySummary;
}

export const Dashboard: React.FC<DashboardProps> = ({
  layers,
  onToggleLayer,
  leftSidebarOpen,
  rightSidebarOpen,
  onNavigateToSimulation,
  resetViewTrigger,
  onTriggerResetView,
  stations,
  roads,
  incidents,
  citySummary,
}) => {
  const [mapStyle, setMapStyle] = useState<MapStyleType>('dark');
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature>(null);
  const [selectedCongestionFilter, setSelectedCongestionFilter] = useState<TrafficCongestionLevel | 'All'>('All');
  const [selectedAQIFilter, setSelectedAQIFilter] = useState<AQICategory | 'All'>('All');
  const [flyToLocation, setFlyToLocation] = useState<[number, number] | null>(null);

  const handleZoomIn = () => {
    const evt = new KeyboardEvent('keydown', { key: '+' });
    window.dispatchEvent(evt);
  };

  const handleZoomOut = () => {
    const evt = new KeyboardEvent('keydown', { key: '-' });
    window.dispatchEvent(evt);
  };

  const handleSelectIncident = (incident: TrafficIncident) => {
    setSelectedFeature({ type: 'incident', data: incident });
    setFlyToLocation(incident.coordinates);
  };

  const handleSelectStation = (station: AQIStation) => {
    setSelectedFeature({ type: 'station', data: station });
    setFlyToLocation(station.coordinates);
  };

  const handleSelectRoad = (road: RoadSegment) => {
    setSelectedFeature({ type: 'road', data: road });
    if (road.coordinates && road.coordinates.length > 0) {
      const midCoord = road.coordinates[Math.floor(road.coordinates.length / 2)];
      setFlyToLocation(midCoord);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden relative w-full h-[calc(100vh-4rem)]">
      {/* Left Sidebar: Controls & Filters */}
      {leftSidebarOpen && (
        <LeftSidebar
          layers={layers}
          onToggleLayer={onToggleLayer}
          mapStyle={mapStyle}
          onSetMapStyle={setMapStyle}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onResetView={onTriggerResetView}
          onSelectIncident={handleSelectIncident}
          onSelectStation={handleSelectStation}
          selectedCongestionFilter={selectedCongestionFilter}
          setSelectedCongestionFilter={setSelectedCongestionFilter}
          selectedAQIFilter={selectedAQIFilter}
          setSelectedAQIFilter={setSelectedAQIFilter}
          stations={stations}
          roads={roads}
          incidents={incidents}
          avgSpeed={citySummary?.avgSpeedKmH}
          congestionPercent={citySummary?.avgCongestionPercent}
        />
      )}

      {/* Center Main Map (Occupies majority of the screen) */}
      <main className="flex-1 relative h-full flex flex-col overflow-hidden bg-[#080c14]">
        {/* Active Filter Pill Overlay if filtered */}
        {(selectedCongestionFilter !== 'All' || selectedAQIFilter !== 'All') && (
          <div className="absolute top-4 left-4 z-10 flex items-center space-x-2 bg-[#080c14]/90 border border-[#1f2e4d] px-3 py-1.5 rounded-lg shadow-xl text-xs font-mono text-slate-200 backdrop-blur-md">
            <span className="text-cyan-400 font-semibold">Active Filter:</span>
            {selectedCongestionFilter !== 'All' && (
              <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800/40">
                Congestion: {selectedCongestionFilter}
              </span>
            )}
            {selectedAQIFilter !== 'All' && (
              <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800/40">
                AQI: {selectedAQIFilter}
              </span>
            )}
            <button
              onClick={() => {
                setSelectedCongestionFilter('All');
                setSelectedAQIFilter('All');
              }}
              className="text-cyan-400 hover:text-white underline text-[10px] ml-1"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Core MapLibre GL Component */}
        <MapView
          layers={layers}
          mapStyle={mapStyle}
          selectedFeature={selectedFeature}
          setSelectedFeature={setSelectedFeature}
          selectedCongestionFilter={selectedCongestionFilter}
          selectedAQIFilter={selectedAQIFilter}
          onNavigateToSimulation={onNavigateToSimulation}
          flyToLocation={flyToLocation}
          resetViewTrigger={resetViewTrigger}
          stations={stations}
          roads={roads}
          incidents={incidents}
        />
      </main>

      {/* Right Sidebar: City Insights & Trends */}
      {rightSidebarOpen && (
        <RightSidebar
          onSelectStation={handleSelectStation}
          onSelectRoad={handleSelectRoad}
          citySummary={citySummary}
          stations={stations}
          roads={roads}
          trends={citySummary?.trends}
          hasSufficientHistory={citySummary?.hasSufficientHistory}
        />
      )}
    </div>
  );
};
