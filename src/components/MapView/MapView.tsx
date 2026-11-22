import React, { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  DELHI_CENTER, 
  DELHI_INITIAL_ZOOM, 
  DELHI_BOUNDS, 
  delhiBoundaryGeoJSON 
} from '../../data/delhiBoundary';
import { 
  MapLayerState, 
  MapStyleType, 
  SelectedFeature, 
  TrafficCongestionLevel, 
  AQICategory,
  AQIStation,
  RoadSegment,
  TrafficIncident
} from '../../types';
import { getAQIHeatmapGeoJSON, getStationsGeoJSON, getAllStations } from '../../services/aqiService';
import { getRoadsGeoJSON, getIncidentsGeoJSON, getAllRoads, getAllIncidents } from '../../services/trafficService';
import { MapLegend } from './MapLegend';
import { MapPopup } from './MapPopup';

interface MapViewProps {
  layers: MapLayerState;
  mapStyle: MapStyleType;
  selectedFeature: SelectedFeature;
  setSelectedFeature: (feature: SelectedFeature) => void;
  selectedCongestionFilter: TrafficCongestionLevel | 'All';
  selectedAQIFilter: AQICategory | 'All';
  onNavigateToSimulation?: (roadName: string) => void;
  flyToLocation: [number, number] | null;
  resetViewTrigger: number;
  stations?: AQIStation[];
  roads?: RoadSegment[];
  incidents?: TrafficIncident[];
}

