import type { ModelId, UnixSeconds } from '../types/forecast';

const SECONDS_PER_HOUR = 3600;

export const MAX_ARCHIVED_RUNS = 10;

// FR-07: run candidates follow each model's update cycle; the lag keeps the newest
// candidate behind the provider's publication delay so it is actually downloadable
const MODEL_RUN_INTERVAL_HOURS: Record<ModelId, number> = {
  gfs: 6,
  ecmwf: 6,
  icon: 6,
  hrrr: 1,
};

const MODEL_RUN_PUBLICATION_LAG_HOURS: Record<ModelId, number> = {
  gfs: 5,
  ecmwf: 8,
  icon: 4,
  hrrr: 2,
};

export function listRecentRunTimestamps(
  model: ModelId,
  now: UnixSeconds,
): UnixSeconds[] {
  const interval = MODEL_RUN_INTERVAL_HOURS[model] * SECONDS_PER_HOUR;
  const lagged =
    now - MODEL_RUN_PUBLICATION_LAG_HOURS[model] * SECONDS_PER_HOUR;
  const newestRun = Math.floor(lagged / interval) * interval;
  return Array.from(
    { length: MAX_ARCHIVED_RUNS },
    (_, index) => newestRun - index * interval,
  );
}

// Single Runs API expects zone-less ISO minutes in UTC: 2026-07-04T06:00
export function formatRunParam(runTimestamp: UnixSeconds): string {
  return new Date(runTimestamp * 1000).toISOString().slice(0, 16);
}
