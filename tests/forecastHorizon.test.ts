import { describe, expect, it } from 'vitest';
import { findLastStepWithData } from '../src/lib/forecastHorizon';

describe('findLastStepWithData', () => {
  it('ends at the longest data-bearing series', () => {
    expect(
      findLastStepWithData([
        [1, 2, null, null],
        [1, 2, 3, null],
      ]),
    ).toBe(2);
  });

  it('covers the full range when a series has no padding', () => {
    expect(findLastStepWithData([[1, null, 3]])).toBe(2);
  });

  it('returns minus one when every value is null', () => {
    expect(findLastStepWithData([[null, null], [null]])).toBe(-1);
  });

  it('returns minus one for no series', () => {
    expect(findLastStepWithData([])).toBe(-1);
  });
});
