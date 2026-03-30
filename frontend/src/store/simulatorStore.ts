import { create } from 'zustand';
import type { ProductId } from '../data/products';
import type { Scenario, PricePoint } from '../data/scenarios';
import { SCENARIOS } from '../data/scenarios';
import type { AgentCall } from '../components/agent/AgentCallStack';
import type { SimulatorInputs } from '../components/simulator/InputPanel';

export type SimState = 'idle' | 'running' | 'thinking' | 'analyzing' | 'deciding' | 'complete';

export interface StreamLog {
  id: string;
  level: 'info' | 'warn' | 'success' | 'analysis' | 'debug';
  message: string;
  ts: string;
}

// Each agent step has realistic timing and trickle-in sub-logs
interface AgentStep {
  callIndex: number;       // which AgentCall this maps to
  thinkMs: number;         // pause before this step starts (agent "reading" prev result)
  runMs: number;           // how long this step takes
  phase: SimState;         // what phase the UI should show
  narration: string;       // narration bar text while this runs
  subLogs: { offsetMs: number; level: StreamLog['level']; message: string }[];
  // price point to reveal on completion (index into priceHistory, -1 = none)
  revealPriceCount: number;
  // confidence jump at end of this step (added to current)
  confJump: number;
}

function ts(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).slice(0, 2)}`;
}

// Each step is ~12 seconds: thinkMs (agent pauses, reads previous result) + runMs (active execution)
// Sub-logs are spread across the full runMs to simulate realistic network call chatter


const NEMOCLAW_STEPS: AgentStep[] = [
  {
    // Step 1 — Multi-source Fusion: ~12s total (900ms think + 11.1s run)
    callIndex: 0,
    thinkMs: 900,
    runMs: 11100,
    phase: 'thinking',
    narration: 'Fusing transactional, behavioral and external data streams…',
    subLogs: [
      { offsetMs:  210, level: 'info',     message: 'FusionAgent v2.3 — opening connections to 22 data sources…' },
      { offsetMs:  750, level: 'debug',    message: 'Source 1/4 [TXN] — connecting to OLTP replica (jdbc:postgresql://txn-ro)' },
      { offsetMs: 1350, level: 'debug',    message: 'Source 1/4 [TXN] — streaming 180d history: 2,100,441 rows @ 142k rows/s' },
      { offsetMs: 2100, level: 'debug',    message: 'TXN stream: 500K rows received (23.8%)…' },
      { offsetMs: 2850, level: 'debug',    message: 'TXN stream: 1.2M rows received (57.1%)…' },
      { offsetMs: 3600, level: 'debug',    message: 'TXN stream: 2.1M rows received (100%) — checksum OK' },
      { offsetMs: 4350, level: 'info',     message: 'Source 2/4 [BEHAVIORAL] — pulling clickstream, cart, browse, returns…' },
      { offsetMs: 5100, level: 'debug',    message: 'Behavioral API: GET /events?sku=A1047&days=30 → 847,291 events (209ms)' },
      { offsetMs: 5850, level: 'info',     message: 'Source 3/4 [COMPETITOR] — ingesting from OpenClaw feed (real-time)…' },
      { offsetMs: 6600, level: 'debug',    message: 'Competitor feed: 14,200 price pairs received — schema validated' },
      { offsetMs: 7500, level: 'info',     message: 'Source 4/4 [EXTERNAL] — fetching macro signals…' },
      { offsetMs: 8250, level: 'debug',    message: 'Weather API (NOAA): 14-day forecast for zip cluster → OK (54ms)' },
      { offsetMs: 9000, level: 'debug',    message: 'Events DB: 31 local events in 30-day window fetched → OK' },
      { offsetMs: 9750, level: 'debug',    message: 'Macro feed (FRED): CPI, PPI, consumer confidence → OK (88ms)' },
      { offsetMs: 10500, level: 'analysis', message: 'Feature fusion: joining 4 streams on (sku, date) — 2.3M joined rows' },
      { offsetMs: 10950, level: 'success', message: 'Multi-source fusion complete — 47 feature streams active, 2.3M rows ready' },
    ],
    revealPriceCount: 4,
    confJump: 7,
  },
  {
    // Step 2 — Historical Analysis: ~12s total (750ms think + 11.25s run)
    callIndex: 1,
    thinkMs: 750,
    runMs: 11250,
    phase: 'thinking',
    narration: 'Deep-analyzing 180-day demand patterns and structural breaks…',
    subLogs: [
      { offsetMs:  240, level: 'info',     message: 'Loading time-series transformer v3.1 (847M params, fp16)…' },
      { offsetMs:  900, level: 'debug',    message: 'Model shards loaded from S3: 3/3 (12.4GB total, 8.2s)' },
      { offsetMs: 1650, level: 'info',     message: 'Tokenizing 180-day demand history (2,160 daily obs per SKU)…' },
      { offsetMs: 2400, level: 'debug',    message: 'Tokenization complete — sequence length: 2160, vocab: demand_units' },
      { offsetMs: 3150, level: 'info',     message: 'Decomposing: extracting trend component (HP-filter λ=1600)…' },
      { offsetMs: 3900, level: 'analysis', message: 'Trend extracted — long-run slope: −6.2%/month pre-intervention' },
      { offsetMs: 4650, level: 'info',     message: 'Decomposing: extracting seasonality (STL decomposition)…' },
      { offsetMs: 5400, level: 'analysis', message: 'Seasonality extracted — weekly amplitude: ±18%, annual: ±4%' },
      { offsetMs: 6300, level: 'info',     message: 'Running Bai-Perron structural break detection…' },
      { offsetMs: 7050, level: 'analysis', message: 'Structural break #1 found at t=−47d (competitor entry event)' },
      { offsetMs: 7800, level: 'analysis', message: 'Structural break #2 found at t=−12d (promo end — regime shift)' },
      { offsetMs: 8700, level: 'info',     message: 'Searching historical database for comparable competitor entries…' },
      { offsetMs: 9450, level: 'debug',    message: 'Similarity search: 3 analogous events found (cosine > 0.82)' },
      { offsetMs: 10200, level: 'analysis', message: 'Analogues: avg recovery +8.4% in 21 days post-response' },
      { offsetMs: 11100, level: 'success', message: 'Demand history analysis complete — long-run slope: −6.2% if no action' },
    ],
    revealPriceCount: 7,
    confJump: 11,
  },
  {
    // Step 3 — Demand Forecast: ~12s total (600ms think + 11.4s run)
    callIndex: 2,
    thinkMs: 600,
    runMs: 11400,
    phase: 'analyzing',
    narration: 'Running transformer-based demand forecast across 14–90 day horizons…',
    subLogs: [
      { offsetMs:  270, level: 'info',     message: 'Preparing forecast input: 22 engineered features × 2160 timesteps…' },
      { offsetMs: 1050, level: 'debug',    message: 'Feature normalization (z-score) — training stats applied' },
      { offsetMs: 1800, level: 'info',     message: 'Inference pass 1/3: 14-day horizon (short-range)…' },
      { offsetMs: 2700, level: 'debug',    message: 'Attention layer forward pass (12 heads × 768 dims) — 2.1s' },
      { offsetMs: 3600, level: 'analysis', message: '14-day forecast: units=[1,842, 1,791, …] — MAPE=3.2%' },
      { offsetMs: 4350, level: 'info',     message: 'Inference pass 2/3: 30-day horizon (mid-range)…' },
      { offsetMs: 5250, level: 'debug',    message: 'Autoregressive decoding: 30 steps, beam_size=4…' },
      { offsetMs: 6150, level: 'analysis', message: '30-day forecast: cumulative demand=54,218 units (CI: ±1,842)' },
      { offsetMs: 6900, level: 'info',     message: 'Inference pass 3/3: 90-day horizon (long-range)…' },
      { offsetMs: 7950, level: 'debug',    message: 'Monte Carlo dropout enabled for uncertainty (n=50 forward passes)…' },
      { offsetMs: 9000, level: 'analysis', message: '90-day forecast: cumulative demand=158,400 units (CI: ±9,120)' },
      { offsetMs: 9900, level: 'debug',    message: 'Calibration check: coverage at 95% CI → 96.1% on hold-out set ✓' },
      { offsetMs: 10800, level: 'info',    message: 'Forecast written to feature store (feast) — TTL=6h' },
      { offsetMs: 11250, level: 'success', message: 'Demand forecast ready — 3 horizons, 94.7% held-out accuracy' },
    ],
    revealPriceCount: 12,
    confJump: 14,
  },
  {
    // Step 4 — Seasonality Engine: ~12s total (600ms think + 11.4s run)
    callIndex: 3,
    thinkMs: 600,
    runMs: 11400,
    phase: 'analyzing',
    narration: 'Identifying seasonality patterns and temporal price sensitivity…',
    subLogs: [
      { offsetMs:  300, level: 'info',     message: 'SeasonalityEngine v2.0 — fitting Fourier components (K=10)…' },
      { offsetMs: 1050, level: 'debug',    message: 'FFT on 2-year demand series (730 points) — computing…' },
      { offsetMs: 1950, level: 'debug',    message: 'Dominant frequency: f=0.143 (7-day period) — weekly confirmed' },
      { offsetMs: 2850, level: 'analysis', message: 'Weekly pattern: Mon −12%, Tue −8%, Wed +2%, Thu +5%, Fri +14%, Sat +18%' },
      { offsetMs: 3900, level: 'debug',    message: 'Secondary frequency: f=0.0027 (annual) — amplitude: 4.1% (low)' },
      { offsetMs: 4800, level: 'analysis', message: 'Annual cycle: no significant seasonality for SKU cluster #47' },
      { offsetMs: 5700, level: 'info',     message: 'Scanning for structural breaks in seasonality (CUSUM test)…' },
      { offsetMs: 6750, level: 'debug',    message: 'CUSUM statistic: max=1.82 < threshold=2.0 — no break detected' },
      { offsetMs: 7650, level: 'info',     message: 'Fitting holiday effect model (8 US holidays × 3 lags/leads)…' },
      { offsetMs: 8550, level: 'analysis', message: 'Holiday effects: +22% pre-holiday, −8% post-holiday (avg 3-day window)' },
      { offsetMs: 9600, level: 'debug',    message: 'Cross-validation: seasonality model MAPE = 4.8% (5-fold CV)' },
      { offsetMs: 10500, level: 'analysis', message: 'Adjusted demand forecast: +4.1% uplift (Fri–Sat window active today)' },
      { offsetMs: 11250, level: 'success', message: 'Seasonality decomposition complete — forecast model updated with seasonal factors' },
    ],
    revealPriceCount: 15,
    confJump: 13,
  },
  {
    // Step 5 — Portfolio Optimizer: ~12s total (1200ms think + 10.8s run)
    callIndex: 4,
    thinkMs: 1200,
    runMs: 10800,
    phase: 'deciding',
    narration: 'Solving joint cross-SKU pricing via dynamic programming…',
    subLogs: [
      { offsetMs:  240, level: 'info',     message: 'PortfolioOptimizer v3.1 — building 47×47 cross-elasticity matrix…' },
      { offsetMs:  900, level: 'debug',    message: 'Querying elasticity store for 2,209 SKU pairs…' },
      { offsetMs: 1650, level: 'debug',    message: 'Matrix populated: 2,209/2,209 pairs — avg cross-elasticity: 0.18' },
      { offsetMs: 2400, level: 'info',     message: 'Modeling cannibalization effects (substitution threshold: ε_cross > 0.3)…' },
      { offsetMs: 3300, level: 'analysis', message: 'Cannibalization risk: 4 SKU pairs flagged (max: 0.41 for SKU-A1048)' },
      { offsetMs: 4200, level: 'info',     message: 'Setting up Bellman equation for 47-SKU joint problem…' },
      { offsetMs: 5100, level: 'debug',    message: 'State space: 47 SKUs × 50 price levels = 2,350 states' },
      { offsetMs: 6000, level: 'info',     message: 'Dynamic programming: value function iteration pass 1/3…' },
      { offsetMs: 6900, level: 'debug',    message: 'Pass 1 complete — max delta V: 0.842 (not converged)' },
      { offsetMs: 7800, level: 'info',     message: 'Dynamic programming: value function iteration pass 2/3…' },
      { offsetMs: 8700, level: 'debug',    message: 'Pass 2 complete — max delta V: 0.027 (approaching convergence)' },
      { offsetMs: 9600, level: 'info',     message: 'Dynamic programming: value function iteration pass 3/3…' },
      { offsetMs: 10200, level: 'debug',   message: 'Pass 3 complete — max delta V: 0.0004 < tolerance 0.001 ✓ CONVERGED' },
      { offsetMs: 10650, level: 'success', message: 'Portfolio optimizer complete — joint revenue lift: +12.7%, margin mix: +1.4pp' },
    ],
    revealPriceCount: 19,
    confJump: 17,
  },
  {
    // Step 6 — Risk / Monte Carlo: ~12s total (900ms think + 11.1s run)
    callIndex: 5,
    thinkMs: 900,
    runMs: 11100,
    phase: 'deciding',
    narration: 'Running Monte Carlo simulation over demand and competitor uncertainty…',
    subLogs: [
      { offsetMs:  240, level: 'info',     message: 'RiskAssessor v2.2 — initializing Monte Carlo engine (n=50,000)…' },
      { offsetMs:  900, level: 'debug',    message: 'Sampling demand uncertainty: N(μ=forecast, σ=forecast_std)' },
      { offsetMs: 1650, level: 'debug',    message: 'Sampling competitor response: mixture(hold=0.4, match=0.35, undercut=0.25)' },
      { offsetMs: 2400, level: 'info',     message: 'Simulation running: 0/50,000 scenarios complete…' },
      { offsetMs: 3300, level: 'debug',    message: 'Simulation progress: 10,000/50,000 (20%) — interim EV: +$9,842' },
      { offsetMs: 4350, level: 'debug',    message: 'Simulation progress: 20,000/50,000 (40%) — interim EV: +$9,614' },
      { offsetMs: 5400, level: 'debug',    message: 'Simulation progress: 30,000/50,000 (60%) — interim EV: +$9,703' },
      { offsetMs: 6600, level: 'debug',    message: 'Simulation progress: 40,000/50,000 (80%) — interim EV: +$9,681' },
      { offsetMs: 7800, level: 'debug',    message: 'Simulation progress: 50,000/50,000 (100%) — CONVERGED' },
      { offsetMs: 8550, level: 'analysis', message: 'EV distribution: mean=+$9,688, p5=+$4,210, p95=+$14,920' },
      { offsetMs: 9300, level: 'analysis', message: 'Downside risk (p5): +$4,210 — acceptable (> $2,000 floor) ✓' },
      { offsetMs: 10050, level: 'info',    message: 'Cannibalization risk assessed: 0.8% revenue at risk (LOW) ✓' },
      { offsetMs: 10650, level: 'analysis', message: 'Competitor response probability: hold 42%, match 36%, undercut 22%' },
      { offsetMs: 10950, level: 'success', message: 'Risk assessment complete — confidence interval: ±1.8%, risk=LOW' },
    ],
    revealPriceCount: 22,
    confJump: 16,
  },
  {
    // Step 7 — Strategy Delivery: ~12s total (600ms think + 11.4s run)
    callIndex: 6,
    thinkMs: 600,
    runMs: 11400,
    phase: 'running',
    narration: 'Publishing multi-day pricing strategy and contingency plans…',
    subLogs: [
      { offsetMs:  210, level: 'info',     message: 'StrategyAgent v1.8 — assembling 30-day multi-step price path…' },
      { offsetMs:  900, level: 'debug',    message: 'Price path nodes: [D0: $45.49, D7: $44.99, D14: $44.49, D21: $44.99, …]' },
      { offsetMs: 1800, level: 'info',     message: 'Generating contingency plan A: competitor holds price…' },
      { offsetMs: 2700, level: 'debug',    message: 'Contingency A: maintain $45.49, reassess at D7 — EV: +$11,200' },
      { offsetMs: 3600, level: 'info',     message: 'Generating contingency plan B: competitor undercuts further…' },
      { offsetMs: 4500, level: 'debug',    message: 'Contingency B: match to $43.99, trigger alert — EV: +$6,800' },
      { offsetMs: 5400, level: 'info',     message: 'Generating contingency plan C: competitor exits market…' },
      { offsetMs: 6300, level: 'debug',    message: 'Contingency C: restore to $49.99 at D14 — EV: +$18,400' },
      { offsetMs: 7200, level: 'info',     message: 'Computing personalized segment pricing (4 cohorts)…' },
      { offsetMs: 8100, level: 'analysis', message: 'Segment A (price-sensitive, 38%): show $44.99 — CTR uplift: +9.1%' },
      { offsetMs: 9000, level: 'analysis', message: 'Segment B (brand-loyal, 29%): show $45.49 — no churn risk' },
      { offsetMs: 9900, level: 'debug',    message: 'Serializing strategy object (JSON, 12.4KB)…' },
      { offsetMs: 10650, level: 'debug',   message: 'POST /v2/strategies → strategy-store:9090 → 201 Created (id: NC-20240312-4491)' },
      { offsetMs: 11250, level: 'success', message: 'Strategy delivered — 30-day path, 3 contingencies, 4 segments ✓' },
    ],
    revealPriceCount: 24,
    confJump: 9,
  },
];

interface SimulatorStore {
  selectedScenarioId: string;
  selectedProduct: ProductId;
  compareMode: boolean;
  customInputs: SimulatorInputs;

  simState: SimState;
  currentStepIndex: number;       // which AgentStep is active
  totalSteps: number;
  confidenceScore: number;
  confidenceTarget: number;

  streamLogs: StreamLog[];
  visiblePricePoints: PricePoint[];
  currentNarration: string;
  activePhaseNode: string;
  agentCalls: AgentCall[];

  // elapsed wall-clock ms since sim start (used for progress bar)
  elapsedMs: number;
  totalMs: number;

  setScenario: (id: string) => void;
  setProduct: (id: ProductId) => void;
  setCompareMode: (val: boolean) => void;
  setCustomInputs: (inputs: SimulatorInputs) => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  resetSimulation: () => void;
  _timeoutIds: number[];
}

function makeAgentCalls(product: ProductId): AgentCall[] {
  const templates = [
    { agent: 'FusionAgent', tool: 'ingest_multi_source', input: 'sources=[txn,competitor,weather,events,macro]' },
    { agent: 'HistoryAnalyst', tool: 'analyze_demand_history', input: 'horizon=180d, decompose=[trend,seasonal,event]' },
    { agent: 'ForecastModel', tool: 'predict_demand', input: 'model=transformer, horizons=[14,30,90]d' },
    { agent: 'SeasonalityEngine', tool: 'decompose_temporal', input: 'patterns=[weekly,monthly,annual], detect_breaks=true' },
    { agent: 'PortfolioOptimizer', tool: 'solve_joint_pricing', input: 'method=dp, catalog=full, cannibalization=true' },
    { agent: 'RiskAssessor', tool: 'quantify_uncertainty', input: 'sim=monte_carlo, n=50000' },
    { agent: 'StrategyAgent', tool: 'publish_price_strategy', input: 'output=[paths,schedules,contingencies]' },
  ];

  return templates.map((t, i) => ({
    id: `${product}-${i}`,
    ...t,
    status: 'pending' as const,
    delay: NEMOCLAW_STEPS[i].thinkMs,
  }));
}

function computeTotalMs(): number {
  return NEMOCLAW_STEPS.reduce((sum, s) => sum + s.thinkMs + s.runMs, 0);
}

const DEFAULT_INPUTS: SimulatorInputs = {
  currentPrice: 49.99,
  competitorPrice: 44.99,
  marginFloor: 38.50,
  inventoryUnits: 2840,
  sku: 'SKU-A1047',
  targetMargin: 35,
};

export const useSimulatorStore = create<SimulatorStore>((set, get) => ({
  selectedScenarioId: SCENARIOS[0].id,
  selectedProduct: 'openclaw',
  compareMode: false,
  customInputs: DEFAULT_INPUTS,
  simState: 'idle',
  currentStepIndex: -1,
  totalSteps: 7,
  confidenceScore: 0,
  confidenceTarget: 89,
  streamLogs: [],
  visiblePricePoints: [],
  currentNarration: '',
  activePhaseNode: '',
  agentCalls: [],
  elapsedMs: 0,
  totalMs: 0,
  _timeoutIds: [],

  setScenario: (id) => {
    const scenario = SCENARIOS.find(s => s.id === id);
    if (scenario) {
      set({
        selectedScenarioId: id,
        simState: 'idle',
        currentStepIndex: -1,
        streamLogs: [],
        visiblePricePoints: [],
        confidenceScore: 0,
        currentNarration: '',
        agentCalls: [],
        elapsedMs: 0,
      });
    }
  },

  setProduct: (id) => set({ selectedProduct: id }),
  setCompareMode: (val) => set({ compareMode: val }),
  setCustomInputs: (inputs) => set({ customInputs: inputs }),

  startSimulation: () => {
    const store = get();
    if (store.simState !== 'idle') return;

    const scenario: Scenario = SCENARIOS.find(s => s.id === store.selectedScenarioId) || SCENARIOS[0];

    if (store.selectedProduct === 'openclaw') {
      // ── OpenClaw: stream real agent logs from the backend ──────────────────
      const calls = makeAgentCalls('openclaw');
      const AGENT_NAMES = calls.map(c => c.agent);

      set({
        simState: 'thinking',
        currentStepIndex: 0,
        streamLogs: [],
        visiblePricePoints: scenario.priceHistory.slice(0, 3),
        confidenceScore: 0,
        confidenceTarget: 89,
        currentNarration: 'Connecting to live data feeds and competitor sources…',
        activePhaseNode: scenario.pipelineSequence[0] || '',
        agentCalls: calls,
        elapsedMs: 0,
        totalMs: 0,
        _timeoutIds: [],
      });

      const body = JSON.stringify({
        product: 'openclaw',
        scenario_id: store.selectedScenarioId,
        current_price: store.customInputs.currentPrice,
        competitor_price: store.customInputs.competitorPrice,
        margin_floor: store.customInputs.marginFloor,
        inventory_units: store.customInputs.inventoryUnits,
        sku: store.customInputs.sku,
        target_margin: store.customInputs.targetMargin,
      });

      // Use fetch + ReadableStream so we can cancel via AbortController
      const controller = new AbortController();
      const startTs = Date.now();

      // Store the abort function so stopSimulation can cancel
      (get() as SimulatorStore & { _abortController?: AbortController })._abortController = controller;

      fetch('http://localhost:8000/api/v1/simulate/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        signal: controller.signal,
      })
        .then(async (res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const reader = res.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          // Track which agent index is currently active
          let currentAgentIdx = -1;

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const raw = line.slice(6).trim();
              if (!raw) continue;

              let evt: {
                type: string;
                agent?: string;
                level?: string;
                message?: string;
                elapsed_ms?: number;
                result?: {
                  recommended_price: number;
                  revenue_lift: number;
                  margin_impact: number;
                  confidence: number;
                  demand_change: number;
                  competitor_gap: number;
                  narration: string;
                };
              };
              try { evt = JSON.parse(raw); } catch { continue; }

              if (evt.type === 'log' && evt.agent && evt.level && evt.message) {
                const agentIdx = AGENT_NAMES.indexOf(evt.agent);

                // When agent changes, advance step UI
                if (agentIdx !== currentAgentIdx && agentIdx >= 0) {
                  currentAgentIdx = agentIdx;
                  set(s => ({
                    currentStepIndex: agentIdx,
                    simState: 'running' as SimState,
                    activePhaseNode: scenario.pipelineSequence[
                      Math.min(agentIdx, scenario.pipelineSequence.length - 1)
                    ],
                    agentCalls: s.agentCalls.map((c, i) => {
                      if (i < agentIdx) return { ...c, status: 'done' as const };
                      if (i === agentIdx) return { ...c, status: 'running' as const };
                      return c;
                    }),
                  }));
                }

                const logEntry: StreamLog = {
                  id: `sse-${Date.now()}-${Math.random()}`,
                  level: evt.level as StreamLog['level'],
                  message: `[${ts()}] ${evt.message}`,
                  ts: ts(),
                };

                set(s => ({
                  streamLogs: [...s.streamLogs, logEntry],
                  elapsedMs: Date.now() - startTs,
                  agentCalls: s.agentCalls.map((c, i) =>
                    i === agentIdx && c.status === 'running'
                      ? { ...c, liveOutput: evt.message }
                      : c
                  ),
                  confidenceScore: Math.min(
                    88,
                    Math.round(((Date.now() - startTs) / 85000) * 89 * 10) / 10,
                  ),
                }));
              }

              if (evt.type === 'result' && evt.result) {
                const r = evt.result;
                const finalLog: StreamLog = {
                  id: `final-${Date.now()}`,
                  level: 'success',
                  message: `[${ts()}] ✓ All agents complete — recommended price $${r.recommended_price.toFixed(2)} (confidence ${r.confidence}%)`,
                  ts: ts(),
                };
                set(s => ({
                  simState: 'complete',
                  currentStepIndex: AGENT_NAMES.length - 1,
                  confidenceScore: r.confidence,
                  confidenceTarget: r.confidence,
                  visiblePricePoints: scenario.priceHistory,
                  currentNarration: r.narration,
                  activePhaseNode: scenario.pipelineSequence[scenario.pipelineSequence.length - 1] || '',
                  elapsedMs: Date.now() - startTs,
                  streamLogs: [...s.streamLogs, finalLog],
                  agentCalls: s.agentCalls.map(c => ({ ...c, status: 'done' as const })),
                }));
              }

              if (evt.type === 'error') {
                set({ simState: 'idle' });
              }
            }
          }
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          const errorLog: StreamLog = {
            id: `err-${Date.now()}`,
            level: 'warn',
            message: `[${ts()}] Backend connection failed: ${err.message}`,
            ts: ts(),
          };
          set(s => ({
            simState: 'idle',
            streamLogs: [...s.streamLogs, errorLog],
          }));
        });

      return;
    }

    // ── NemoClaw (and fallback): client-side timeout simulation ───────────────
    const metrics = scenario.finalMetrics.nemoclaw;
    const steps = NEMOCLAW_STEPS;

    const marginGap = store.customInputs.currentPrice - store.customInputs.competitorPrice;
    const confAdjust = Math.max(-5, Math.min(5, marginGap * 0.3));
    const confTarget = Math.round((metrics.confidence + confAdjust) * 10) / 10;
    const totalMs = computeTotalMs();

    const calls = makeAgentCalls(store.selectedProduct);
    const allTimeoutIds: number[] = [];

    set({
      simState: 'thinking',
      currentStepIndex: 0,
      streamLogs: [],
      visiblePricePoints: scenario.priceHistory.slice(0, 3),
      confidenceScore: 0,
      confidenceTarget: confTarget,
      currentNarration: steps[0].narration,
      activePhaseNode: scenario.pipelineSequence[0] || '',
      agentCalls: calls,
      elapsedMs: 0,
      totalMs,
      _timeoutIds: [],
    });

    let cursor = 0;

    steps.forEach((step, stepIdx) => {
      const thinkStart = cursor;
      cursor += step.thinkMs;
      const stepStart = cursor;
      cursor += step.runMs;
      const stepEnd = cursor;

      for (let t = thinkStart + 200; t <= stepEnd; t += 200) {
        const capturedT = t;
        const tid = window.setTimeout(() => {
          set(s => ({ elapsedMs: Math.min(capturedT, s.totalMs) }));
        }, capturedT);
        allTimeoutIds.push(tid);
      }

      const thinkTid = window.setTimeout(() => {
        set(s => {
          const updated = s.agentCalls.map((c, i) =>
            i === stepIdx ? { ...c, status: 'running' as const } : c
          );
          return {
            agentCalls: updated,
            currentStepIndex: stepIdx,
            simState: step.phase,
            currentNarration: step.narration,
            activePhaseNode: scenario.pipelineSequence[Math.min(stepIdx, scenario.pipelineSequence.length - 1)],
          };
        });
      }, stepStart);
      allTimeoutIds.push(thinkTid);

      step.subLogs.forEach(subLog => {
        const logTid = window.setTimeout(() => {
          const logEntry: StreamLog = {
            id: `${stepIdx}-${subLog.offsetMs}-${Math.random()}`,
            level: subLog.level,
            message: `[${ts()}] ${subLog.message}`,
            ts: ts(),
          };
          set(s => ({
            streamLogs: [...s.streamLogs, logEntry],
            agentCalls: s.agentCalls.map((c, i) =>
              i === stepIdx && c.status === 'running'
                ? { ...c, liveOutput: subLog.message }
                : c
            ),
          }));
        }, stepStart + subLog.offsetMs);
        allTimeoutIds.push(logTid);
      });

      const doneTid = window.setTimeout(() => {
        const priceSlice = scenario.priceHistory.slice(0, step.revealPriceCount);
        const confJumpFraction = step.confJump / 100;

        set(s => {
          const newConf = Math.min(
            confTarget,
            Math.round((s.confidenceScore + confTarget * confJumpFraction) * 10) / 10
          );
          const doneMs = Math.floor(step.runMs - 50 + Math.random() * 100);
          const updatedCalls = s.agentCalls.map((c, i) =>
            i === stepIdx ? { ...c, status: 'done' as const, durationMs: doneMs } : c
          );
          return {
            agentCalls: updatedCalls,
            visiblePricePoints: priceSlice,
            confidenceScore: newConf,
          };
        });
      }, stepEnd);
      allTimeoutIds.push(doneTid);
    });

    const completeTid = window.setTimeout(() => {
      const finalLog: StreamLog = {
        id: `final-${Date.now()}`,
        level: 'success',
        message: `[${ts()}] ✓ All agents complete — recommendation ready`,
        ts: ts(),
      };
      set({
        simState: 'complete',
        currentStepIndex: steps.length - 1,
        confidenceScore: confTarget,
        visiblePricePoints: scenario.priceHistory,
        currentNarration: scenario.narrations[scenario.narrations.length - 1] || '',
        activePhaseNode: scenario.pipelineSequence[scenario.pipelineSequence.length - 1] || '',
        elapsedMs: totalMs,
        streamLogs: [...get().streamLogs, finalLog],
      });
    }, cursor + 300);
    allTimeoutIds.push(completeTid);

    set({ _timeoutIds: allTimeoutIds });
  },

  stopSimulation: () => {
    const store = get() as SimulatorStore & { _abortController?: AbortController };
    store._abortController?.abort();
    store._timeoutIds.forEach(id => clearTimeout(id));
    set({ simState: 'idle', _timeoutIds: [], elapsedMs: 0 });
  },

  resetSimulation: () => {
    const { _timeoutIds } = get();
    _timeoutIds.forEach(id => clearTimeout(id));
    set({
      simState: 'idle',
      currentStepIndex: -1,
      streamLogs: [],
      visiblePricePoints: [],
      confidenceScore: 0,
      currentNarration: '',
      activePhaseNode: '',
      agentCalls: [],
      elapsedMs: 0,
      _timeoutIds: [],
    });
  },
}));
