import { useSimulatorStore } from '../../store/simulatorStore';
import { PRODUCTS } from '../../data/products';
import { clsx } from 'clsx';

export function ProductToggle() {
  const { selectedProduct, setProduct, simState } = useSimulatorStore();
  const disabled = simState === 'running' || simState === 'thinking' || simState === 'analyzing' || simState === 'deciding';

  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569' }}>Product</label>
      <div className="grid grid-cols-2 gap-2">
        {(['openclaw', 'nemoclaw'] as const).map(id => {
          const product = PRODUCTS[id];
          const active = selectedProduct === id;
          return (
            <button
              key={id}
              onClick={() => !disabled && setProduct(id)}
              disabled={disabled}
              className={clsx(
                'flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-center',
                disabled && 'cursor-not-allowed'
              )}
              style={{
                background: active ? `${product.colorGlow}` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${active ? product.color : 'rgba(255,255,255,0.06)'}`,
                boxShadow: active ? `0 0 16px ${product.colorGlow}` : 'none',
              }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: active ? product.color : 'rgba(255,255,255,0.08)' }}>
                <span className="text-white text-xs font-bold">{product.name.slice(0, 2)}</span>
              </div>
              <span className="text-xs font-semibold" style={{ color: active ? product.colorLight : '#64748B' }}>{product.name}</span>
              <span className="text-xs" style={{ color: active ? '#94A3B8' : '#334155' }}>{active ? 'Selected' : 'Select'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
