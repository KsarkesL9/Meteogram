import { describe, expect, it } from 'vitest';
import { PARAMETER_GROUPS } from '../src/lib/parameterGroups';
import { FORECAST_PARAMETERS } from '../src/types/forecast';

describe('PARAMETER_GROUPS', () => {
  it('covers every chartable parameter exactly once', () => {
    const grouped = PARAMETER_GROUPS.flatMap((group) => group.parameters);
    const chartable = FORECAST_PARAMETERS.filter(
      (parameter) => parameter !== 'windDirection',
    );
    expect([...grouped].sort()).toEqual([...chartable].sort());
  });

  it('leads the temperature tab with temperature, not dew point', () => {
    const temperatureGroup = PARAMETER_GROUPS.find(
      (group) => group.id === 'temperature',
    );
    expect(temperatureGroup?.parameters[0]).toBe('temperature');
  });
});
