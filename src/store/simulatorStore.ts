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

const OPENCLAW_STEPS: AgentStep[] = [
  {
    // Step 1 — Data Ingestion: ~12s total (900ms think + 11.1s run)
    callIndex: 0,
    thinkMs: 900,
    runMs: 11100,
    phase: 'thinking',
    narration: 'Connecting to live data feeds and competitor sources…',
    subLogs: [
      { offsetMs:  150, level: 'info',     message: 'Initializing streaming ingestion pipeline (region: us-east-1)…' },
      { offsetMs:  540, level: 'debug',    message: 'DNS resolution: data-feed.openclaw.io → 10.12.4.7 (18ms)' },
      { offsetMs:  960, level: 'info',     message: 'TCP handshake complete — connection pool warmed (8 workers)' },
      { offsetMs: 1500, level: 'debug',    message: 'Fetching batch 1/5 — sources 1–100: 100 OK, 0 timeout' },
      { offsetMs: 2160, level: 'debug',    message: 'Fetching batch 2/5 — sources 101–200: 98 OK, 2 retrying…' },
      { offsetMs: 2640, level: 'warn',     message: 'Source #147 (pricespy.nl) timeout — retrying with fallback mirror' },
      { offsetMs: 3150, level: 'debug',    message: 'Retry OK — source #147 resolved via cdn-mirror (231ms)' },
      { offsetMs: 3600, level: 'debug',    message: 'Fetching batch 3/5 — sources 201–300: 300 OK, 0 timeout' },
      { offsetMs: 4350, level: 'info',     message: 'Received 9,841 price signals (batch 1–3 partial flush)' },
      { offsetMs: 4800, level: 'debug',    message: 'Fetching batch 4/5 — sources 301–400: 399 OK, 1 rate-limited' },
      { offsetMs: 5460, level: 'warn',     message: 'Source #382 (camelcamelcamel) rate-limited — backing off 600ms' },
      { offsetMs: 6150, level: 'debug',    message: 'Rate-limit backoff complete — resuming source #382' },
      { offsetMs: 6600, level: 'debug',    message: 'Fetching batch 5/5 — sources 401–500: 500 OK, 0 errors' },
      { offsetMs: 7500, level: 'info',     message: 'Stream buffer flush — 31,471 additional signals received' },
      { offsetMs: 8400, level: 'debug',    message: 'Deduplicating signals — removing 4,218 exact duplicates…' },
      { offsetMs: 9300, level: 'analysis', message: 'Schema normalization: 47,312 signals → unified price_event schema' },
      { offsetMs: 10200, level: 'info',    message: 'Writing to time-series buffer (InfluxDB) — batch commit OK' },
      { offsetMs: 10950, level: 'success', message: 'Data ingestion complete — 500/500 sources healthy, 47,312 signals indexed' },
    ],
    revealPriceCount: 4,
    confJump: 6,
  },
  {
    // Step 2 — Competitor Scrape: ~12s total (600ms think + 11.4s run)
    callIndex: 1,
    thinkMs: 600,
    runMs: 11400,
    phase: 'thinking',
    narration: 'Running ML-powered SKU matching across competitor catalogs…',
    subLogs: [
      { offsetMs:  180, level: 'info',     message: 'Loading SKU embedding model v2.4 (384-dim sentence-transformers)…' },
      { offsetMs:  750, level: 'debug',    message: 'Model weights loaded from S3 (oc-models/sku-embed-v2.4.pt) — 1.2GB' },
      { offsetMs: 1350, level: 'info',     message: 'Encoding 2,840 internal SKUs → embedding space…' },
      { offsetMs: 2100, level: 'debug',    message: 'Encoded 500/2840 SKUs (17.6%)…' },
      { offsetMs: 2850, level: 'debug',    message: 'Encoded 1200/2840 SKUs (42.3%)…' },
      { offsetMs: 3600, level: 'debug',    message: 'Encoded 2000/2840 SKUs (70.4%)…' },
      { offsetMs: 4350, level: 'debug',    message: 'Encoded 2840/2840 SKUs (100%) — embedding matrix ready' },
      { offsetMs: 4950, level: 'info',     message: 'Running FAISS nearest-neighbor search across 500 competitor catalogs…' },
      { offsetMs: 5700, level: 'debug',    message: 'FAISS index build complete — 1.4M competitor SKU vectors' },
      { offsetMs: 6450, level: 'debug',    message: 'ANN search batch 1/4 — 710 queries complete' },
      { offsetMs: 7200, level: 'debug',    message: 'ANN search batch 2/4 — 1420 queries complete' },
      { offsetMs: 7950, level: 'debug',    message: 'ANN search batch 3/4 — 2130 queries complete, top-k=5' },
      { offsetMs: 8700, level: 'debug',    message: 'ANN search batch 4/4 — 2840 queries complete' },
      { offsetMs: 9300, level: 'analysis', message: 'Catalog overlap computed: avg 73.2% ± 4.1% across competitors' },
      { offsetMs: 10050, level: 'warn',    message: 'New entrant detected: PriceSlash.io — 73% SKU overlap, 18% below market' },
      { offsetMs: 10650, level: 'analysis', message: 'Similarity threshold filtering: 2,840 matches (cosine > 0.89)' },
      { offsetMs: 11250, level: 'success', message: 'Price signal extraction complete — 2,840 SKU matches, 14,200 price pairs' },
    ],
    revealPriceCount: 7,
    confJump: 10,
  },
  {
    // Step 3 — Feature Engineering: ~12s total (750ms think + 11.25s run)
    callIndex: 2,
    thinkMs: 750,
    runMs: 11250,
    phase: 'analyzing',
    narration: 'Engineering 84 real-time pricing features from raw signals…',
    subLogs: [
      { offsetMs:  240, level: 'info',     message: 'Feature pipeline v3.2 starting — 84 features across 6 groups…' },
      { offsetMs:  900, level: 'info',     message: 'Group 1/6: Price gap features [14 features] — computing…' },
      { offsetMs: 1650, level: 'debug',    message: 'price_gap_abs, price_gap_pct, price_gap_rank — OK' },
      { offsetMs: 2400, level: 'info',     message: 'Group 2/6: Rank position features [12 features] — computing…' },
      { offsetMs: 3150, level: 'debug',    message: 'rank_by_price, rank_by_reviews, rank_percentile — OK' },
      { offsetMs: 3900, level: 'info',     message: 'Group 3/6: Velocity trend features [18 features] — computing…' },
      { offsetMs: 4650, level: 'debug',    message: '1h/6h/24h price velocity, momentum, acceleration — OK' },
      { offsetMs: 5400, level: 'info',     message: 'Group 4/6: Inventory signals [11 features] — querying WMS…' },
      { offsetMs: 6000, level: 'debug',    message: 'WMS API call: GET /inventory/sku/A1047 → 200 OK (94ms)' },
      { offsetMs: 6750, level: 'info',     message: 'Group 5/6: Temporal pattern features [16 features] — computing…' },
      { offsetMs: 7500, level: 'debug',    message: 'dow_factor, hour_of_day, days_to_holiday, seasonal_index — OK' },
      { offsetMs: 8400, level: 'info',     message: 'Group 6/6: Competitor behavior features [13 features] — computing…' },
      { offsetMs: 9150, level: 'debug',    message: 'competitor_price_std, promo_frequency, restock_signal — OK' },
      { offsetMs: 9900, level: 'analysis', message: 'Feature importance ranking: price_gap_pct=0.87, velocity_1h=0.74, rank_pct=0.68' },
      { offsetMs: 10650, level: 'debug',   message: 'Null check: 0/84 features contain NaN — all clean' },
      { offsetMs: 11100, level: 'success', message: '84 features computed in 11.1s — feature vector written to Redis cache' },
    ],
    revealPriceCount: 11,
    confJump: 12,
  },
  {
    // Step 4 — Elasticity Model: ~12s total (900ms think + 11.1s run)
    callIndex: 3,
    thinkMs: 900,
    runMs: 11100,
    phase: 'analyzing',
    narration: 'Estimating price elasticity with gradient boosting model…',
    subLogs: [
      { offsetMs:  210, level: 'info',     message: 'Loading elasticity model checkpoint (epoch 847, RMSE=0.043)…' },
      { offsetMs:  840, level: 'debug',    message: 'Model artifact fetched from S3: oc-models/elasticity-gbm-e847.pkl (88MB)' },
      { offsetMs: 1500, level: 'info',     message: 'Assembling 30-day rolling feature window (26,280 rows)…' },
      { offsetMs: 2250, level: 'debug',    message: 'Data pipeline: join price history + feature vectors — 26,280 rows OK' },
      { offsetMs: 3000, level: 'debug',    message: 'Scaling features (StandardScaler) — mean/std from training set' },
      { offsetMs: 3750, level: 'info',     message: 'Running GBM inference — 850 trees, max_depth=6…' },
      { offsetMs: 4500, level: 'debug',    message: 'Tree ensemble pass 1/3 (trees 1–283) — intermediate score: −1.18' },
      { offsetMs: 5550, level: 'debug',    message: 'Tree ensemble pass 2/3 (trees 284–567) — intermediate score: −1.27' },
      { offsetMs: 6600, level: 'debug',    message: 'Tree ensemble pass 3/3 (trees 568–850) — final score: −1.31' },
      { offsetMs: 7500, level: 'analysis', message: 'Elasticity estimate: ε = −1.31 (95% CI: −1.24 to −1.38)' },
      { offsetMs: 8400, level: 'analysis', message: 'At current gap $5.00: demand impact = −14.2% within 4 hours' },
      { offsetMs: 9300, level: 'debug',    message: 'SHAP explanation computed — top driver: price_gap_pct (contrib=0.54)' },
      { offsetMs: 10200, level: 'warn',    message: 'Demand velocity accelerating: −2.1% in last 15min — urgency flag set' },
      { offsetMs: 10950, level: 'success', message: 'Elasticity model complete — ε=−1.31, inference time: 4.7ms' },
    ],
    revealPriceCount: 15,
    confJump: 15,
  },
  {
    // Step 5 — Price Optimizer: ~12s total (1050ms think + 10.95s run)
    callIndex: 4,
    thinkMs: 1050,
    runMs: 10950,
    phase: 'deciding',
    narration: 'Searching optimal price across 50 candidates with margin constraints…',
    subLogs: [
      { offsetMs:  240, level: 'info',     message: 'Setting up constrained optimization: margin_floor=$38.50, MAP=none' },
      { offsetMs:  900, level: 'debug',    message: 'Price grid: $38.50 → $52.00, step=$0.27, 50 candidates' },
      { offsetMs: 1650, level: 'info',     message: 'Evaluating candidate set — scoring revenue × margin Pareto surface…' },
      { offsetMs: 2250, level: 'debug',    message: 'Candidate $38.50 — margin: $0.00 ✗ at floor, rejected' },
      { offsetMs: 2850, level: 'debug',    message: 'Candidate $41.99 — rev lift: +9.1%, margin: −7.8% ✗ below target' },
      { offsetMs: 3600, level: 'debug',    message: 'Candidate $43.49 — rev lift: +7.1%, margin: −5.8% ✗ below floor' },
      { offsetMs: 4350, level: 'analysis', message: 'Candidate $44.99 — rev lift: +6.8%, margin: −3.2% ✓ Pareto-optimal' },
      { offsetMs: 5100, level: 'debug',    message: 'Candidate $45.49 — rev lift: +5.9%, margin: −2.6% ✓ checking demand…' },
      { offsetMs: 5850, level: 'debug',    message: 'Candidate $46.99 — rev lift: +2.1%, margin: −0.9% — demand cliff risk' },
      { offsetMs: 6600, level: 'debug',    message: 'Candidate $49.99 — rev lift: 0.0%, margin: 0.0% — no action baseline' },
      { offsetMs: 7500, level: 'analysis', message: 'A/B test variants generated: $44.99 (primary) vs $45.49 (holdout)' },
      { offsetMs: 8400, level: 'debug',    message: 'Inventory constraint check: 2,840 units @ $44.99 = $127,572 GMV exposure' },
      { offsetMs: 9300, level: 'analysis', message: 'Pareto front: 3 non-dominated solutions — selecting max expected value' },
      { offsetMs: 10200, level: 'debug',   message: 'Expected demand recovery at $44.99: +11.4% within 4 hours (ε model)' },
      { offsetMs: 10800, level: 'success', message: 'Price optimizer complete — optimal: $44.99, EV: +$8,714 vs baseline' },
    ],
    revealPriceCount: 19,
    confJump: 18,
  },
  {
    // Step 6 — Rules / Guardrails: ~12s total (600ms think + 11.4s run)
    callIndex: 5,
    thinkMs: 600,
    runMs: 11400,
    phase: 'deciding',
    narration: 'Validating recommendation against business guardrails…',
    subLogs: [
      { offsetMs:  300, level: 'info',     message: 'RulesEngine v4.1 — loading 47 active guardrail policies…' },
      { offsetMs: 1050, level: 'debug',    message: 'Policy index loaded from config store (etcd) — 47 rules, 0 conflicts' },
      { offsetMs: 1800, level: 'info',     message: 'Rule 1/6: Margin floor check — $44.99 > $38.50 ✓' },
      { offsetMs: 2700, level: 'info',     message: 'Rule 2/6: MAP compliance check — no MAP constraint on SKU-A1047 ✓' },
      { offsetMs: 3600, level: 'info',     message: 'Rule 3/6: Channel parity — querying marketplace API…' },
      { offsetMs: 4200, level: 'debug',    message: 'GET /channels/sku/A1047/prices → {amazon: 45.99, ebay: 44.49} (112ms)' },
      { offsetMs: 4950, level: 'debug',    message: 'Channel delta: $44.99 vs Amazon $45.99 — within ±5% parity window ✓' },
      { offsetMs: 5850, level: 'info',     message: 'Rule 4/6: Bundle pricing consistency — scanning 3 bundles…' },
      { offsetMs: 6600, level: 'debug',    message: 'Bundle B-1041: updating child price $44.99 → bundle total adjusted ✓' },
      { offsetMs: 7500, level: 'info',     message: 'Rule 5/6: Promotional lock check — no active promo on this SKU ✓' },
      { offsetMs: 8550, level: 'info',     message: 'Rule 6/6: Velocity guard — change magnitude $5.00 (10%) < 15% threshold ✓' },
      { offsetMs: 9600, level: 'debug',    message: 'Audit record created: decision_id=OC-20240312-7741, rules_passed=6/6' },
      { offsetMs: 10500, level: 'analysis', message: 'Risk score: LOW (0.12/1.0) — no manual review required' },
      { offsetMs: 11250, level: 'success', message: 'All 6 guardrail checks passed — recommendation approved for execution' },
    ],
    revealPriceCount: 22,
    confJump: 14,
  },
  {
    // Step 7 — Execution: ~12s total (450ms think + 11.55s run)
    callIndex: 6,
    thinkMs: 450,
    runMs: 11550,
    phase: 'running',
    narration: 'Publishing price decision to execution layer…',
    subLogs: [
      { offsetMs:  240, level: 'info',     message: 'Serializing price decision payload (JSON-Schema v2)…' },
      { offsetMs:  900, level: 'debug',    message: 'Payload size: 4.2KB — within streaming threshold' },
      { offsetMs: 1650, level: 'info',     message: 'POST /v2/prices → pricing-execution-service:8080 (TLS 1.3)…' },
      { offsetMs: 2400, level: 'debug',    message: 'HTTP/2 stream opened — waiting for 100-Continue…' },
      { offsetMs: 3300, level: 'debug',    message: 'Request body transmitted (4.2KB, 8ms) — awaiting ACK' },
      { offsetMs: 4200, level: 'info',     message: 'Execution service ACK received — price queued for write' },
      { offsetMs: 5250, level: 'debug',    message: 'Database write: UPDATE prices SET price=44.99 WHERE sku=A1047 → OK (23ms)' },
      { offsetMs: 6300, level: 'info',     message: 'Webhook dispatch: 3 downstream subscribers notified…' },
      { offsetMs: 7200, level: 'debug',    message: 'Webhook 1/3 (storefront-cache): 200 OK (41ms)' },
      { offsetMs: 7950, level: 'debug',    message: 'Webhook 2/3 (analytics-pipeline): 200 OK (67ms)' },
      { offsetMs: 8700, level: 'debug',    message: 'Webhook 3/3 (marketing-automation): 200 OK (88ms)' },
      { offsetMs: 9600, level: 'info',     message: 'Audit log committed: decision_id=OC-20240312-7741, ts=2024-03-12T12:04:41Z' },
      { offsetMs: 10500, level: 'info',    message: 'Rollback snapshot created — previous price $49.99 saved for auto-revert' },
      { offsetMs: 11250, level: 'debug',   message: 'Monitoring alert armed: price=$44.99, revert-threshold=−8%, window=4h' },
      { offsetMs: 11400, level: 'success', message: 'Price decision published — end-to-end latency: 83ms ✓' },
    ],
    revealPriceCount: 24,
    confJump: 10,
  },
];

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
  const steps = product === 'openclaw' ? OPENCLAW_STEPS : NEMOCLAW_STEPS;
  const templates = product === 'openclaw'
    ? [
      { agent: 'DataIngestionAgent', tool: 'fetch_competitor_prices', input: 'sources=500, latency=<100ms, format=streaming' },
      { agent: 'ScraperAgent', tool: 'extract_price_signals', input: 'sku_match=ml_powered, catalog_overlap=true' },
      { agent: 'FeatureAgent', tool: 'compute_features', input: 'features=84, window=rolling_30d, velocity=true' },
      { agent: 'ElasticityAgent', tool: 'estimate_elasticity', input: 'model=gradient_boost, inference=<5ms' },
      { agent: 'OptimizerAgent', tool: 'search_optimal_price', input: 'candidates=50, constraints=[margin_floor,map,parity]' },
      { agent: 'RulesEngine', tool: 'validate_guardrails', input: 'rules=[margin_min,bundle_consistency,promo_lock]' },
      { agent: 'ExecutionAgent', tool: 'publish_price_decision', input: 'mode=streaming, audit=true' },
    ]
    : [
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
    delay: steps[i].thinkMs,
  }));
}

