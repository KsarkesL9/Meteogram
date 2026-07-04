import { describe, expect, it } from 'vitest';
import { computeMultiModelAverage } from '../src/lib/average';

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
});
