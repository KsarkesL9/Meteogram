import { describe, expect, it } from 'vitest';
import { isLocationCovered, listCoveredModels } from '../src/lib/modelCoverage';

const WARSAW = { latitude: 52.23, longitude: 21.01 };
const DENVER = { latitude: 39.74, longitude: -104.99 };
const HONOLULU = { latitude: 21.3, longitude: -157.8 };
const ANCHORAGE = { latitude: 61.2, longitude: -149.9 };

describe('isLocationCovered', () => {
  it('covers any location for global models', () => {
    expect(isLocationCovered('gfs', WARSAW)).toBe(true);
    expect(isLocationCovered('ecmwf', HONOLULU)).toBe(true);
    expect(isLocationCovered('icon', ANCHORAGE)).toBe(true);
  });

  it('covers a location inside the hrrr grid rectangle', () => {
    expect(isLocationCovered('hrrr', DENVER)).toBe(true);
  });

  it('excludes hrrr outside the grid rectangle', () => {
    expect(isLocationCovered('hrrr', WARSAW)).toBe(false);
    expect(isLocationCovered('hrrr', HONOLULU)).toBe(false);
    expect(isLocationCovered('hrrr', ANCHORAGE)).toBe(false);
  });

  it('treats the rectangle border as covered', () => {
    expect(
      isLocationCovered('hrrr', { latitude: 21.1, longitude: -134.1 }),
    ).toBe(true);
    expect(
      isLocationCovered('hrrr', { latitude: 52.6, longitude: -60.9 }),
    ).toBe(true);
  });
});

describe('listCoveredModels', () => {
  it('lists all four models inside hrrr coverage', () => {
    expect(listCoveredModels(DENVER)).toEqual(['gfs', 'ecmwf', 'icon', 'hrrr']);
  });

  it('lists only global models elsewhere', () => {
    expect(listCoveredModels(WARSAW)).toEqual(['gfs', 'ecmwf', 'icon']);
  });
});
