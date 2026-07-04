import { describe, expect, it } from 'vitest';
import { findClosestTimeIndex, toLocationIso } from '../src/lib/localTime';

describe('toLocationIso', () => {
  it('shifts the utc epoch by the location offset', () => {
    expect(toLocationIso(0, 3600)).toBe('1970-01-01T01:00:00');
    expect(toLocationIso(1783144800, -21600)).toBe('2026-07-04T00:00:00');
  });

  it('keeps utc when the offset is zero', () => {
    expect(toLocationIso(1783144800, 0)).toBe('2026-07-04T06:00:00');
  });
});

describe('findClosestTimeIndex', () => {
  const timestamps = [0, 3600, 7200, 10800];

  it('finds the exact matching step', () => {
    expect(findClosestTimeIndex(timestamps, 7200)).toBe(2);
  });

  it('rounds to the nearest step', () => {
    expect(findClosestTimeIndex(timestamps, 5000)).toBe(1);
    expect(findClosestTimeIndex(timestamps, 5500)).toBe(2);
  });

  it('clamps targets outside the range', () => {
    expect(findClosestTimeIndex(timestamps, -999)).toBe(0);
    expect(findClosestTimeIndex(timestamps, 99999)).toBe(3);
  });
});
