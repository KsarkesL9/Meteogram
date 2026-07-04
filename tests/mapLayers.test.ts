import { describe, expect, it } from 'vitest';
import { buildWeatherLayerSources } from '../src/lib/mapLayers';

describe('buildWeatherLayerSources', () => {
  it('maps every model to its tile-server path', () => {
    expect(buildWeatherLayerSources('gfs', 'temperature').raster).toContain(
      '/ncep_gfs013/',
    );
    expect(buildWeatherLayerSources('ecmwf', 'temperature').raster).toContain(
      '/ecmwf_ifs025/',
    );
    expect(buildWeatherLayerSources('icon', 'temperature').raster).toContain(
      '/dwd_icon/',
    );
    expect(buildWeatherLayerSources('hrrr', 'temperature').raster).toContain(
      '/ncep_hrrr_conus/',
    );
  });

  it('builds a raster-only temperature layer', () => {
    const sources = buildWeatherLayerSources('gfs', 'temperature');
    expect(sources.raster).toContain('variable=temperature_2m');
    expect(sources.vector).toBeNull();
  });

  it('serves gfs pressure from the quarter-degree companion file', () => {
    expect(buildWeatherLayerSources('gfs', 'pressure').raster).toContain(
      '/ncep_gfs025/',
    );
    expect(buildWeatherLayerSources('gfs', 'wind').raster).toContain(
      '/ncep_gfs013/',
    );
  });

  it('builds pressure contours from the same vector url', () => {
    const sources = buildWeatherLayerSources('icon', 'pressure');
    expect(sources.raster).toContain('variable=pressure_msl');
    expect(sources.raster).toContain('contours=true');
    if (sources.vector === null) {
      throw new Error('pressure layer must expose a vector source');
    }
    expect(sources.vector).toBe(sources.raster);
    expect(sources.vectorSourceLayer).toBe('contours');
  });

  it('builds wind arrows as a separate vector source', () => {
    const sources = buildWeatherLayerSources('hrrr', 'wind');
    expect(sources.raster).toContain('variable=wind_u_component_10m');
    if (sources.vector === null) {
      throw new Error('wind layer must expose a vector source');
    }
    expect(sources.vector).toBe(`${sources.raster}&arrows=true`);
    expect(sources.vectorSourceLayer).toBe('wind-arrows');
  });
});
