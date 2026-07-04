import { PARAMETER_GROUPS } from '../lib/parameterGroups';
import type { ParameterGroupId } from '../lib/parameterGroups';

interface ParameterTabsProps {
  activeGroupId: ParameterGroupId;
  onGroupChange: (groupId: ParameterGroupId) => void;
}

export function ParameterTabs({
  activeGroupId,
  onGroupChange,
}: ParameterTabsProps) {
  return (
    <nav className="flex flex-wrap border-b border-line bg-header-light px-2">
      {PARAMETER_GROUPS.map((group) => (
        <button
          key={group.id}
          type="button"
          className={`-mb-px border-b-2 px-3 py-2 text-sm ${
            group.id === activeGroupId
              ? 'border-link font-bold text-ink'
              : 'border-transparent text-ink-secondary hover:text-ink'
          }`}
          onClick={() => {
            onGroupChange(group.id);
          }}
        >
          {group.label}
        </button>
      ))}
    </nav>
  );
}
