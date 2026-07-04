import { useMemo, useState } from 'react';
import { ForecastChart } from './ForecastChart';
import { ModelLegend } from './ModelLegend';
import { ParameterTabs } from './ParameterTabs';
import { ReadoutBar } from './ReadoutBar';
import { useForecast } from '../hooks/useForecast';
import { listCoveredModels } from '../lib/modelCoverage';
import { PARAMETER_GROUPS } from '../lib/parameterGroups';
import type { ParameterGroupId } from '../lib/parameterGroups';
import { DEFAULT_UNIT_PREFERENCES } from '../lib/units';
import type { GeoCoordinates, ModelId } from '../types/forecast';

interface DashboardProps {
  location: GeoCoordinates | null;
}

export function Dashboard({ location }: DashboardProps) {
  const {
    forecast,
    unavailableModels,
    currentTimeIndex,
    isLoading,
    error,
    retry,
  } = useForecast(location);
  const [activeGroupId, setActiveGroupId] =
    useState<ParameterGroupId>('temperature');
  const [excludedModels, setExcludedModels] = useState<ModelId[]>([]);
  // FR-18: the unit switcher UI arrives with the navbar menu; defaults apply until then
  const unitPreferences = DEFAULT_UNIT_PREFERENCES;

  // FR-08: models outside their coverage are absent from the legend, not greyed out
  const coveredModels = useMemo(
    () => (location === null ? [] : listCoveredModels(location)),
    [location],
  );

  const activeGroup =
    PARAMETER_GROUPS.find((group) => group.id === activeGroupId) ??
    PARAMETER_GROUPS[0];

  const toggleModel = (model: ModelId) => {
    // FR-06: exclusion only recomputes in the browser, no network traffic
    setExcludedModels((previous) =>
      previous.includes(model)
        ? previous.filter((excluded) => excluded !== model)
        : [...previous, model],
    );
  };

  if (location === null) {
    return (
      <div className="flex h-full items-center justify-center text-ink-muted">
        Wybierz lokalizację, aby zobaczyć prognozę
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-line bg-header-light px-3 py-2">
        <ModelLegend
          models={coveredModels}
          unavailableModels={unavailableModels}
          excludedModels={excludedModels}
          onToggleModel={toggleModel}
        />
        {isLoading && (
          <span className="text-sm text-ink-muted">Ładowanie…</span>
        )}
      </div>
      {error !== null && (
        <div
          className={`flex items-center justify-between gap-3 border-b px-3 py-2 text-sm ${
            error === 'offline'
              ? 'border-[#ebccd1] bg-[#f2dede] text-[#a94442]'
              : 'border-[#faebcc] bg-[#fcf8e3] text-[#8a6d3b]'
          }`}
        >
          <span>
            {error === 'offline'
              ? 'Brak połączenia z internetem. Sprawdź sieć i spróbuj ponownie.'
              : 'Serwis Open-Meteo jest chwilowo niedostępny.'}
          </span>
          <button
            type="button"
            className="shrink-0 rounded border border-current px-2 py-0.5"
            onClick={retry}
          >
            Ponów
          </button>
        </div>
      )}
      <ParameterTabs
        activeGroupId={activeGroupId}
        onGroupChange={setActiveGroupId}
      />
      {forecast !== null && (
        <>
          <ReadoutBar
            forecast={forecast}
            group={activeGroup}
            excludedModels={excludedModels}
            unitPreferences={unitPreferences}
            timeIndex={currentTimeIndex}
          />
          <div className="min-h-0 grow bg-panel">
            <ForecastChart
              forecast={forecast}
              group={activeGroup}
              excludedModels={excludedModels}
              unitPreferences={unitPreferences}
            />
          </div>
        </>
      )}
    </div>
  );
}
