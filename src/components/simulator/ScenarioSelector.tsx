import { SCENARIOS } from '../../data/scenarios';
import { useSimulatorStore } from '../../store/simulatorStore';
import { Badge } from '../ui/Badge';
import { clsx } from 'clsx';

const CATEGORY_COLORS: Record<string, 'openclaw' | 'nemoclaw' | 'warning' | 'analysis'> = {
  'Competitive Response': 'openclaw',
  'Demand Optimization': 'nemoclaw',
  'Real-time Response': 'openclaw',
  'Markdown Optimization': 'nemoclaw',
};

export function ScenarioSelector() {
  const { selectedScenarioId, setScenario, simState } = useSimulatorStore();
  const disabled = simState === 'running' || simState === 'thinking' || simState === 'analyzing' || simState === 'deciding';

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>Scenario</label>
      <div className="space-y-2">
        {SCENARIOS.map(scenario => (
          <button
            key={scenario.id}
            onClick={() => !disabled && setScenario(scenario.id)}
            disabled={disabled}
            className={clsx(
              'w-full text-left rounded-xl p-3 transition-all',
              selectedScenarioId === scenario.id ? 'ring-1' : 'opacity-60 hover:opacity-80',
              disabled && 'cursor-not-allowed'
            )}
            style={{
              background: selectedScenarioId === scenario.id ? 'rgba(15,22,36,0.9)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${selectedScenarioId === scenario.id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="text-sm font-medium text-white">{scenario.name}</span>
              <Badge variant={CATEGORY_COLORS[scenario.category] || 'neutral'}>{scenario.category}</Badge>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>{scenario.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
