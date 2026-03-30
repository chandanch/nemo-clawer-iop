import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Square } from 'lucide-react';
import { TypeAnimation } from 'react-type-animation';
import { useSimulatorStore } from '../store/simulatorStore';
import { SCENARIOS } from '../data/scenarios';
import { PRODUCTS } from '../data/products';
import { ScenarioSelector } from '../components/simulator/ScenarioSelector';
import { ProductToggle } from '../components/simulator/ProductToggle';
import { ResultsPanel } from '../components/simulator/ResultsPanel';
import { InputPanel } from '../components/simulator/InputPanel';
import { AgentLogStream } from '../components/agent/AgentLogStream';
import type { StreamLog } from '../store/simulatorStore';
import { AgentCallStack } from '../components/agent/AgentCallStack';
import { ConfidenceGauge } from '../components/agent/ConfidenceGauge';
import { PriceHistoryChart } from '../components/charts/PriceHistoryChart';
import { DemandForecastChart } from '../components/charts/DemandForecastChart';
import { Badge } from '../components/ui/Badge';

const STATE_LABELS: Record<string, string> = {
  idle: 'Ready',
  running: 'Initializing',
  thinking: 'Thinking',
  analyzing: 'Analyzing',
  deciding: 'Deciding',
  complete: 'Complete',
};

const STATE_VARIANTS: Record<string, 'neutral' | 'openclaw' | 'nemoclaw' | 'warning' | 'success' | 'analysis'> = {
  idle: 'neutral',
  running: 'openclaw',
  thinking: 'analysis',
  analyzing: 'analysis',
  deciding: 'warning',
  complete: 'success',
};

