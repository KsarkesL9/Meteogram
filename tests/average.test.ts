import { describe, expect, it } from 'vitest';
import {
  computeMultiModelAverage,
  countSeriesWithData,
} from '../src/lib/average';

describe('computeMultiModelAverage', () => {
  it('averages values across models at each time step', () => {
    expect(
      computeMultiModelAverage([
        [10, 20],
        [20, 40],
      ]),
    ).toEqual([15, 30]);
  });

  it('skips a model with no data at a time step', () => {
    expect(
      computeMultiModelAverage([
        [10, 20],
        [null, 40],
      ]),
    ).toEqual([10, 30]);
  });

  it('returns null when no model has data at a time step', () => {
    expect(
      computeMultiModelAverage([
        [null, 5],
        [null, 7],
      ]),
    ).toEqual([null, 6]);
  });

  it('returns an empty series for an empty model list', () => {
    expect(computeMultiModelAverage([])).toEqual([]);
  });

  it('follows the remaining models when one series is entirely null', () => {
    // ECMWF delivers no CIN at all - the average must equal the data-bearing models
    expect(
      computeMultiModelAverage([
        [null, null, null],
        [100, 200, 300],
        [200, 300, 400],
      ]),
    ).toEqual([150, 250, 350]);
  });
});

describe('countSeriesWithData', () => {
  it('ignores series that are entirely null', () => {
    expect(
      countSeriesWithData([
        [null, null],
        [1, 2],
        [null, 3],
      ]),
    ).toBe(2);
  });

  it('returns zero for no series at all', () => {
    expect(countSeriesWithData([])).toBe(0);
  });
});
