import { describe, expect, it } from 'vitest';
import { computeMeanWindDirection } from '../src/lib/windDirection';

describe('computeMeanWindDirection', () => {
  it('averages across the north wrap-around', () => {
    expect(computeMeanWindDirection([350, 10])).toBeCloseTo(0, 6);
  });

  it('averages ordinary directions', () => {
    expect(computeMeanWindDirection([90, 180])).toBeCloseTo(135, 6);
  });

  it('skips models without direction data', () => {
    expect(computeMeanWindDirection([null, 270])).toBeCloseTo(270, 6);
  });

  it('returns null when no model has direction data', () => {
    expect(computeMeanWindDirection([null, null])).toBeNull();
  });
});
