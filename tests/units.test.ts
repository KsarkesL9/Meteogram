import { describe, expect, it } from 'vitest';
import {
  convertPrecipitation,
  convertTemperature,
  convertWindSpeed,
} from '../src/lib/units';

describe('convertTemperature', () => {
  it('converts celsius to fahrenheit', () => {
    expect(convertTemperature(0, 'fahrenheit')).toBe(32);
    expect(convertTemperature(100, 'fahrenheit')).toBe(212);
    expect(convertTemperature(-40, 'fahrenheit')).toBe(-40);
  });

  it('keeps celsius unchanged', () => {
    expect(convertTemperature(21.5, 'celsius')).toBe(21.5);
  });
});

describe('convertWindSpeed', () => {
  it('converts meters per second to kilometers per hour', () => {
    expect(convertWindSpeed(10, 'kmh')).toBeCloseTo(36, 10);
  });

  it('converts meters per second to knots', () => {
    expect(convertWindSpeed(1, 'kn')).toBeCloseTo(1.94384, 4);
  });

  it('converts meters per second to miles per hour', () => {
    expect(convertWindSpeed(1, 'mph')).toBeCloseTo(2.23694, 4);
  });

  it('keeps meters per second unchanged', () => {
    expect(convertWindSpeed(7.2, 'ms')).toBe(7.2);
  });
});

describe('convertPrecipitation', () => {
  it('converts millimeters to inches', () => {
    expect(convertPrecipitation(25.4, 'inch')).toBe(1);
  });

  it('keeps millimeters unchanged', () => {
    expect(convertPrecipitation(3.3, 'mm')).toBe(3.3);
  });
});
