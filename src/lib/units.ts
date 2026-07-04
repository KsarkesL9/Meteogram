import type { ForecastParameter, ForecastSeries } from '../types/forecast';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'ms' | 'kmh' | 'kn' | 'mph';
export type PrecipitationUnit = 'mm' | 'inch';

export interface UnitPreferences {
  temperature: TemperatureUnit;
  windSpeed: WindSpeedUnit;
  precipitation: PrecipitationUnit;
}

export const DEFAULT_UNIT_PREFERENCES: UnitPreferences = {
  temperature: 'celsius',
  windSpeed: 'ms',
  precipitation: 'mm',
};

const KMH_PER_MS = 3.6;
const KNOTS_PER_MS = 3600 / 1852;
const MPH_PER_MS = 3600 / 1609.344;
const MM_PER_INCH = 25.4;

export function convertTemperature(
  celsius: number,
  unit: TemperatureUnit,
): number {
  return unit === 'celsius' ? celsius : celsius * 1.8 + 32;
}

export function convertWindSpeed(
  metersPerSecond: number,
  unit: WindSpeedUnit,
): number {
  switch (unit) {
    case 'ms':
      return metersPerSecond;
    case 'kmh':
      return metersPerSecond * KMH_PER_MS;
    case 'kn':
      return metersPerSecond * KNOTS_PER_MS;
    case 'mph':
      return metersPerSecond * MPH_PER_MS;
  }
}

export function convertPrecipitation(
  millimeters: number,
  unit: PrecipitationUnit,
): number {
  return unit === 'mm' ? millimeters : millimeters / MM_PER_INCH;
}

type UnitKind =
  | 'temperature'
  | 'windSpeed'
  | 'precipitation'
  | 'pressure'
  | 'percent'
  | 'energy'
  | 'height'
  | 'angle';

const PARAMETER_UNIT_KINDS: Record<ForecastParameter, UnitKind> = {
  temperature: 'temperature',
  dewPoint: 'temperature',
  rain: 'precipitation',
  showers: 'precipitation',
  snowfall: 'precipitation',
  mslp: 'pressure',
  windSpeed: 'windSpeed',
  windGusts: 'windSpeed',
  windDirection: 'angle',
  cloudCoverLow: 'percent',
  cloudCoverMid: 'percent',
  cloudCoverHigh: 'percent',
  relativeHumidity: 'percent',
  cape: 'energy',
  cin: 'energy',
  freezingLevel: 'height',
};

// FR-18: only temperature, wind and precipitation are user-switchable; the rest is fixed
export function convertParameterValue(
  parameter: ForecastParameter,
  value: number,
  preferences: UnitPreferences,
): number {
  switch (PARAMETER_UNIT_KINDS[parameter]) {
    case 'temperature':
      return convertTemperature(value, preferences.temperature);
    case 'windSpeed':
      return convertWindSpeed(value, preferences.windSpeed);
    case 'precipitation':
      return convertPrecipitation(value, preferences.precipitation);
    default:
      return value;
  }
}

export function convertForecastSeries(
  parameter: ForecastParameter,
  series: ForecastSeries,
  preferences: UnitPreferences,
): ForecastSeries {
  return series.map((value) =>
    value === null
      ? null
      : convertParameterValue(parameter, value, preferences),
  );
}

const WIND_UNIT_LABELS: Record<WindSpeedUnit, string> = {
  ms: 'm/s',
  kmh: 'km/h',
  kn: 'kn',
  mph: 'mph',
};

export function parameterUnitLabel(
  parameter: ForecastParameter,
  preferences: UnitPreferences,
): string {
  switch (PARAMETER_UNIT_KINDS[parameter]) {
    case 'temperature':
      return preferences.temperature === 'celsius' ? '°C' : '°F';
    case 'windSpeed':
      return WIND_UNIT_LABELS[preferences.windSpeed];
    case 'precipitation':
      return preferences.precipitation === 'mm' ? 'mm' : 'in';
    case 'pressure':
      return 'hPa';
    case 'percent':
      return '%';
    case 'energy':
      return 'J/kg';
    case 'height':
      return 'm';
    case 'angle':
      return '°';
  }
}
