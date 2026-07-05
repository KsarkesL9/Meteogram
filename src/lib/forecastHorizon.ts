import type { ForecastSeries } from '../types/forecast';

// Shorter models are null-padded by the API to the full 16 days; the chart axis
// ends at the last step where any drawn series still carries data
export function findLastStepWithData(
  modelSeries: readonly ForecastSeries[],
): number {
  let lastStep = -1;
  for (const series of modelSeries) {
    for (let step = series.length - 1; step > lastStep; step--) {
      if (series[step] !== null) {
        lastStep = step;
        break;
      }
    }
  }
  return lastStep;
}
