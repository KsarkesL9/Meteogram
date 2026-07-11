import { COLOR_SCALES } from '@openmeteo/weather-map-layer';
import { LAYER_COLOR_SCALE_KEYS } from '../lib/mapLayers';
import type { MapLayerKind } from '../lib/mapLayers';
import {
  TEMPERATURE_COLOR_SCALE,
  TEMPERATURE_SCALE_MAX,
} from '../lib/temperatureScale';

// FR-13: temperature uses the app's own stepped scale (UI spec 2.4); the other
// layers keep the palette the library renders their tiles with
export function weatherLayerColorScale(kind: MapLayerKind) {
  return kind === 'temperature'
    ? TEMPERATURE_COLOR_SCALE
    : COLOR_SCALES[LAYER_COLOR_SCALE_KEYS[kind]];
}

function cssColor([red, green, blue, alpha]: [number, number, number, number]) {
  return `rgba(${String(red)},${String(green)},${String(blue)},${String(alpha)})`;
}

interface MapScaleLegendProps {
  kind: MapLayerKind;
}

export function MapScaleLegend({ kind }: MapScaleLegendProps) {
  if (kind === 'temperature') {
    const { breakpoints, colors, unit } = TEMPERATURE_COLOR_SCALE;
    const boundaries = [...breakpoints, TEMPERATURE_SCALE_MAX];
    return (
      <div className="absolute bottom-6 left-2.5 z-10 w-80 rounded border border-line-strong bg-panel px-2 pt-1 pb-0.5 text-[10px] shadow">
        <div className="flex h-3 overflow-hidden rounded-sm">
          {colors.map((color, index) => (
            <div
              key={breakpoints[index]}
              className="grow"
              style={{ backgroundColor: cssColor(color) }}
            />
          ))}
        </div>
        <div className="relative h-3.5 text-ink-secondary">
          {boundaries.map((value, index) => {
            // Equal-width cells: every other boundary is labeled so numbers fit
            if (index % 2 !== 0 && index !== boundaries.length - 1) {
              return null;
            }
            const isFirst = index === 0;
            const isLast = index === boundaries.length - 1;
            return (
              <span
                key={value}
                className={`absolute ${isFirst ? '' : isLast ? '-translate-x-full' : '-translate-x-1/2'}`}
                style={{
                  left: `${String((index / breakpoints.length) * 100)}%`,
                }}
              >
                {value}
                {isLast ? ` ${unit}` : ''}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  const scale = COLOR_SCALES[LAYER_COLOR_SCALE_KEYS[kind]];
  const colors = Array.isArray(scale.colors)
    ? scale.colors
    : scale.colors.light;
  const gradient = `linear-gradient(to right, ${colors.map(cssColor).join(', ')})`;
  const [minimum, maximum] =
    scale.type === 'breakpoint'
      ? [scale.breakpoints[0], scale.breakpoints[scale.breakpoints.length - 1]]
      : [scale.min, scale.max];

  return (
    <div className="absolute bottom-6 left-2.5 z-10 w-56 rounded border border-line-strong bg-panel px-2 py-1 text-xs shadow">
      <div className="h-2 rounded-sm" style={{ background: gradient }} />
      <div className="mt-0.5 flex justify-between text-ink-secondary">
        <span>
          {minimum} {scale.unit}
        </span>
        <span>{Math.round((minimum + maximum) / 2)}</span>
        <span>
          {maximum} {scale.unit}
        </span>
      </div>
    </div>
  );
}
