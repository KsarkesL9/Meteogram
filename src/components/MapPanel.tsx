import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { omProtocol } from '@openmeteo/weather-map-layer';
import 'maplibre-gl/dist/maplibre-gl.css';
import { buildWeatherLayerSources } from '../lib/mapLayers';
import type { MapLayerKind, WeatherLayerSources } from '../lib/mapLayers';
import type { GeoCoordinates, ModelId } from '../types/forecast';

maplibregl.addProtocol('om', omProtocol);

const BASEMAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
const WEATHER_RASTER_SOURCE = 'weather-raster';
const WEATHER_RASTER_LAYER = 'weather-raster-layer';
const WEATHER_VECTOR_SOURCE = 'weather-vector';
const WEATHER_VECTOR_LAYER = 'weather-vector-layer';

interface MapPanelProps {
  center: GeoCoordinates;
  selectedLocation: GeoCoordinates | null;
  layerModel: ModelId;
  layerKind: MapLayerKind;
  onLocationSelected: (coordinates: GeoCoordinates) => void;
}

export function MapPanel({
  center,
  selectedLocation,
  layerModel,
  layerKind,
  onLocationSelected,
}: MapPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const initialCenterRef = useRef(center);
  const onLocationSelectedRef = useRef(onLocationSelected);

  useEffect(() => {
    onLocationSelectedRef.current = onLocationSelected;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (container === null) {
      return;
    }
    const map = new maplibregl.Map({
      container,
      style: BASEMAP_STYLE_URL,
      center: [
        initialCenterRef.current.longitude,
        initialCenterRef.current.latitude,
      ],
      zoom: 5,
    });
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      'top-left',
    );
    map.on('click', (event) => {
      onLocationSelectedRef.current({
        latitude: event.lngLat.lat,
        longitude: event.lngLat.lng,
      });
    });
    mapRef.current = map;
    return () => {
      mapRef.current = null;
      map.remove();
    };
  }, []);

  useEffect(() => {
    mapRef.current?.easeTo({ center: [center.longitude, center.latitude] });
  }, [center]);

  useEffect(() => {
    const map = mapRef.current;
    if (map === null || selectedLocation === null) {
      return;
    }
    markerRef.current ??= new maplibregl.Marker({ color: '#2c3e50' });
    markerRef.current
      .setLngLat([selectedLocation.longitude, selectedLocation.latitude])
      .addTo(map);
  }, [selectedLocation]);

  useEffect(() => {
    const map = mapRef.current;
    if (map === null) {
      return;
    }
    const sources = buildWeatherLayerSources(layerModel, layerKind);
    const apply = () => {
      replaceWeatherLayers(map, sources);
    };
    if (map.isStyleLoaded()) {
      apply();
      return;
    }
    map.on('load', apply);
    return () => {
      map.off('load', apply);
    };
  }, [layerModel, layerKind]);

  return <div ref={containerRef} className="h-full w-full" />;
}

function replaceWeatherLayers(
  map: maplibregl.Map,
  sources: WeatherLayerSources,
): void {
  for (const layerId of [WEATHER_RASTER_LAYER, WEATHER_VECTOR_LAYER]) {
    if (map.getLayer(layerId) !== undefined) {
      map.removeLayer(layerId);
    }
  }
  for (const sourceId of [WEATHER_RASTER_SOURCE, WEATHER_VECTOR_SOURCE]) {
    if (map.getSource(sourceId) !== undefined) {
      map.removeSource(sourceId);
    }
  }
  // Weather tiles sit below the basemap labels so city names stay readable
  const labelLayerId = map
    .getStyle()
    .layers.find((layer) => layer.type === 'symbol')?.id;
  map.addSource(WEATHER_RASTER_SOURCE, {
    type: 'raster',
    url: `om://${sources.raster}`,
    maxzoom: 12,
  });
  map.addLayer(
    {
      id: WEATHER_RASTER_LAYER,
      type: 'raster',
      source: WEATHER_RASTER_SOURCE,
      paint: { 'raster-opacity': 0.75 },
    },
    labelLayerId,
  );
  if (sources.vector !== null) {
    map.addSource(WEATHER_VECTOR_SOURCE, {
      type: 'vector',
      url: `om://${sources.vector}`,
    });
    map.addLayer(
      {
        id: WEATHER_VECTOR_LAYER,
        type: 'line',
        source: WEATHER_VECTOR_SOURCE,
        'source-layer': sources.vectorSourceLayer,
        paint: { 'line-color': '#2c3e50', 'line-width': 1 },
      },
      labelLayerId,
    );
  }
}
