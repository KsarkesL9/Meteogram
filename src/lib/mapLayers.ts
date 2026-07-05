import type { ModelId, UnixSeconds } from '../types/forecast';

export type MapLayerKind = 'temperature' | 'pressure' | 'wind';

export const MAP_TILES_URL = 'https://map-tiles.open-meteo.com/data_spatial';

// Tile-server paths are not the Forecast API model codes; gfs013 is the finest GFS grid
const MODEL_TILE_PATHS: Record<ModelId, string> = {
  gfs: 'ncep_gfs013',
  ecmwf: 'ecmwf_ifs025',
  icon: 'dwd_icon',
  hrrr: 'ncep_hrrr_conus',
};

// Keys of the color scales that @openmeteo/weather-map-layer ships per layer kind
export const LAYER_COLOR_SCALE_KEYS: Record<MapLayerKind, string> = {
  temperature: 'temperature',
  pressure: 'pressure',
  wind: 'wind',
};

export type WeatherLayerSources =
  | { raster: string; vector: null }
  | {
      raster: string;
      vector: string;
      vectorSourceLayer: 'contours' | 'wind-arrows';
    };

// FR-14: a concrete om file of the newest run replaces latest.json once the
// tile schedule is known, so the map layer can follow the time slider
export interface WeatherLayerFrame {
  referenceTime: string;
  validTime: string;
}

// pressure_msl is absent from the 0.13-degree GFS file; its 0.25-degree companion carries it
export function weatherLayerTilePath(
  model: ModelId,
  kind: MapLayerKind,
): string {
  if (model === 'gfs' && kind === 'pressure') {
    return 'ncep_gfs025';
  }
  return MODEL_TILE_PATHS[model];
}

// 2026-07-05T00:00:00Z + 2026-07-05T13:00Z -> 2026/07/05/0000Z/2026-07-05T1300.om
function omFilePath(frame: WeatherLayerFrame): string {
  const runDate = frame.referenceTime.slice(0, 10).replaceAll('-', '/');
  const runHour = frame.referenceTime.slice(11, 16).replace(':', '');
  const validCompact = `${frame.validTime.slice(0, 13)}${frame.validTime.slice(14, 16)}`;
  return `${runDate}/${runHour}Z/${validCompact}.om`;
}

export function findClosestValidTime(
  validTimes: readonly string[],
  target: UnixSeconds,
): string | null {
  let closest: string | null = null;
  let closestDistance = Number.POSITIVE_INFINITY;
  for (const validTime of validTimes) {
    const distance = Math.abs(Date.parse(validTime) / 1000 - target);
    if (distance < closestDistance) {
      closest = validTime;
      closestDistance = distance;
    }
  }
  return closest;
}

// FR-13: a single model at a time feeds the raster/vector map layer
export function buildWeatherLayerSources(
  model: ModelId,
  kind: MapLayerKind,
  frame?: WeatherLayerFrame,
): WeatherLayerSources {
  const file = frame === undefined ? 'latest.json' : omFilePath(frame);
  const path = `${MAP_TILES_URL}/${weatherLayerTilePath(model, kind)}/${file}`;
  const timeQuery = frame === undefined ? 'time_step=current_time_1H&' : '';
  const base = `${path}?${timeQuery}`;
  switch (kind) {
    case 'temperature':
      return { raster: `${base}variable=temperature_2m`, vector: null };
    case 'pressure': {
      const raster = `${base}variable=pressure_msl&contours=true&intervals=2`;
      return { raster, vector: raster, vectorSourceLayer: 'contours' };
    }
    case 'wind': {
      const raster = `${base}variable=wind_u_component_10m`;
      return {
        raster,
        vector: `${raster}&arrows=true`,
        vectorSourceLayer: 'wind-arrows',
      };
    }
  }
}
