import {
  MODEL_COLORS,
  MODEL_LABELS,
  MULTI_MODEL_AVERAGE_COLOR,
  MULTI_MODEL_AVERAGE_LABEL,
} from './modelDisplay';
import type { ModelId } from '../types/forecast';

interface ModelLegendProps {
  models: ModelId[];
  unavailableModels: ModelId[];
  excludedModels: ModelId[];
  onToggleModel: (model: ModelId) => void;
}

export function ModelLegend({
  models,
  unavailableModels,
  excludedModels,
  onToggleModel,
}: ModelLegendProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {models.map((model) => {
        // FR-21: an unavailable model stays visible but greyed out with an explanation
        const isUnavailable = unavailableModels.includes(model);
        return (
          <label
            key={model}
            className={`flex items-center gap-1.5 text-sm ${
              isUnavailable ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
            title={
              isUnavailable
                ? 'Model nie dostarcza danych dla tej lokalizacji'
                : undefined
            }
          >
            <input
              type="checkbox"
              disabled={isUnavailable}
              checked={!isUnavailable && !excludedModels.includes(model)}
              onChange={() => {
                onToggleModel(model);
              }}
            />
            <span
              className="inline-block h-0.5 w-4"
              style={{ backgroundColor: MODEL_COLORS[model] }}
            />
            {MODEL_LABELS[model]}
          </label>
        );
      })}
      <span className="flex items-center gap-1.5 text-sm text-ink-secondary">
        <span
          className="inline-block h-0.5 w-4 border-t-2 border-dashed"
          style={{ borderColor: MULTI_MODEL_AVERAGE_COLOR }}
        />
        {MULTI_MODEL_AVERAGE_LABEL}
      </span>
    </div>
  );
}
