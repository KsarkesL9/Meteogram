import { describe, expect, it } from 'vitest';
import {
  MAX_ARCHIVED_RUNS,
  formatRunParam,
  listRecentRunTimestamps,
} from '../src/lib/modelRuns';

// 2026-07-04T13:00:00Z
const NOW = Date.parse('2026-07-04T13:00:00Z') / 1000;

describe('listRecentRunTimestamps', () => {
  it('floors the newest gfs run to the six-hour cycle behind the lag', () => {
    const runs = listRecentRunTimestamps('gfs', NOW);
    // 13:00 - 5h lag = 08:00 -> floored to the 06:00Z run
    expect(formatRunParam(runs[0])).toBe('2026-07-04T06:00');
  });

  it('steps back one cycle per entry', () => {
    const runs = listRecentRunTimestamps('gfs', NOW);
    expect(runs).toHaveLength(MAX_ARCHIVED_RUNS);
    expect(runs[0] - runs[1]).toBe(6 * 3600);
    expect(formatRunParam(runs[9])).toBe('2026-07-02T00:00');
  });

  it('uses the hourly cycle of hrrr', () => {
    const runs = listRecentRunTimestamps('hrrr', NOW);
    expect(formatRunParam(runs[0])).toBe('2026-07-04T11:00');
    expect(runs[0] - runs[1]).toBe(3600);
  });
});

describe('formatRunParam', () => {
  it('formats a zone-less utc minute stamp', () => {
    expect(formatRunParam(0)).toBe('1970-01-01T00:00');
  });
});
