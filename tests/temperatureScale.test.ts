import { describe, expect, it } from 'vitest';
import {
  TEMPERATURE_COLOR_SCALE,
  TEMPERATURE_SCALE_MAX,
} from '../src/lib/temperatureScale';

describe('TEMPERATURE_COLOR_SCALE', () => {
  const { breakpoints, colors } = TEMPERATURE_COLOR_SCALE;

  it('pairs every interval lower bound with exactly one color', () => {
    expect(colors).toHaveLength(breakpoints.length);
  });

  it('keeps breakpoints strictly increasing', () => {
    for (let index = 1; index < breakpoints.length; index++) {
      expect(breakpoints[index]).toBeGreaterThan(breakpoints[index - 1]);
    }
  });

  it('spans -60 to the declared 50-degree maximum', () => {
    expect(breakpoints[0]).toBe(-60);
    expect(breakpoints[breakpoints.length - 1]).toBeLessThan(
      TEMPERATURE_SCALE_MAX,
    );
    expect(TEMPERATURE_SCALE_MAX).toBe(50);
  });

  it('steps every three degrees across the summer range', () => {
    for (const bound of [25, 28, 31, 34, 37, 40]) {
      expect(breakpoints).toContain(bound);
    }
  });

  it('uses fully opaque rgb colors', () => {
    for (const [red, green, blue, alpha] of colors) {
      for (const channel of [red, green, blue]) {
        expect(channel).toBeGreaterThanOrEqual(0);
        expect(channel).toBeLessThanOrEqual(255);
      }
      expect(alpha).toBe(1);
    }
  });
});