export const MapView: React.FC<MapViewProps> = ({
  layers,
  mapStyle,
  selectedFeature,
  setSelectedFeature,
  selectedCongestionFilter,
  selectedAQIFilter,
  onNavigateToSimulation,
  flyToLocation,
  resetViewTrigger,
  stations,
  roads,
  incidents,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [styleRevision, setStyleRevision] = useState(0);
  const appliedStyleRef = useRef<MapStyleType>(mapStyle);
  const interactionsInitializedRef = useRef(false);

  // Store current live telemetry in refs for event listeners
  const stationsRef = useRef<AQIStation[]>(stations || getAllStations());
  const roadsRef = useRef<RoadSegment[]>(roads || getAllRoads());
  const incidentsRef = useRef<TrafficIncident[]>(incidents || getAllIncidents());
  const osmRoadSourceRef = useRef<any>(null);

  useEffect(() => {
    if (stations) stationsRef.current = stations;
  }, [stations]);

  useEffect(() => {
    if (roads) roadsRef.current = roads;
  }, [roads]);

  useEffect(() => {
    if (incidents) incidentsRef.current = incidents;
  }, [incidents]);

  // Determine Map Style URL
  const getStyleUrl = (style: MapStyleType) => {
    switch (style) {
      case 'dark':
        return 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
      case 'light':
        return 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';
      case 'satellite':
        return {
          version: 8,
          // Satellite is a raster-only custom style, but custom station labels
          // still need a glyph endpoint after every style reload.
          glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
          sources: {
            'esri-satellite': {
              type: 'raster',
              tiles: [
                'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
              ],
              tileSize: 256,
              attribution: 'Esri, Maxar, Earthstar Geographics, CNES/Airbus DS',
            },
          },
          layers: [
            {
              id: 'esri-satellite-layer',
              type: 'raster',
              source: 'esri-satellite',
              minzoom: 0,
              maxzoom: 22,
            },
          ],
        } as maplibregl.StyleSpecification;
    }
  };

  // Add all Custom Layers to the MapLibre Map
  const addDigitalTwinLayers = useCallback((map: maplibregl.Map) => {
    // CARTO's basemap vector tiles are sourced from OpenStreetMap. Reuse their
    // roads source on street styles and retain its source spec for Satellite.
    const currentStyleSources = map.getStyle().sources as Record<string, any>;
    osmRoadSourceRef.current = currentStyleSources.protomaps || osmRoadSourceRef.current;
    const osmRoadSourceId = currentStyleSources.protomaps ? 'protomaps' : 'delhi-osm-roads-source';
    if (osmRoadSourceId === 'delhi-osm-roads-source' && !map.getSource(osmRoadSourceId) && osmRoadSourceRef.current) {
      // Reuse CARTO's full vector source definition, including its TileJSON
      // metadata and current tile endpoint, so roads continue loading over
      // the raster-only Satellite style.
      map.addSource('delhi-osm-roads-source', osmRoadSourceRef.current);
    }
    if (!map.getLayer('delhi-osm-roads-layer') && map.getSource(osmRoadSourceId)) {
      map.addLayer({
        id: 'delhi-osm-roads-layer',
        type: 'line',
        source: osmRoadSourceId,
        'source-layer': 'roads',
        filter: ['in', ['get', 'kind_detail'], ['literal', [
          'motorway', 'motorway_link', 'trunk', 'trunk_link',
          'primary', 'primary_link', 'secondary', 'secondary_link',
          'tertiary', 'tertiary_link',
        ]]],
        layout: { 'line-cap': 'round', 'line-join': 'round' },
        paint: {
          'line-color': '#718096',
          'line-width': ['interpolate', ['linear'], ['zoom'], 8, 0.55, 10, 1.1, 14, 1.8],
          'line-opacity': 0.65,
        },
      });
    }

    // 1. Delhi NCT Boundary
    if (!map.getSource('delhi-boundary-source')) {
      map.addSource('delhi-boundary-source', {
        type: 'geojson',
        data: delhiBoundaryGeoJSON,
      });

      // Boundary outline
      map.addLayer({
        id: 'delhi-boundary-line',
        type: 'line',
        source: 'delhi-boundary-source',
        paint: {
          'line-color': '#06b6d4',
          'line-width': 2,
          'line-dasharray': [3, 2],
          'line-opacity': 0.85,
        },
      });

      // Boundary soft fill
      map.addLayer({
        id: 'delhi-boundary-fill',
        type: 'fill',
        source: 'delhi-boundary-source',
        paint: {
          'fill-color': '#06b6d4',
          'fill-opacity': 0.03,
        },
      });
    }

    // 2. AQI Heatmap Layer
    if (!map.getSource('aqi-heatmap-source')) {
      map.addSource('aqi-heatmap-source', {
        type: 'geojson',
        data: getAQIHeatmapGeoJSON(stationsRef.current),
      });

      map.addLayer({
        id: 'aqi-heatmap-layer',
        type: 'circle',
        source: 'aqi-heatmap-source',
        paint: {
          'circle-color': [
            'match', ['get', 'category'],
            'Good', '#10b981',
            'Satisfactory', '#84cc16',
            'Moderate', '#eab308',
            'Poor', '#f97316',
            'Very Poor', '#ef4444',
            'Severe', '#881337',
            '#64748b',
          ],
          'circle-radius': ['interpolate', ['linear'], ['zoom'], 8, 14, 10, 28, 12, 44, 14, 64],
          'circle-blur': 0.9,
          'circle-opacity': [
            'match', ['get', 'category'],
            'Good', 0.14,
            'Satisfactory', 0.18,
            'Moderate', 0.24,
            'Poor', 0.3,
            'Very Poor', 0.36,
            'Severe', 0.42,
            0,
          ],
        },
      });
    }

    // 3. Delhi Road Corridors Layer
    if (!map.getSource('delhi-roads-source')) {
      map.addSource('delhi-roads-source', {
        type: 'geojson',
        data: getRoadsGeoJSON(roadsRef.current),
      });

      // Road background/casing
      map.addLayer({
        id: 'delhi-roads-casing',
        type: 'line',
        source: 'delhi-roads-source',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#080c14',
          'line-width': 7,
          'line-opacity': 0.8,
        },
      });

      // Road traffic colored line
      map.addLayer({
        id: 'delhi-roads-line',
        type: 'line',
        source: 'delhi-roads-source',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': [
            'interpolate',
            ['linear'],
            ['zoom'],
            9, 3.5,
            12, 5.5,
            15, 8.0,
          ],
          'line-opacity': 0.95,
        },
      });

      // Subtle glow for high/severe congestion roads
      map.addLayer({
        id: 'delhi-roads-glow',
        type: 'line',
        source: 'delhi-roads-source',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': 12,
          'line-blur': 4,
          'line-opacity': [
            'case',
            ['==', ['get', 'congestionLevel'], 'Severe'], 0.45,
            ['==', ['get', 'congestionLevel'], 'High'], 0.25,
            0.0,
          ],
        },
      });
    }

    // 4. Traffic Incident Markers Layer
    if (!map.getSource('delhi-incidents-source')) {
      map.addSource('delhi-incidents-source', {
        type: 'geojson',
        data: getIncidentsGeoJSON(incidentsRef.current),
      });

      // Outer alert pulse circle
      map.addLayer({
        id: 'delhi-incidents-pulse',
        type: 'circle',
        source: 'delhi-incidents-source',
        paint: {
          'circle-radius': 14,
          'circle-color': '#ef4444',
          'circle-opacity': 0.35,
          'circle-stroke-width': 1,
          'circle-stroke-color': '#f87171',
        },
      });

      // Inner alert icon point
      map.addLayer({
        id: 'delhi-incidents-point',
        type: 'circle',
        source: 'delhi-incidents-source',
        paint: {
          'circle-radius': 7,
          'circle-color': '#f59e0b',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });
    }

    // 5. CPCB AQI Monitoring Stations Layer
    if (!map.getSource('delhi-stations-source')) {
      map.addSource('delhi-stations-source', {
        type: 'geojson',
        data: getStationsGeoJSON(stationsRef.current),
      });

      // Outer station halo
      map.addLayer({
        id: 'delhi-stations-halo',
        type: 'circle',
        source: 'delhi-stations-source',
        paint: {
          'circle-radius': 11,
          'circle-color': '#080c14',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#38bdf8',
          'circle-opacity': 0.9,
        },
      });

      // Inner station color circle
      map.addLayer({
        id: 'delhi-stations-point',
        type: 'circle',
        source: 'delhi-stations-source',
        paint: {
          'circle-radius': 6,
          'circle-color': [
            'match',
            ['get', 'category'],
            'Good', '#10b981',
            'Satisfactory', '#84cc16',
            'Moderate', '#eab308',
            'Poor', '#f97316',
            'Very Poor', '#ef4444',
            'Severe', '#881337',
            '#06b6d4',
          ],
        },
      });

      // Station AQI text label
      map.addLayer({
        id: 'delhi-stations-label',
        type: 'symbol',
        source: 'delhi-stations-source',
        layout: {
          'text-field': ['to-string', ['get', 'aqi']],
          'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
          'text-size': 10,
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
          'text-allow-overlap': false,
        },
        paint: {
          'text-color': '#ffffff',
          'text-halo-color': '#080c14',
          'text-halo-width': 2,
        },
      });
    }

    // Keep the city overlays above every basemap's own style layers. This is
    // required because setStyle replaces the entire style and its layer stack.
    [
      'delhi-osm-roads-layer',
      'aqi-heatmap-layer',
      'delhi-boundary-fill',
      'delhi-roads-casing',
      'delhi-roads-line',
      'delhi-roads-glow',
      'delhi-incidents-pulse',
      'delhi-incidents-point',
      'delhi-stations-halo',
      'delhi-stations-point',
      'delhi-boundary-line',
      'delhi-stations-label',
    ].forEach((layerId) => {
      if (map.getLayer(layerId)) map.moveLayer(layerId);
    });

    // Setup click and hover handlers once per map instance. Style changes
    // replace layers but retain map-level delegated handlers.
    if (interactionsInitializedRef.current) return;
    interactionsInitializedRef.current = true;
    // Click on Stations
    map.on('click', 'delhi-stations-halo', (e) => {
      if (e.features && e.features[0]) {
        const id = e.features[0].properties?.id;
        const station = stationsRef.current.find((s) => s.id === id);
        if (station) {
          setSelectedFeature({ type: 'station', data: station });
          map.flyTo({
            center: station.coordinates,
            zoom: Math.max(map.getZoom(), 12.5),
            duration: 1000,
          });
        }
      }
    });

    // Click on Roads
    map.on('click', 'delhi-roads-line', (e) => {
      if (e.features && e.features[0]) {
        const id = e.features[0].properties?.id;
        const road = roadsRef.current.find((r) => r.id === id);
        if (road) {
          setSelectedFeature({ type: 'road', data: road });
        }
      }
    });

    // Click on Incidents
    map.on('click', 'delhi-incidents-point', (e) => {
      if (e.features && e.features[0]) {
        const id = e.features[0].properties?.id;
        const incident = incidentsRef.current.find((inc) => inc.id === id);
        if (incident) {
          setSelectedFeature({ type: 'incident', data: incident });
          map.flyTo({
            center: incident.coordinates,
            zoom: 13.5,
            duration: 1000,
          });
        }
      }
    });

    // Hover pointer changes
    const interactiveLayers = ['delhi-stations-halo', 'delhi-roads-line', 'delhi-incidents-point'];
    interactiveLayers.forEach((layerId) => {
      map.on('mouseenter', layerId, () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', layerId, () => {
        map.getCanvas().style.cursor = '';
      });
    });
  }, [setSelectedFeature]);

  // Update Dynamic Sources when live telemetry changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (stations && stations.length > 0) {
      const stationsSource = map.getSource('delhi-stations-source') as maplibregl.GeoJSONSource | undefined;
      if (stationsSource) {
        stationsSource.setData(getStationsGeoJSON(stations));
      }
      const heatmapSource = map.getSource('aqi-heatmap-source') as maplibregl.GeoJSONSource | undefined;
      if (heatmapSource) {
        heatmapSource.setData(getAQIHeatmapGeoJSON(stations));
      }
    }

    if (roads && roads.length > 0) {
      const roadsSource = map.getSource('delhi-roads-source') as maplibregl.GeoJSONSource | undefined;
      if (roadsSource) {
        roadsSource.setData(getRoadsGeoJSON(roads));
      }
    }

    if (incidents && incidents.length > 0) {
      const incidentsSource = map.getSource('delhi-incidents-source') as maplibregl.GeoJSONSource | undefined;
      if (incidentsSource) {
        incidentsSource.setData(getIncidentsGeoJSON(incidents));
      }
    }
  }, [stations, roads, incidents, mapLoaded, styleRevision]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: getStyleUrl(mapStyle),
      center: DELHI_CENTER,
      zoom: DELHI_INITIAL_ZOOM,
      minZoom: 8.5,
      maxZoom: 18,
      attributionControl: false,
    });

    // Add scale and attribution control
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

    map.on('load', () => {
      mapRef.current = map;
      addDigitalTwinLayers(map);
      appliedStyleRef.current = mapStyle;
      setMapLoaded(true);

      // Fit entire NCT of Delhi on initial load
      map.fitBounds(DELHI_BOUNDS, {
        padding: 30,
        duration: 1000,
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
      interactionsInitializedRef.current = false;
    };
  }, []);

  // Handle Map Style Changes (Dark, Light, Satellite)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (appliedStyleRef.current === mapStyle) return;

    // Register before setStyle so even fast/local styles cannot race the
    // restoration callback.
    map.once('style.load', () => {
      addDigitalTwinLayers(map);
      appliedStyleRef.current = mapStyle;
      setStyleRevision((revision) => revision + 1);
    });
    // A full style swap clears runtime-added sources and layers. The style
    // load callback above then recreates our GeoJSON overlays from live refs.
    map.setStyle(getStyleUrl(mapStyle), { diff: false });
  }, [mapStyle, addDigitalTwinLayers]);

  // Handle Layer Visibility Toggles
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Traffic layers
    const trafficVisibility = layers.traffic ? 'visible' : 'none';
    if (map.getLayer('delhi-osm-roads-layer')) map.setLayoutProperty('delhi-osm-roads-layer', 'visibility', trafficVisibility);
    if (map.getLayer('delhi-roads-casing')) map.setLayoutProperty('delhi-roads-casing', 'visibility', trafficVisibility);
    if (map.getLayer('delhi-roads-line')) map.setLayoutProperty('delhi-roads-line', 'visibility', trafficVisibility);
    if (map.getLayer('delhi-roads-glow')) map.setLayoutProperty('delhi-roads-glow', 'visibility', trafficVisibility);

    // AQI Heatmap layer
    const aqiVisibility = layers.aqiHeatmap ? 'visible' : 'none';
    if (map.getLayer('aqi-heatmap-layer')) map.setLayoutProperty('aqi-heatmap-layer', 'visibility', aqiVisibility);

    // AQI Stations layers
    const stationsVisibility = layers.aqiStations ? 'visible' : 'none';
    if (map.getLayer('delhi-stations-halo')) map.setLayoutProperty('delhi-stations-halo', 'visibility', stationsVisibility);
    if (map.getLayer('delhi-stations-point')) map.setLayoutProperty('delhi-stations-point', 'visibility', stationsVisibility);
    if (map.getLayer('delhi-stations-label')) map.setLayoutProperty('delhi-stations-label', 'visibility', stationsVisibility);

    // Incidents layers
    const incidentsVisibility = layers.incidents ? 'visible' : 'none';
    if (map.getLayer('delhi-incidents-pulse')) map.setLayoutProperty('delhi-incidents-pulse', 'visibility', incidentsVisibility);
    if (map.getLayer('delhi-incidents-point')) map.setLayoutProperty('delhi-incidents-point', 'visibility', incidentsVisibility);

    // Delhi Boundary layers
    const boundaryVisibility = layers.delhiBoundary ? 'visible' : 'none';
    if (map.getLayer('delhi-boundary-line')) map.setLayoutProperty('delhi-boundary-line', 'visibility', boundaryVisibility);
    if (map.getLayer('delhi-boundary-fill')) map.setLayoutProperty('delhi-boundary-fill', 'visibility', boundaryVisibility);
  }, [layers, mapLoaded, styleRevision]);

  // Handle Congestion Filter on Roads
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (map.getLayer('delhi-roads-line')) {
      if (selectedCongestionFilter === 'All') {
        map.setFilter('delhi-roads-line', null);
        if (map.getLayer('delhi-roads-casing')) map.setFilter('delhi-roads-casing', null);
      } else {
        const filterExpr: any = ['==', ['get', 'congestionLevel'], selectedCongestionFilter];
        map.setFilter('delhi-roads-line', filterExpr);
        if (map.getLayer('delhi-roads-casing')) map.setFilter('delhi-roads-casing', filterExpr);
      }
    }
  }, [selectedCongestionFilter, mapLoaded, styleRevision]);

  // Handle AQI Category Filter on Stations
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (map.getLayer('delhi-stations-point')) {
      if (selectedAQIFilter === 'All') {
        map.setFilter('delhi-stations-point', null);
        if (map.getLayer('delhi-stations-halo')) map.setFilter('delhi-stations-halo', null);
        if (map.getLayer('delhi-stations-label')) map.setFilter('delhi-stations-label', null);
      } else {
        const filterExpr: any = ['==', ['get', 'category'], selectedAQIFilter];
        map.setFilter('delhi-stations-point', filterExpr);
        if (map.getLayer('delhi-stations-halo')) map.setFilter('delhi-stations-halo', filterExpr);
        if (map.getLayer('delhi-stations-label')) map.setFilter('delhi-stations-label', filterExpr);
      }
    }
  }, [selectedAQIFilter, mapLoaded, styleRevision]);

  // Handle FlyTo Location when triggered from sidebar or hotspot
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !flyToLocation) return;

    map.flyTo({
      center: flyToLocation,
      zoom: 13,
      duration: 1200,
    });
  }, [flyToLocation, mapLoaded]);

  // Handle Reset View Trigger
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || resetViewTrigger === 0) return;

    map.fitBounds(DELHI_BOUNDS, {
      padding: 30,
      duration: 1000,
    });
  }, [resetViewTrigger, mapLoaded]);

  return (
    <div className="relative w-full h-full flex-1 overflow-hidden select-none bg-[#080c14]">
      {/* MapLibre WebGL Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Legend */}
      <MapLegend showTraffic={layers.traffic} showAQI={layers.aqiHeatmap} />

      {/* Contextual Clicked Feature Popup / Modal Drawer */}
      <MapPopup
        selectedFeature={selectedFeature}
        onClose={() => setSelectedFeature(null)}
        onNavigateToSimulation={onNavigateToSimulation}
      />
    </div>
  );
};
