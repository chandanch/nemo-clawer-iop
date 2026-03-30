import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Brain, Database, Filter, Play, Settings, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { PRODUCTS } from '../data/products';

interface PipelineNode {
  id: string;
  label: string;
  description: string;
  detail: string;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  x: number;
  y: number;
}

const PIPELINE_NODES: PipelineNode[] = [
  { id: 'ingest', label: 'Data Ingestion', description: 'Multi-source data fusion', detail: 'Combines transactional history, competitor data, external signals (weather, events, macroeconomics), and customer behavioral data from 500+ sources.', icon: Database, x: 0, y: 0 },
  { id: 'history', label: 'Historical Analysis', description: '180-day pattern learning', detail: 'Deep analysis of 180 days of demand history per SKU. Decomposes trends, seasonality, and event effects using time-series transformers.', icon: Brain, x: 1, y: 0 },
  { id: 'forecast', label: 'Demand Forecast', description: 'Deep learning prediction', detail: 'Transformer-based demand model predicts unit sales across 14–90 day horizons with confidence intervals. 94.7% accuracy on held-out test sets.', icon: Sparkles, x: 2, y: 0 },
  { id: 'seasonality', label: 'Seasonality Engine', description: 'Temporal decomposition', detail: 'Identifies and models weekly, monthly, and annual seasonality patterns. Automatically detects structural breaks and regime changes.', icon: Filter, x: 3, y: 0 },
  { id: 'optimize', label: 'Portfolio Optimizer', description: 'Cross-SKU optimization', detail: 'Solves joint pricing problem across full catalog using dynamic programming. Accounts for cannibalization, complementarity, and margin mix targets.', icon: Settings, x: 4, y: 0 },
  { id: 'validate', label: 'Risk Assessment', description: 'Uncertainty quantification', detail: 'Monte Carlo simulation over demand uncertainty and competitor response distributions. Returns price decisions with confidence intervals.', icon: ShieldCheck, x: 5, y: 0 },
  { id: 'output', label: 'Strategy Delivery', description: 'Multi-step price paths', detail: 'Publishes full pricing strategies — not just point prices but multi-day paths, markdown schedules, and contingency plans.', icon: Zap, x: 6, y: 0 },
];

export function Pipeline() {
  const [activeProduct, setActiveProduct] = useState<'openclaw' | 'nemoclaw'>('openclaw');
  const [selectedNode, setSelectedNode] = useState<PipelineNode | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeNodeIdx, setActiveNodeIdx] = useState(-1);

  const nodes = PIPELINE_NODES;
  const product = PRODUCTS[activeProduct];

  const runAnimation = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveNodeIdx(0);
    nodes.forEach((_: PipelineNode, i: number) => {
      setTimeout(() => {
        setActiveNodeIdx(i);
        if (i === nodes.length - 1) {
          setTimeout(() => { setIsAnimating(false); setActiveNodeIdx(-1); }, 1200);
        }
      }, i * 800);
    });
  };

  return (
    <div className="min-h-screen pt-16" style={{ background: '#080B14' }}>
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Agent Pipeline</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>How the AI agent reasons and decides</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Product toggle */}
            <div className="flex rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
              {(['openclaw', 'nemoclaw'] as const).map(id => (
                <button
                  key={id}
                  onClick={() => { setActiveProduct(id); setSelectedNode(null); setActiveNodeIdx(-1); }}
                  className="px-4 py-2 text-sm font-medium transition-all"
                  style={{
                    background: activeProduct === id ? PRODUCTS[id].color : 'rgba(15,22,36,0.8)',
                    color: activeProduct === id ? 'white' : '#64748B',
                  }}
                >
                  {PRODUCTS[id].name}
                </button>
              ))}
            </div>

            <button
              onClick={runAnimation}
              disabled={isAnimating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{ background: isAnimating ? 'rgba(255,255,255,0.06)' : product.color, color: 'white', opacity: isAnimating ? 0.6 : 1 }}
            >
              <Play size={13} fill="currentColor" />
              {isAnimating ? 'Running...' : 'Simulate Run'}
            </button>
          </div>
        </div>

        {/* Pipeline visualization */}
        <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(15,22,36,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {nodes.map((node: PipelineNode, i: number) => {
              const isActive = activeNodeIdx === i;
              const isComplete = activeNodeIdx > i;
              const isSelected = selectedNode?.id === node.id;
              const NodeIcon = node.icon;

              return (
                <div key={node.id} className="flex items-center gap-2 shrink-0">
                  <motion.button
                    onClick={() => setSelectedNode(isSelected ? null : node)}
                    animate={{
                      scale: isActive ? 1.08 : 1,
                      boxShadow: isActive ? `0 0 24px ${product.colorGlow}` : 'none',
                    }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all"
                    style={{
                      background: isActive
                        ? `${product.colorGlow}`
                        : isComplete
                        ? 'rgba(255,255,255,0.05)'
                        : isSelected
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? product.color : isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      minWidth: 100,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-all"
                      style={{ background: isActive || isComplete ? product.color : 'rgba(255,255,255,0.08)' }}
                    >
                      <NodeIcon size={18} color={isActive || isComplete ? 'white' : '#475569'} />
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold" style={{ color: isActive ? product.colorLight : isComplete ? '#94A3B8' : '#64748B' }}>{node.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#334155' }}>{node.description}</div>
                    </div>
                    {isActive && (
                      <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: product.colorLight }}
                      />
                    )}
                  </motion.button>

                  {i < nodes.length - 1 && (
                    <motion.div
                      animate={{ opacity: isComplete || isActive ? 1 : 0.2 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ArrowRight size={16} color={isComplete ? product.colorLight : '#334155'} />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Node detail panel */}
        <AnimatePresence mode="wait">
          {selectedNode && (
            <motion.div
              key={selectedNode.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="rounded-2xl p-6 mb-6"
              style={{ background: `${product.colorGlow}`, border: `1px solid ${product.color}44` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: product.color }}>
                  <selectedNode.icon size={22} color="white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">{selectedNode.label}</h3>
                  <p className="text-sm mb-3" style={{ color: product.colorLight }}>{selectedNode.description}</p>
                  <p className="text-sm leading-relaxed" style={{ color: '#94A3B8' }}>{selectedNode.detail}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pipeline step reference */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="rounded-xl p-5"
          style={{ background: 'rgba(15,22,36,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <h4 className="font-semibold text-white">Unified Agent Pipeline</h4>
            <span className="text-xs px-2 py-0.5 rounded-full ml-2" style={{ background: 'rgba(255,255,255,0.06)', color: '#64748B' }}>
              shared across OpenClaw &amp; NemoClaw
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {PIPELINE_NODES.map((node: PipelineNode, i: number) => (
              <div key={node.id} className="flex items-center gap-3 py-1.5 px-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <span className="text-xs font-mono w-4 shrink-0" style={{ color: '#334155' }}>{String(i + 1).padStart(2, '0')}</span>
                <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <node.icon size={11} color="#64748B" />
                </div>
                <div>
                  <span className="text-xs font-medium text-white">{node.label}</span>
                  <span className="text-xs ml-2" style={{ color: '#475569' }}>{node.description}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
