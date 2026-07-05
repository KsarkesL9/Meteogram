import { computeMultiModelAverage, countSeriesWithData } from '../lib/average';
import { toLocationIso } from '../lib/localTime';
import { PARAMETER_LABELS } from '../lib/parameterGroups';
import type { ParameterGroup } from '../lib/parameterGroups';
import { convertParameterValue, parameterUnitLabel } from '../lib/units';
import type { UnitPreferences } from '../lib/units';
import {
  MODEL_COLORS,
  MODEL_LABELS,
  MULTI_MODEL_AVERAGE_COLOR,
  MULTI_MODEL_AVERAGE_LABEL,
} from './modelDisplay';
import type { LocationForecast, ModelId } from '../types/forecast';

interface ReadoutBarProps {
  forecast: LocationForecast;
  group: ParameterGroup;
  excludedModels: ModelId[];
  unitPreferences: UnitPreferences;
  timeIndex: number;
  displayOffsetSeconds: number;
  timeSuffix: string;
  showAverage: boolean;
}

export function ReadoutBar({
  forecast,
  group,
  excludedModels,
  unitPreferences,
  timeIndex,
  displayOffsetSeconds,
  timeSuffix,
  showAverage,
}: ReadoutBarProps) {
  const parameter = group.parameters[0];
  const unit = parameterUnitLabel(parameter, unitPreferences);
  const presentModels = Object.keys(forecast.models) as ModelId[];
  const includedModels = presentModels.filter(
    (model) => !excludedModels.includes(model),
  );
  const includedSeries = includedModels.map(
    (model) => forecast.models[model]?.parameters[parameter] ?? [],
  );
  // FR-05: same gating as the chart - no average from a single data-bearing model
  const hasAverage = showAverage && countSeriesWithData(includedSeries) >= 2;
  const averageValue = computeMultiModelAverage(includedSeries)[timeIndex];

  const formatValue = (value: number | null | undefined) =>
    value === null || value === undefined
      ? '–'
      : `${convertParameterValue(parameter, value, unitPreferences).toFixed(1)} ${unit}`;

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line bg-panel px-3 py-1.5 text-sm">
      <span className="text-ink-muted">
        {PARAMETER_LABELS[parameter]} ·{' '}
        {toLocationIso(forecast.timestamps[timeIndex], displayOffsetSeconds)
          .slice(0, 16)
          .replace('T', ' ')}
        {timeSuffix}
      </span>
      {includedModels.map((model) => (
        <span key={model} className="flex items-center gap-1">
          <span className="font-bold" style={{ color: MODEL_COLORS[model] }}>
            {MODEL_LABELS[model]}:
          </span>
          {formatValue(
            forecast.models[model]?.parameters[parameter][timeIndex],
          )}
        </span>
      ))}
      {hasAverage && (
        <span className="flex items-center gap-1">
          <span
            className="font-bold"
            style={{ color: MULTI_MODEL_AVERAGE_COLOR }}
          >
            {MULTI_MODEL_AVERAGE_LABEL}:
          </span>
          {formatValue(averageValue)}
        </span>
      )}
    </div>
  );
}
