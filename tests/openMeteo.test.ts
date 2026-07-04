import { describe, expect, it } from 'vitest';
import { buildForecastUrl, parseForecastResponse } from '../src/lib/openMeteo';
import type { OpenMeteoForecastResponse } from '../src/types/openMeteo';

// Variable names written out literally so a typo in the implementation cannot hide here
const HOURLY_VARIABLE_NAMES = [
  'temperature_2m',
  'dew_point_2m',
  'rain',
  'showers',
  'snowfall',
  'pressure_msl',
  'wind_speed_10m',
  'wind_gusts_10m',
  'wind_direction_10m',
  'cloud_cover_low',
  'cloud_cover_mid',
  'cloud_cover_high',
  'relative_humidity_2m',
  'cape',
  'convective_inhibition',
  'freezing_level_height',
];

function hourlyFor(apiCode: string, series: (number | null)[]) {
  return Object.fromEntries(
    HOURLY_VARIABLE_NAMES.map((name) => [`${name}_${apiCode}`, [...series]]),
  );
}

function responseWith(
  hourly: OpenMeteoForecastResponse['hourly'],
): OpenMeteoForecastResponse {
  return {
    latitude: 52.23,
    longitude: 21.01,
    elevation: 113,
    timezone: 'Europe/Warsaw',
    utc_offset_seconds: 7200,
    hourly,
  };
}

describe('buildForecastUrl', () => {
  it('maps domain model ids to api codes', () => {
    const url = new URL(
      buildForecastUrl({ latitude: 52.23, longitude: 21.01 }, [
        'gfs',
        'ecmwf',
        'icon',
      ]),
    );
    expect(url.searchParams.get('models')).toBe(
      'gfs_seamless,ecmwf_ifs025,icon_seamless',
    );
  });

  it('requests every forecast parameter from the FSD list', () => {
    const url = new URL(
      buildForecastUrl({ latitude: 39.74, longitude: -104.99 }, ['hrrr']),
    );
    const hourly = url.searchParams.get('hourly')?.split(',') ?? [];
    expect(hourly.sort()).toEqual([...HOURLY_VARIABLE_NAMES].sort());
    expect(url.searchParams.get('models')).toBe('gfs_hrrr');
  });

  it('requests utc epoch time and base units for the full horizon', () => {
    const url = new URL(
      buildForecastUrl({ latitude: 52.23, longitude: 21.01 }, ['gfs']),
    );
    expect(url.searchParams.get('timeformat')).toBe('unixtime');
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(url.searchParams.get('forecast_days')).toBe('16');
    expect(url.searchParams.get('wind_speed_unit')).toBe('ms');
  });
});

describe('parseForecastResponse', () => {
  it('parses a series for every requested model', () => {
    const response = responseWith({
      time: [1783144800, 1783148400],
      ...hourlyFor('gfs_seamless', [1, 2]),
      ...hourlyFor('ecmwf_ifs025', [3, null]),
    });
    const forecast = parseForecastResponse(response, ['gfs', 'ecmwf']);
    expect(forecast.timestamps).toEqual([1783144800, 1783148400]);
    expect(forecast.models.gfs?.parameters.temperature).toEqual([1, 2]);
    expect(forecast.models.ecmwf?.parameters.mslp).toEqual([3, null]);
    expect(forecast.utcOffsetSeconds).toBe(7200);
  });

  it('omits a model whose keys are entirely absent', () => {
    const response = responseWith({
      time: [1783144800],
      ...hourlyFor('gfs_seamless', [1]),
    });
    const forecast = parseForecastResponse(response, ['gfs', 'hrrr']);
    expect(forecast.models.gfs).toBeDefined();
    expect(forecast.models.hrrr).toBeUndefined();
  });

  it('fills a single missing variable with nulls without dropping the model', () => {
    const hourly = hourlyFor('gfs_seamless', [1, 2]);
    delete hourly.cape_gfs_seamless;
    const forecast = parseForecastResponse(
      responseWith({ time: [1783144800, 1783148400], ...hourly }),
      ['gfs'],
    );
    expect(forecast.models.gfs?.parameters.cape).toEqual([null, null]);
    expect(forecast.models.gfs?.parameters.temperature).toEqual([1, 2]);
  });

  it('converts snowfall from centimeters to millimeters', () => {
    const hourly = hourlyFor('gfs_seamless', [0, 0]);
    hourly.snowfall_gfs_seamless = [1.5, null];
    const forecast = parseForecastResponse(
      responseWith({ time: [1783144800, 1783148400], ...hourly }),
      ['gfs'],
    );
    expect(forecast.models.gfs?.parameters.snowfall).toEqual([15, null]);
  });

  it('throws when the hourly time axis is missing', () => {
    expect(() => parseForecastResponse(responseWith({}), ['gfs'])).toThrow(
      'hourly.time',
    );
  });
});
