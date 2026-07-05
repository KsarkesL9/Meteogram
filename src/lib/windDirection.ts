// FR-15: wind direction renders as an arrow row, not a chart line; the multi-model
// direction is a circular mean because an arithmetic mean breaks at the 0/360 wrap
export function computeMeanWindDirection(
  directions: readonly (number | null)[],
): number | null {
  let sumSin = 0;
  let sumCos = 0;
  let valueCount = 0;
  for (const direction of directions) {
    if (direction === null) {
      continue;
    }
    const radians = (direction * Math.PI) / 180;
    sumSin += Math.sin(radians);
    sumCos += Math.cos(radians);
    valueCount++;
  }
  if (valueCount === 0) {
    return null;
  }
  const degrees = (Math.atan2(sumSin, sumCos) * 180) / Math.PI;
  return (degrees + 360) % 360;
}
