import { formatRunParam } from './modelRuns';
import { FORECAST_PARAMETERS } from '../types/forecast';
import type {
  ForecastParameter,
  ForecastSeries,
  GeoCoordinates,
  LocationForecast,
  ModelForecast,
  ModelId,
  UnixSeconds,
} from '../types/forecast';
import type { OpenMeteoForecastResponse } from '../types/openMeteo';

export const FORECAST_API_URL = 'https://api.open-meteo.com/v1/forecast';

export const MODEL_API_CODES: Record<ModelId, string> = {
  gfs: 'gfs_seamless',
  ecmwf: 'ecmwf_ifs025',
  icon: 'icon_seamless',
  hrrr: 'gfs_hrrr',
};

const HOURLY_VARIABLES: Record<ForecastParameter, string> = {
  temperature: 'temperature_2m',
  dewPoint: 'dew_point_2m',
  rain: 'rain',
  showers: 'showers',
  snowfall: 'snowfall',
  mslp: 'pressure_msl',
  windSpeed: 'wind_speed_10m',
  windGusts: 'wind_gusts_10m',
  windDirection: 'wind_direction_10m',
  cloudCoverLow: 'cloud_cover_low',
  cloudCoverMid: 'cloud_cover_mid',
  cloudCoverHigh: 'cloud_cover_high',
  relativeHumidity: 'relative_humidity_2m',
  cape: 'cape',
  cin: 'convective_inhibition',
  freezingLevel: 'freezing_level_height',
};

// The API reports snowfall in cm; the domain precipitation unit is mm (FR-03)
const MM_PER_CM = 10;

export function buildForecastUrl(
  coordinates: GeoCoordinates,
  models: readonly ModelId[],
): string {
  const query = new URLSearchParams({
    latitude: coordinates.latitude.toString(),
    longitude: coordinates.longitude.toString(),
    hourly: Object.values(HOURLY_VARIABLES).join(','),
    models: models.map((model) => MODEL_API_CODES[model]).join(','),
    // Full available horizon in one request; shorter models are null-padded by the API
    forecast_days: '16',
    // FR-20: internal time is UTC epoch; utc_offset_seconds drives local-time display
    timeformat: 'unixtime',
    timezone: 'auto',
    // Gusts default to km/h upstream; force the FR-03 base unit
    wind_speed_unit: 'ms',
  });
  return `${FORECAST_API_URL}?${query.toString()}`;
}

export const SINGLE_RUNS_API_URL =
  'https://single-runs-api.open-meteo.com/v1/forecast';

// FR-07: one model per request; such responses carry keys without the model suffix
export function buildSingleRunUrl(
  coordinates: GeoCoordinates,
  model: ModelId,
  runTimestamp: UnixSeconds,
): string {
  const query = new URLSearchParams({
    latitude: coordinates.latitude.toString(),
    longitude: coordinates.longitude.toString(),
    hourly: Object.values(HOURLY_VARIABLES).join(','),
    models: MODEL_API_CODES[model],
    run: formatRunParam(runTimestamp),
    forecast_days: '16',
    timeformat: 'unixtime',
    timezone: 'auto',
    wind_speed_unit: 'ms',
  });
  return `${SINGLE_RUNS_API_URL}?${query.toString()}`;
}

export function parseForecastResponse(
  response: OpenMeteoForecastResponse,
  requestedModels: readonly ModelId[],
): LocationForecast {
  const rawTime = response.hourly.time;
  if (rawTime === undefined) {
    throw new Error('Open-Meteo response is missing the hourly.time array');
  }
  const timestamps: UnixSeconds[] = [];
  for (const value of rawTime) {
    if (typeof value !== 'number') {
      throw new Error('Open-Meteo hourly.time contains a non-numeric entry');
    }
    timestamps.push(value);
  }

  const models: Partial<Record<ModelId, ModelForecast>> = {};
  for (const model of requestedModels) {
    const forecast = readModelForecast(
      response.hourly,
      MODEL_API_CODES[model],
      timestamps.length,
    );
    if (forecast !== null) {
      models[model] = forecast;
    }
  }

  return {
    coordinates: { latitude: response.latitude, longitude: response.longitude },
    elevation: response.elevation,
    timezone: response.timezone,
    utcOffsetSeconds: response.utc_offset_seconds,
    timestamps,
    models,
  };
}

function readModelForecast(
  hourly: OpenMeteoForecastResponse['hourly'],
  apiCode: string,
  stepCount: number,
): ModelForecast | null {
  const parameters = {} as Record<ForecastParameter, ForecastSeries>;
  let hasAnySeries = false;
  for (const parameter of FORECAST_PARAMETERS) {
    // Single-model responses (Single Runs API) carry keys without the model suffix
    const series =
      hourly[`${HOURLY_VARIABLES[parameter]}_${apiCode}`] ??
      hourly[HOURLY_VARIABLES[parameter]];
    if (series === undefined) {
      parameters[parameter] = new Array<null>(stepCount).fill(null);
      continue;
    }
    hasAnySeries = true;
    parameters[parameter] =
      parameter === 'snowfall'
        ? series.map((value) => (value === null ? null : value * MM_PER_CM))
        : series;
  }
  // FR-21: the API omits every key of a model outside its coverage — reported as unavailable
  return hasAnySeries ? { parameters } : null;
}