function computeTotalMs(product: ProductId): number {
  const steps = product === 'openclaw' ? OPENCLAW_STEPS : NEMOCLAW_STEPS;
  return steps.reduce((sum, s) => sum + s.thinkMs + s.runMs, 0);
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
    const metrics = store.selectedProduct === 'openclaw' ? scenario.finalMetrics.openclaw : scenario.finalMetrics.nemoclaw;
    const steps = store.selectedProduct === 'openclaw' ? OPENCLAW_STEPS : NEMOCLAW_STEPS;

    const marginGap = store.customInputs.currentPrice - store.customInputs.competitorPrice;
    const confAdjust = Math.max(-5, Math.min(5, marginGap * 0.3));
    const confTarget = Math.round((metrics.confidence + confAdjust) * 10) / 10;
    const totalMs = computeTotalMs(store.selectedProduct);

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

    let cursor = 0; // accumulated ms offset from sim start

    steps.forEach((step, stepIdx) => {
      // --- Think pause: agent reading previous output ---
      const thinkStart = cursor;
      cursor += step.thinkMs;
      const stepStart = cursor;
      cursor += step.runMs;
      const stepEnd = cursor;

      // Elapsed ticker — update progress every 200ms during this step
      for (let t = thinkStart + 200; t <= stepEnd; t += 200) {
        const capturedT = t;
        const tid = window.setTimeout(() => {
          set(s => ({ elapsedMs: Math.min(capturedT, s.totalMs) }));
        }, capturedT);
        allTimeoutIds.push(tid);
      }

      // Mark this call as "thinking" (pending) then "running"
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

      // Stream sub-logs during step execution + update live output on the call card
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

      // On step completion: mark done, reveal price data, bump confidence
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

    // Final completion after all steps
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
    const { _timeoutIds } = get();
    _timeoutIds.forEach(id => clearTimeout(id));
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
