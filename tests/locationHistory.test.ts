import { describe, expect, it } from 'vitest';
import {
  MAX_LOCATION_HISTORY,
  pruneLocationHistory,
} from '../src/lib/locationHistory';

const point = (latitude: number) => ({ latitude, longitude: 0 });

describe('pruneLocationHistory', () => {
  it('adds the newest location at the front', () => {
    expect(pruneLocationHistory([point(1)], point(2))).toEqual([
      point(2),
      point(1),
    ]);
  });

  it('moves a revisited location to the front without duplicating it', () => {
    const history = [point(1), point(2), point(3)];
    expect(pruneLocationHistory(history, point(2))).toEqual([
      point(2),
      point(1),
      point(3),
    ]);
  });

  it('drops the least recently used entry beyond the limit', () => {
    const full = Array.from({ length: MAX_LOCATION_HISTORY }, (_, index) =>
      point(index),
    );
    const pruned = pruneLocationHistory(full, point(99));
    expect(pruned).toHaveLength(MAX_LOCATION_HISTORY);
    expect(pruned[0]).toEqual(point(99));
    expect(pruned).not.toContainEqual(point(MAX_LOCATION_HISTORY - 1));
  });
});
