import { COLOR_SCALES } from '@openmeteo/weather-map-layer';
import { LAYER_COLOR_SCALE_KEYS } from '../lib/mapLayers';
import type { MapLayerKind } from '../lib/mapLayers';

interface MapScaleLegendProps {
  kind: MapLayerKind;
}

// FR-13: the color scale of the active weather layer, taken straight from the
// palette the tiles are rendered with
export function MapScaleLegend({ kind }: MapScaleLegendProps) {
  const scale = COLOR_SCALES[LAYER_COLOR_SCALE_KEYS[kind]];
  const colors = Array.isArray(scale.colors)
    ? scale.colors
    : scale.colors.light;
  const gradient = `linear-gradient(to right, ${colors
    .map(
      ([red, green, blue, alpha]) =>
        `rgba(${String(red)},${String(green)},${String(blue)},${String(alpha)})`,
    )
    .join(', ')})`;
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
