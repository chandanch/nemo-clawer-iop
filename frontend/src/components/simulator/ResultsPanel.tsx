import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Shield, Zap } from 'lucide-react';
import { useSimulatorStore } from '../../store/simulatorStore';
import { SCENARIOS } from '../../data/scenarios';
import { PRODUCTS } from '../../data/products';
import type { ResultMetrics } from '../../data/scenarios';

function MetricRow({ label, value, suffix = '', positive = true, icon: Icon }: { label: string; value: string | number; suffix?: string; positive?: boolean; icon: React.ComponentType<{ size?: number; color?: string }> }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="flex items-center gap-2">
        <Icon size={13} color="#475569" />
        <span className="text-xs" style={{ color: '#94A3B8' }}>{label}</span>
      </div>
      <span className="text-sm font-bold" style={{ color: positive ? '#34D399' : '#F87171' }}>
        {value}{suffix}
      </span>
    </div>
  );
}

export function ResultsPanel() {
  const { simState, selectedScenarioId, selectedProduct } = useSimulatorStore();

  if (simState !== 'complete') return null;

  const scenario = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];
  const metrics: ResultMetrics = selectedProduct === 'openclaw' ? scenario.finalMetrics.openclaw : scenario.finalMetrics.nemoclaw;
  const product = PRODUCTS[selectedProduct];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(15,22,36,0.9)', border: `1px solid ${product.color}33` }}
    >
      {/* Header bar */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: `${product.colorGlow}`, borderBottom: `1px solid ${product.color}33` }}>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ background: product.color }}>
            <Zap size={12} className="text-white" />
          </div>
          <span className="text-sm font-semibold text-white">Recommendation Ready</span>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full font-mono" style={{ background: 'rgba(52,211,153,0.15)', color: '#34D399' }}>
          {metrics.confidence}% confidence
        </span>
      </div>

      {/* Recommended price hero */}
      <div className="px-4 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        <p className="text-xs mb-1" style={{ color: '#475569' }}>Recommended Price</p>
        <div className="flex items-end gap-3">
          <span className="text-4xl font-bold" style={{ color: product.colorLight }}>
            ${metrics.recommendedPrice}
          </span>
          <div className="mb-1">
            <span className="text-xs line-through" style={{ color: '#334155' }}>${metrics.currentPrice}</span>
            <span className="text-sm ml-1" style={{ color: metrics.recommendedPrice < metrics.currentPrice ? '#34D399' : '#F59E0B' }}>
              {metrics.recommendedPrice < metrics.currentPrice ? '▼' : '▲'} ${Math.abs(metrics.recommendedPrice - metrics.currentPrice).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="px-4 pb-2">
        <MetricRow label="Revenue Lift" value={`${metrics.revenueLift > 0 ? '+' : ''}${metrics.revenueLift}`} suffix="%" positive={metrics.revenueLift >= 0} icon={TrendingUp} />
        <MetricRow label="Margin Impact" value={`${metrics.marginImpact > 0 ? '+' : ''}${metrics.marginImpact}`} suffix="%" positive={metrics.marginImpact >= 0} icon={Shield} />
        <MetricRow label="Demand Change" value={`${metrics.demandChange > 0 ? '+' : ''}${metrics.demandChange}`} suffix="%" positive={metrics.demandChange >= 0} icon={TrendingDown} />
        <MetricRow label="Competitor Gap" value={`$${Math.abs(metrics.competitorGap).toFixed(2)}`} positive={true} icon={Target} />
      </div>
    </motion.div>
  );
}
