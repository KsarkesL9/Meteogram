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
