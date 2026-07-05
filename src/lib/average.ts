import type { ForecastSeries } from '../types/forecast';

// FR-05: arithmetic mean over models that have a value at the given time step
export function computeMultiModelAverage(
  modelSeries: readonly ForecastSeries[],
): ForecastSeries {
  if (modelSeries.length === 0) {
    return [];
  }
  const stepCount = modelSeries[0].length;
  const average: ForecastSeries = [];
  for (let step = 0; step < stepCount; step++) {
    let sum = 0;
    let valueCount = 0;
    for (const series of modelSeries) {
      const value = series[step];
      if (value !== null) {
        sum += value;
        valueCount++;
      }
    }
    average.push(valueCount > 0 ? sum / valueCount : null);
  }
  return average;
}

// FR-05: an average of a single model is that model's line drawn twice, so the
// UI draws the average only when at least two series actually carry data
export function countSeriesWithData(
  modelSeries: readonly ForecastSeries[],
): number {
  return modelSeries.filter((series) => series.some((value) => value !== null))
    .length;
}