export function Simulator() {
  const {
    simState,
    selectedScenarioId,
    selectedProduct,
    confidenceScore,
    streamLogs,
    visiblePricePoints,
    currentNarration,
    currentStepIndex,
    totalSteps,
    agentCalls,
    elapsedMs,
    totalMs,
    startSimulation,
    stopSimulation,
    resetSimulation,
  } = useSimulatorStore();

  const scenario = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];
  const product = PRODUCTS[selectedProduct];
  const isRunning = ['running', 'thinking', 'analyzing', 'deciding'].includes(simState);
  const progress = totalMs > 0 ? Math.min(100, Math.round((elapsedMs / totalMs) * 100)) : 0;

  // Convert StreamLog to LogEntry shape for AgentLogStream
  const visibleLogs = streamLogs.map((l: StreamLog) => ({ delay: 0, level: l.level as 'info' | 'warn' | 'success' | 'analysis', message: l.message }));

  // Scroll to top once when simulation starts, without fighting scroll during run
  const prevSimState = useRef(simState);
  useEffect(() => {
    if (prevSimState.current === 'idle' && simState !== 'idle') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    prevSimState.current = simState;
  }, [simState]);

  return (
    <div className="min-h-screen pt-16" style={{ background: '#080B14' }}>
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">AI Pricing Simulator</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Simulate intelligent pricing decisions in real-time</p>
          </div>
          <Badge variant={STATE_VARIANTS[simState]} pulse={isRunning} size="md">
            {STATE_LABELS[simState]}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-[280px_1fr_300px] gap-4">
          {/* Left panel - Controls */}
          <div className="space-y-4">
            <div className="rounded-xl p-4" style={{ background: 'rgba(15,22,36,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <ProductToggle />
            </div>

            <div className="rounded-xl p-4" style={{ background: 'rgba(15,22,36,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <ScenarioSelector />
            </div>

            {/* Custom inputs */}
            <InputPanel />

            {/* Scenario info */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#475569' }}>About this scenario</p>
              <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>{scenario.description}</p>
            </div>

            {/* Run Controls */}
            <div className="space-y-2">
              {!isRunning && simState !== 'complete' && (
                <button
                  onClick={startSimulation}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${product.color}, ${product.color}dd)`, color: 'white', boxShadow: `0 0 20px ${product.colorGlow}` }}
                >
                  <Play size={15} fill="currentColor" />
                  Run Agent
                </button>
              )}
              {isRunning && (
                <button
                  onClick={stopSimulation}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#F87171', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <Square size={14} fill="currentColor" />
                  Stop
                </button>
              )}
              {simState !== 'idle' && (
                <button
                  onClick={resetSimulation}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm"
                  style={{ background: 'rgba(255,255,255,0.04)', color: '#64748B', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <RotateCcw size={13} />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Center panel - Charts & Agent state */}
          <div className="space-y-4">
            {/* Narration / status bar — always reserve space to prevent layout shift */}
            <div
              className="rounded-xl px-4 py-3 flex items-center gap-3 transition-opacity duration-300"
              style={{
                background: (isRunning || simState === 'complete') && currentNarration ? `${product.colorGlow}` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${(isRunning || simState === 'complete') && currentNarration ? `${product.color}44` : 'rgba(255,255,255,0.04)'}`,
                opacity: (isRunning || simState === 'complete') && currentNarration ? 1 : 0,
                pointerEvents: 'none',
                minHeight: 44,
              }}
            >
              <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ background: product.color }}>
                <span className="text-white text-xs font-bold">{product.name.slice(0, 2)}</span>
              </div>
              <div className="text-sm" style={{ color: '#F1F5F9' }}>
                {isRunning && currentNarration ? (
                  <TypeAnimation
                    key={currentNarration}
                    sequence={[currentNarration]}
                    speed={60}
                    cursor={false}
                  />
                ) : (
                  currentNarration
                )}
              </div>
            </div>

            {/* Progress bar — always reserve space */}
            <div
              className="rounded-lg px-4 py-3 transition-opacity duration-300"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                opacity: isRunning ? 1 : 0,
                pointerEvents: 'none',
              }}
            >
              <div className="flex justify-between text-xs mb-2" style={{ color: '#64748B' }}>
                <span>Agent progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${product.color}, ${product.colorLight})` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Price history chart */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(15,22,36,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Price History</h3>
                <span className="text-xs" style={{ color: '#475569' }}>Our price vs competitor</span>
              </div>
              {visiblePricePoints.length > 0 ? (
                <PriceHistoryChart data={visiblePricePoints} product={selectedProduct} />
              ) : (
                <div className="h-52 flex items-center justify-center">
                  <p className="text-sm" style={{ color: '#334155' }}>Run agent to see live price data</p>
                </div>
              )}
            </div>

            {/* Demand forecast chart */}
            <div className="rounded-xl p-4" style={{ background: 'rgba(15,22,36,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">Demand Forecast</h3>
                <span className="text-xs" style={{ color: '#475569' }}>Predicted vs actual demand</span>
              </div>
              <DemandForecastChart data={scenario.forecastData} product={selectedProduct} />
            </div>

            {/* Results */}
            <ResultsPanel />
          </div>

          {/* Right panel - Agent activity */}
          <div className="space-y-4">
            {/* Confidence gauge */}
            <div className="rounded-xl p-4 flex flex-col items-center" style={{ background: 'rgba(15,22,36,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <h3 className="text-sm font-semibold text-white mb-4 self-start">Agent Confidence</h3>
              <ConfidenceGauge value={confidenceScore} product={selectedProduct} size={130} />

              {/* Mini metrics */}
              {simState !== 'idle' && (
                <div className="w-full mt-4 space-y-2">
                  {[
                    { label: 'Data sources', value: selectedProduct === 'openclaw' ? '500' : '22' },
                    { label: 'Steps complete', value: `${Math.max(0, currentStepIndex)}/${totalSteps}` },
                    { label: 'Price candidates', value: currentStepIndex >= 4 ? String(50 + currentStepIndex) : '—' },
                  ].map(m => (
                    <div key={m.label} className="flex justify-between text-xs">
                      <span style={{ color: '#475569' }}>{m.label}</span>
                      <span style={{ color: '#94A3B8' }}>{m.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Agent call stack */}
            <AgentCallStack calls={agentCalls} product={selectedProduct} isRunning={isRunning} />

            {/* Agent log */}
            <AgentLogStream logs={visibleLogs} isRunning={isRunning} />

            {/* Competitor events */}
            {scenario.competitorEvents.length > 0 && (
              <div className="rounded-xl p-4" style={{ background: 'rgba(15,22,36,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <h3 className="text-sm font-semibold text-white mb-3">Market Events</h3>
                <div className="space-y-2">
                  {scenario.competitorEvents.map((e, i) => (
                    <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ background: e.type === 'drop' ? '#F87171' : e.type === 'raise' ? '#34D399' : '#FCD34D' }}
                      />
                      <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>{e.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
