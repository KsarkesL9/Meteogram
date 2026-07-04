import type { ModelId } from '../types/forecast';

export type MapLayerKind = 'temperature' | 'pressure' | 'wind';

export const MAP_TILES_URL = 'https://map-tiles.open-meteo.com/data_spatial';

// Tile-server paths are not the Forecast API model codes; gfs013 is the finest GFS grid
const MODEL_TILE_PATHS: Record<ModelId, string> = {
  gfs: 'ncep_gfs013',
  ecmwf: 'ecmwf_ifs025',
  icon: 'dwd_icon',
  hrrr: 'ncep_hrrr_conus',
};

export type WeatherLayerSources =
  | { raster: string; vector: null }
  | {
      raster: string;
      vector: string;
      vectorSourceLayer: 'contours' | 'wind-arrows';
    };

// pressure_msl is absent from the 0.13-degree GFS file; its 0.25-degree companion carries it
function tilePathFor(model: ModelId, kind: MapLayerKind): string {
  if (model === 'gfs' && kind === 'pressure') {
    return 'ncep_gfs025';
  }
  return MODEL_TILE_PATHS[model];
}

// FR-13: a single model at a time feeds the raster/vector map layer
export function buildWeatherLayerSources(
  model: ModelId,
  kind: MapLayerKind,
): WeatherLayerSources {
  const base = `${MAP_TILES_URL}/${tilePathFor(model, kind)}/latest.json?time_step=current_time_1H`;
  switch (kind) {
    case 'temperature':
      return { raster: `${base}&variable=temperature_2m`, vector: null };
    case 'pressure': {
      const raster = `${base}&variable=pressure_msl&contours=true&intervals=2`;
      return { raster, vector: raster, vectorSourceLayer: 'contours' };
    }
    case 'wind': {
      const raster = `${base}&variable=wind_u_component_10m`;
      return {
        raster,
        vector: `${raster}&arrows=true`,
        vectorSourceLayer: 'wind-arrows',
      };
    }
  }
}
