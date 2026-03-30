import { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useSimulatorStore } from '../../store/simulatorStore';

export interface SimulatorInputs {
  currentPrice: number;
  competitorPrice: number;
  marginFloor: number;
  inventoryUnits: number;
  sku: string;
  targetMargin: number;
}

const DEFAULTS: SimulatorInputs = {
  currentPrice: 49.99,
  competitorPrice: 44.99,
  marginFloor: 38.50,
  inventoryUnits: 2840,
  sku: 'SKU-A1047',
  targetMargin: 35,
};

interface FieldProps {
  label: string;
  name: keyof SimulatorInputs;
  value: string | number;
  onChange: (name: keyof SimulatorInputs, value: string) => void;
  prefix?: string;
  suffix?: string;
  disabled?: boolean;
}

function Field({ label, name, value, onChange, prefix, suffix, disabled }: FieldProps) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: '#64748B' }}>{label}</label>
      <div
        className="flex items-center rounded-lg overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}
      >
        {prefix && (
          <span className="px-2 text-xs shrink-0" style={{ color: '#475569' }}>{prefix}</span>
        )}
        <input
          type={name === 'sku' ? 'text' : 'number'}
          value={value}
          onChange={e => onChange(name, e.target.value)}
          disabled={disabled}
          step={name === 'currentPrice' || name === 'competitorPrice' || name === 'marginFloor' ? '0.01' : '1'}
          className="flex-1 bg-transparent px-2 py-1.5 text-xs text-white outline-none min-w-0"
          style={{ color: disabled ? '#475569' : 'white' }}
        />
        {suffix && (
          <span className="px-2 text-xs shrink-0" style={{ color: '#475569' }}>{suffix}</span>
        )}
      </div>
    </div>
  );
}

export function InputPanel() {
  const { simState, setCustomInputs } = useSimulatorStore();
  const [expanded, setExpanded] = useState(false);
  const [inputs, setInputs] = useState<SimulatorInputs>(DEFAULTS);

  const disabled = simState === 'running' || simState === 'thinking' || simState === 'analyzing' || simState === 'deciding';

  const handleChange = (name: keyof SimulatorInputs, value: string) => {
    const updated = {
      ...inputs,
      [name]: name === 'sku' ? value : parseFloat(value) || 0,
    };
    setInputs(updated);
    setCustomInputs(updated);
  };

  const handleReset = () => {
    setInputs(DEFAULTS);
    setCustomInputs(DEFAULTS);
  };

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(15,22,36,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Toggle header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>
            Custom Inputs
          </span>
          {!expanded && (
            <p className="text-xs mt-0.5" style={{ color: '#334155' }}>
              SKU {inputs.sku} · ${inputs.currentPrice} · {inputs.inventoryUnits} units
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!disabled && (
            <button
              onClick={e => { e.stopPropagation(); handleReset(); }}
              className="p-1 rounded transition-opacity hover:opacity-80"
              title="Reset to defaults"
            >
              <RefreshCw size={11} color="#475569" />
            </button>
          )}
          {expanded ? <ChevronUp size={14} color="#475569" /> : <ChevronDown size={14} color="#475569" />}
        </div>
      </button>

      {/* Fields */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="pt-3 grid grid-cols-2 gap-3">
            <Field label="Current Price" name="currentPrice" value={inputs.currentPrice} onChange={handleChange} prefix="$" disabled={disabled} />
            <Field label="Competitor Price" name="competitorPrice" value={inputs.competitorPrice} onChange={handleChange} prefix="$" disabled={disabled} />
            <Field label="Margin Floor" name="marginFloor" value={inputs.marginFloor} onChange={handleChange} prefix="$" disabled={disabled} />
            <Field label="Target Margin" name="targetMargin" value={inputs.targetMargin} onChange={handleChange} suffix="%" disabled={disabled} />
            <Field label="Inventory Units" name="inventoryUnits" value={inputs.inventoryUnits} onChange={handleChange} disabled={disabled} />
            <Field label="SKU ID" name="sku" value={inputs.sku} onChange={handleChange} disabled={disabled} />
          </div>

          {!disabled && (
            <p className="text-xs" style={{ color: '#334155' }}>
              Inputs applied when you run the agent
            </p>
          )}
        </div>
      )}
    </div>
  );
}
