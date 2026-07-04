export const MODEL_IDS = ['gfs', 'ecmwf', 'icon', 'hrrr'] as const;
export type ModelId = (typeof MODEL_IDS)[number];

export type UnixSeconds = number;

export const FORECAST_PARAMETERS = [
  'temperature',
  'dewPoint',
  'rain',
  'showers',
  'snowfall',
  'mslp',
  'windSpeed',
  'windGusts',
  'windDirection',
  'cloudCoverLow',
  'cloudCoverMid',
  'cloudCoverHigh',
  'relativeHumidity',
  'cape',
  'cin',
  'freezingLevel',
] as const;
export type ForecastParameter = (typeof FORECAST_PARAMETERS)[number];

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

// FR-04/FR-05: a gap in model data is a value (null), never an exception
export type ForecastSeries = (number | null)[];

export interface ModelForecast {
  parameters: Record<ForecastParameter, ForecastSeries>;
}

export interface LocationForecast {
  coordinates: GeoCoordinates;
  elevation: number;
  timezone: string;
  utcOffsetSeconds: number;
  timestamps: UnixSeconds[];
  models: Partial<Record<ModelId, ModelForecast>>;
}
