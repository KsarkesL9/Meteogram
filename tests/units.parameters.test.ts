import { describe, expect, it } from 'vitest';
import {
  DEFAULT_UNIT_PREFERENCES,
  convertForecastSeries,
  convertParameterValue,
  parameterUnitLabel,
} from '../src/lib/units';
import type { UnitPreferences } from '../src/lib/units';

const IMPERIAL: UnitPreferences = {
  temperature: 'fahrenheit',
  windSpeed: 'mph',
  precipitation: 'inch',
};

describe('convertParameterValue', () => {
  it('routes temperature-kind parameters through the temperature unit', () => {
    expect(convertParameterValue('dewPoint', 0, IMPERIAL)).toBe(32);
  });

  it('routes wind gusts through the wind unit', () => {
    expect(convertParameterValue('windGusts', 1, IMPERIAL)).toBeCloseTo(
      2.23694,
      4,
    );
  });

  it('routes snowfall through the precipitation unit', () => {
    expect(convertParameterValue('snowfall', 25.4, IMPERIAL)).toBe(1);
  });

  it('leaves fixed-unit parameters untouched', () => {
    expect(convertParameterValue('mslp', 1013.2, IMPERIAL)).toBe(1013.2);
    expect(convertParameterValue('cape', 850, IMPERIAL)).toBe(850);
  });
});

describe('convertForecastSeries', () => {
  it('converts values and passes nulls through', () => {
    expect(
      convertForecastSeries('temperature', [0, null, 100], IMPERIAL),
    ).toEqual([32, null, 212]);
  });
});

describe('parameterUnitLabel', () => {
  it('follows the user preference for switchable units', () => {
    expect(parameterUnitLabel('temperature', DEFAULT_UNIT_PREFERENCES)).toBe(
      '°C',
    );
    expect(parameterUnitLabel('temperature', IMPERIAL)).toBe('°F');
    expect(parameterUnitLabel('windSpeed', IMPERIAL)).toBe('mph');
    expect(parameterUnitLabel('rain', IMPERIAL)).toBe('in');
  });

  it('keeps fixed labels for the remaining parameters', () => {
    expect(parameterUnitLabel('mslp', IMPERIAL)).toBe('hPa');
    expect(parameterUnitLabel('relativeHumidity', IMPERIAL)).toBe('%');
    expect(parameterUnitLabel('cin', IMPERIAL)).toBe('J/kg');
    expect(parameterUnitLabel('freezingLevel', IMPERIAL)).toBe('m');
  });
});
