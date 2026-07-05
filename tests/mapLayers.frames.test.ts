import { describe, expect, it } from 'vitest';
import {
  buildWeatherLayerSources,
  findClosestValidTime,
} from '../src/lib/mapLayers';

const FRAME = {
  referenceTime: '2026-07-05T00:00:00Z',
  validTime: '2026-07-05T13:00Z',
};

describe('buildWeatherLayerSources with a frame', () => {
  it('targets the om file of the run instead of latest.json', () => {
    const sources = buildWeatherLayerSources('icon', 'temperature', FRAME);
    expect(sources.raster).toBe(
      'https://map-tiles.open-meteo.com/data_spatial/dwd_icon/2026/07/05/0000Z/2026-07-05T1300.om?variable=temperature_2m',
    );
  });

  it('keeps the current-time latest.json url without a frame', () => {
    const sources = buildWeatherLayerSources('icon', 'temperature');
    expect(sources.raster).toContain('latest.json?time_step=current_time_1H');
  });

  it('formats a non-midnight run directory', () => {
    const sources = buildWeatherLayerSources('hrrr', 'wind', {
      referenceTime: '2026-07-04T18:00:00Z',
      validTime: '2026-07-05T02:00Z',
    });
    expect(sources.raster).toContain(
      '/ncep_hrrr_conus/2026/07/04/1800Z/2026-07-05T0200.om?',
    );
  });
});

describe('findClosestValidTime', () => {
  const validTimes = [
    '2026-07-05T00:00Z',
    '2026-07-05T01:00Z',
    '2026-07-05T02:00Z',
  ];

  it('picks the nearest listed hour', () => {
    // 2026-07-05T00:40Z
    expect(
      findClosestValidTime(validTimes, Date.parse('2026-07-05T00:40Z') / 1000),
    ).toBe('2026-07-05T01:00Z');
  });

  it('clamps to the last hour beyond the range', () => {
    expect(
      findClosestValidTime(validTimes, Date.parse('2026-07-06T00:00Z') / 1000),
    ).toBe('2026-07-05T02:00Z');
  });

  it('returns null for an empty list', () => {
    expect(findClosestValidTime([], 0)).toBeNull();
  });
});
