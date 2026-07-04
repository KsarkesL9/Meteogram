import type { UnixSeconds } from '../types/forecast';

const MS_PER_SECOND = 1000;

// FR-20: internal time stays UTC epoch; display shifts it by the API-provided offset
export function toLocationIso(
  timestamp: UnixSeconds,
  utcOffsetSeconds: number,
): string {
  return new Date((timestamp + utcOffsetSeconds) * MS_PER_SECOND)
    .toISOString()
    .slice(0, 19);
}

export function findClosestTimeIndex(
  timestamps: readonly UnixSeconds[],
  target: UnixSeconds,
): number {
  let closest = 0;
  for (let index = 1; index < timestamps.length; index++) {
    if (
      Math.abs(timestamps[index] - target) <
      Math.abs(timestamps[closest] - target)
    ) {
      closest = index;
    }
  }
  return closest;
}
