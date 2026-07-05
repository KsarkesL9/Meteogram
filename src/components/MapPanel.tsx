import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { omProtocol } from '@openmeteo/weather-map-layer';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  buildWeatherLayerSources,
  findClosestValidTime,
  weatherLayerTilePath,
} from '../lib/mapLayers';
import type {
  MapLayerKind,
  WeatherLayerFrame,
  WeatherLayerSources,
} from '../lib/mapLayers';
import { useWeatherLayerSchedule } from '../hooks/useWeatherLayerSchedule';
import type { GeoCoordinates, ModelId, UnixSeconds } from '../types/forecast';

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
  // FR-14: the slider drives which om file the weather layer renders
  activeTime: UnixSeconds | null;
  onLocationSelected: (coordinates: GeoCoordinates) => void;
}

export function MapPanel({
  center,
  selectedLocation,
  layerModel,
  layerKind,
  activeTime,
  onLocationSelected,
}: MapPanelProps) {
  const schedule = useWeatherLayerSchedule(
    weatherLayerTilePath(layerModel, layerKind),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const initialCenterRef = useRef(center);
  const onLocationSelectedRef = useRef(onLocationSelected);
  const [isMapReady, setIsMapReady] = useState(false);

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
    map.on('load', () => {
      setIsMapReady(true);
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
    let frame: WeatherLayerFrame | undefined;
    if (schedule !== null && activeTime !== null) {
      const validTime = findClosestValidTime(schedule.validTimes, activeTime);
      if (validTime !== null) {
        frame = { referenceTime: schedule.referenceTime, validTime };
      }
    }
    const sources = buildWeatherLayerSources(layerModel, layerKind, frame);
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
  }, [layerModel, layerKind, schedule, activeTime]);

  return (
    <div className="relative h-full w-full">
      <div ref={containerRef} className="h-full w-full" />
      {!isMapReady && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-page">
          <span className="rounded border border-line bg-panel px-4 py-2 text-sm text-ink-secondary shadow">
            Ładowanie mapy…
          </span>
        </div>
      )}
    </div>
  );
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
