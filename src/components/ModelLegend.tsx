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
  // FR-09: models responding for the location but without data for the active parameter
  modelsWithoutParameter: ModelId[];
  excludedModels: ModelId[];
  showAverage: boolean;
  onToggleModel: (model: ModelId) => void;
  onToggleAverage: () => void;
}

export function ModelLegend({
  models,
  unavailableModels,
  modelsWithoutParameter,
  excludedModels,
  showAverage,
  onToggleModel,
  onToggleAverage,
}: ModelLegendProps) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {models.map((model) => {
        // FR-21: an unavailable model stays visible but greyed out with an explanation
        const isUnavailable = unavailableModels.includes(model);
        const lacksParameter = modelsWithoutParameter.includes(model);
        const isDisabled = isUnavailable || lacksParameter;
        let explanation: string | undefined;
        if (isUnavailable) {
          explanation = 'Model nie dostarcza danych dla tej lokalizacji';
        } else if (lacksParameter) {
          explanation =
            'Model nie dostarcza tego parametru dla tej lokalizacji';
        }
        return (
          <label
            key={model}
            className={`flex items-center gap-1.5 text-sm ${
              isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            }`}
            title={explanation}
          >
            <input
              type="checkbox"
              disabled={isDisabled}
              checked={!isDisabled && !excludedModels.includes(model)}
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
      <label className="flex cursor-pointer items-center gap-1.5 text-sm text-ink-secondary">
        <input
          type="checkbox"
          checked={showAverage}
          onChange={onToggleAverage}
        />
        <span
          className="inline-block h-0.5 w-4 border-t-2 border-dashed"
          style={{ borderColor: MULTI_MODEL_AVERAGE_COLOR }}
        />
        {MULTI_MODEL_AVERAGE_LABEL}
      </label>
    </div>
  );
}
