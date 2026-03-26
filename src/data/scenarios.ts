// ProductId imported for type context (not used directly in this file)

export interface PricePoint {
  time: string;
  price: number;
  competitor: number;
  demand: number;
}

export interface ForecastPoint {
  time: string;
  actual?: number;
  predicted: number;
  upper: number;
  lower: number;
}

export interface CompetitorEvent {
  tick: number;
  message: string;
  type: 'drop' | 'raise' | 'new' | 'promo';
}

export interface LogEntry {
  delay: number; // ms from start
  level: 'info' | 'warn' | 'success' | 'analysis';
  message: string;
}

export interface ResultMetrics {
  recommendedPrice: number;
  currentPrice: number;
  revenueLift: number;
  marginImpact: number;
  confidence: number;
  demandChange: number;
  competitorGap: number;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  product: 'openclaw' | 'nemoclaw' | 'both';
  durationTicks: number;
  category: string;
  priceHistory: PricePoint[];
  forecastData: ForecastPoint[];
  competitorEvents: CompetitorEvent[];
  openclawLogs: LogEntry[];
  nemoclawLogs: LogEntry[];
  narrations: string[];
  finalMetrics: {
    openclaw: ResultMetrics;
    nemoclaw: ResultMetrics;
  };
  pipelineSequence: string[];
}

function genPriceHistory(base: number, competitorBase: number, length: number, trend: number = 0): PricePoint[] {
  const points: PricePoint[] = [];
  let price = base;
  let comp = competitorBase;
  for (let i = 0; i < length; i++) {
    price = Math.max(base * 0.85, Math.min(base * 1.2, price + (Math.random() - 0.48) * 0.8 + trend));
    comp = Math.max(competitorBase * 0.8, Math.min(competitorBase * 1.15, comp + (Math.random() - 0.5) * 1.2));
    const demand = Math.max(20, 100 - (price - competitorBase) * 8 + Math.random() * 15);
    points.push({
      time: `T-${length - i}h`,
      price: Math.round(price * 100) / 100,
      competitor: Math.round(comp * 100) / 100,
      demand: Math.round(demand),
    });
  }
  return points;
}

function genForecast(base: number, length: number, growth: number = 0.02): ForecastPoint[] {
  const points: ForecastPoint[] = [];
  let val = base;
  const split = Math.floor(length * 0.6);
  for (let i = 0; i < length; i++) {
    val = val * (1 + growth * (Math.random() * 2 - 0.5));
    const noise = val * 0.08;
    points.push({
      time: `D+${i + 1}`,
      actual: i < split ? Math.round(val) : undefined,
      predicted: Math.round(val),
      upper: Math.round(val + noise),
      lower: Math.round(Math.max(0, val - noise)),
    });
  }
  return points;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'competitor-entry',
    name: 'New Competitor Entry',
    description: 'A new competitor launches with aggressive pricing. Defend market share while protecting margins.',
    product: 'both',
    durationTicks: 20,
    category: 'Competitive Response',
    priceHistory: genPriceHistory(49.99, 44.99, 24, -0.1),
    forecastData: genForecast(850, 14, -0.03),
    competitorEvents: [
      { tick: 3, message: 'New entrant "PriceSlash" detected — 18% below market', type: 'new' },
      { tick: 8, message: 'Competitor A responds with 5% promotional discount', type: 'promo' },
      { tick: 14, message: 'PriceSlash raises prices by 7% (burn rate concerns)', type: 'raise' },
    ],
    openclawLogs: [
      { delay: 500, level: 'info', message: '[12:04:31] Initializing competitor scrape across 500+ sources...' },
      { delay: 1200, level: 'info', message: '[12:04:32] Detected new entrant: PriceSlash — SKU overlap: 73%' },
      { delay: 1800, level: 'warn', message: '[12:04:33] ALERT: PriceSlash @ $40.99 — 18.0% below your $49.99' },
      { delay: 2400, level: 'analysis', message: '[12:04:34] Running price elasticity model (ε = -1.31)...' },
      { delay: 3000, level: 'info', message: '[12:04:35] Demand impact estimated: -14.2% if no action taken' },
      { delay: 3800, level: 'info', message: '[12:04:36] Scanning margin floor constraints... floor: $38.50' },
      { delay: 4500, level: 'analysis', message: '[12:04:37] Competitive gap optimal zone: $43.99 – $45.99' },
      { delay: 5200, level: 'info', message: '[12:04:38] Checking inventory depth... 2,840 units available' },
      { delay: 6000, level: 'analysis', message: '[12:04:39] Price response strategy: Partial match + feature highlight' },
      { delay: 6800, level: 'info', message: '[12:04:40] A/B test variant generated: $44.99 vs $45.49' },
      { delay: 7500, level: 'success', message: '[12:04:41] RECOMMENDATION: Set price to $44.99 (confidence: 89.3%)' },
      { delay: 8200, level: 'info', message: '[12:04:42] Expected demand recovery: +11.4% within 4 hours' },
    ],
    nemoclawLogs: [
      { delay: 500, level: 'info', message: '[12:04:31] Loading demand models for SKU cluster #47...' },
      { delay: 1300, level: 'info', message: '[12:04:32] Ingesting 180-day demand history (22 features)...' },
      { delay: 2000, level: 'analysis', message: '[12:04:33] Deep learning model predicting competitive response curves...' },
      { delay: 2800, level: 'info', message: '[12:04:34] Analyzing PriceSlash market entry — historical parallels: 3 found' },
      { delay: 3600, level: 'analysis', message: '[12:04:35] Portfolio elasticity cross-matrix computed (47 SKUs)...' },
      { delay: 4400, level: 'info', message: '[12:04:36] Long-run demand trajectory: -6.2% without intervention' },
      { delay: 5300, level: 'analysis', message: '[12:04:37] Running 50,000 Monte Carlo simulations...' },
      { delay: 6200, level: 'info', message: '[12:04:38] Converged at iteration 12/50 — confidence: 94.7%' },
      { delay: 7100, level: 'info', message: '[12:04:39] Cannibalization risk assessed: low (0.8%)' },
      { delay: 8000, level: 'analysis', message: '[12:04:40] Optimal 30-day price path calculated...' },
      { delay: 9000, level: 'info', message: '[12:04:41] Personalized segments: 4 cohorts with distinct responses' },
      { delay: 9800, level: 'success', message: '[12:04:42] RECOMMENDATION: $45.49 (+$0.50 margin buffer) confidence: 94.7%' },
    ],
    narrations: [
      'Scanning competitor landscape for pricing signals...',
      'Analyzing market elasticity and demand sensitivity...',
      'Running price optimization under margin constraints...',
      'Generating final recommendation with confidence intervals...',
    ],
    finalMetrics: {
      openclaw: {
        recommendedPrice: 44.99,
        currentPrice: 49.99,
        revenueLift: 6.8,
        marginImpact: -3.2,
        confidence: 89.3,
        demandChange: 11.4,
        competitorGap: 4.0,
      },
      nemoclaw: {
        recommendedPrice: 45.49,
        currentPrice: 49.99,
        revenueLift: 8.2,
        marginImpact: -2.8,
        confidence: 94.7,
        demandChange: 9.8,
        competitorGap: 4.5,
      },
    },
    pipelineSequence: ['ingest', 'scrape', 'features', 'elasticity', 'optimize', 'validate', 'output'],
  },
  {
    id: 'seasonal-peak',
    name: 'Seasonal Peak Pricing',
    description: 'Holiday season approaching. Maximize revenue while avoiding demand destruction.',
    product: 'both',
    durationTicks: 18,
    category: 'Demand Optimization',
    priceHistory: genPriceHistory(29.99, 31.49, 24, 0.15),
    forecastData: genForecast(1200, 14, 0.06),
    competitorEvents: [
      { tick: 5, message: 'Competitor B raises prices +12% for holiday season', type: 'raise' },
      { tick: 11, message: 'Competitor C launches early Black Friday promo', type: 'promo' },
    ],
    openclawLogs: [
      { delay: 500, level: 'info', message: '[09:15:11] Holiday demand signal detected — search volume +340%' },
      { delay: 1200, level: 'info', message: '[09:15:12] Competitor B raised to $35.49 (+12.7%)' },
      { delay: 1900, level: 'analysis', message: '[09:15:13] Seasonal elasticity adjusted: ε = -0.87 (inelastic peak)' },
      { delay: 2700, level: 'info', message: '[09:15:14] Price ceiling analysis: $36.99 before demand cliff' },
      { delay: 3500, level: 'analysis', message: '[09:15:15] Revenue maximization model running...' },
      { delay: 4300, level: 'info', message: '[09:15:16] Inventory constraint: 4,200 units (sell-through target: 95%)' },
      { delay: 5100, level: 'success', message: '[09:15:17] RECOMMENDATION: $33.99 (+13.3%) — revenue lift: +18.4%' },
    ],
    nemoclawLogs: [
      { delay: 500, level: 'info', message: '[09:15:11] Loading seasonal demand decomposition model...' },
      { delay: 1300, level: 'analysis', message: '[09:15:12] Historical holiday analysis: 5 years, 847 SKUs' },
      { delay: 2100, level: 'info', message: '[09:15:13] External signals: weather, events, macro indicators — 18 features' },
      { delay: 3000, level: 'analysis', message: '[09:15:14] Demand forecast: +387% peak vs baseline (σ = ±12%)' },
      { delay: 3900, level: 'info', message: '[09:15:15] Dynamic pricing path: 6 price adjustments over 14 days' },
      { delay: 4800, level: 'analysis', message: '[09:15:16] Optimal extraction strategy computed via DP...' },
      { delay: 5700, level: 'success', message: '[09:15:17] RECOMMENDATION: $34.49 peak → $31.99 tail — confidence: 96.1%' },
    ],
    narrations: [
      'Analyzing seasonal demand signals and trends...',
      'Calibrating price elasticity for peak period...',
      'Computing revenue-maximizing price trajectory...',
      'Final recommendation ready with confidence band...',
    ],
    finalMetrics: {
      openclaw: {
        recommendedPrice: 33.99,
        currentPrice: 29.99,
        revenueLift: 18.4,
        marginImpact: 11.2,
        confidence: 87.6,
        demandChange: 4.8,
        competitorGap: -1.5,
      },
      nemoclaw: {
        recommendedPrice: 34.49,
        currentPrice: 29.99,
        revenueLift: 22.1,
        marginImpact: 13.8,
        confidence: 96.1,
        demandChange: 3.2,
        competitorGap: -1.0,
      },
    },
    pipelineSequence: ['ingest', 'history', 'forecast', 'seasonality', 'optimize', 'validate', 'output'],
  },
  {
    id: 'flash-sale',
    name: 'Flash Sale Response',
    description: 'Competitor launches a 4-hour flash sale. React in real-time to capture diverted demand.',
    product: 'openclaw',
    durationTicks: 15,
    category: 'Real-time Response',
    priceHistory: genPriceHistory(79.99, 69.99, 24, -0.2),
    forecastData: genForecast(420, 14, -0.08),
    competitorEvents: [
      { tick: 2, message: 'FLASH SALE: Competitor drops price 35% for 4 hours', type: 'drop' },
      { tick: 10, message: 'Flash sale ending in 60 minutes — demand stabilizing', type: 'promo' },
    ],
    openclawLogs: [
      { delay: 300, level: 'warn', message: '[14:22:05] FLASH SALE ALERT: Competitor A — $51.99 (-35%) 4hr sale' },
      { delay: 800, level: 'analysis', message: '[14:22:05] Real-time demand diversion: -28% in past 8 minutes' },
      { delay: 1400, level: 'info', message: '[14:22:06] Flash sale duration model: ends ~18:22 UTC' },
      { delay: 2000, level: 'analysis', message: '[14:22:06] Optimal counter-strategy: selective match on top 20 SKUs' },
      { delay: 2700, level: 'info', message: '[14:22:07] Price floor check: $61.50 minimum viable' },
      { delay: 3400, level: 'success', message: '[14:22:07] RECOMMENDATION: $63.99 for 4hrs → revert to $79.99' },
      { delay: 4000, level: 'info', message: '[14:22:08] Auto-revert scheduled: 18:25 UTC — confidence: 91.8%' },
    ],
    nemoclawLogs: [
      { delay: 400, level: 'warn', message: '[14:22:05] Flash sale signal detected — recalibrating demand model' },
      { delay: 1100, level: 'analysis', message: '[14:22:06] Transient demand shock: classified as short-duration (<6hrs)' },
      { delay: 2000, level: 'info', message: '[14:22:07] Long-run demand trajectory: unchanged (not a structural shift)' },
      { delay: 3000, level: 'analysis', message: '[14:22:07] Recommendation: hold price — demand will recover post-sale' },
      { delay: 3800, level: 'success', message: '[14:22:08] HOLD at $79.99 — post-sale recovery: +22% bounce expected' },
    ],
    narrations: [
      'Flash sale detected — analyzing competitor action...',
      'Modeling transient demand shock duration...',
      'Computing optimal counter-strategy...',
      'Recommendation ready — monitoring for reversion...',
    ],
    finalMetrics: {
      openclaw: {
        recommendedPrice: 63.99,
        currentPrice: 79.99,
        revenueLift: 4.2,
        marginImpact: -9.8,
        confidence: 91.8,
        demandChange: 18.6,
        competitorGap: 12.0,
      },
      nemoclaw: {
        recommendedPrice: 79.99,
        currentPrice: 79.99,
        revenueLift: 2.1,
        marginImpact: 0,
        confidence: 83.4,
        demandChange: -4.2,
        competitorGap: 28.0,
      },
    },
    pipelineSequence: ['ingest', 'alert', 'scrape', 'elasticity', 'optimize', 'output'],
  },
  {
    id: 'markdown-clearance',
    name: 'Inventory Clearance',
    description: 'End-of-season inventory needs to clear. Find the optimal markdown path.',
    product: 'nemoclaw',
    durationTicks: 16,
    category: 'Markdown Optimization',
    priceHistory: genPriceHistory(89.99, 79.99, 24, -0.25),
    forecastData: genForecast(280, 14, -0.12),
    competitorEvents: [
      { tick: 6, message: 'Category entering markdown season — broad price decline', type: 'drop' },
    ],
    openclawLogs: [
      { delay: 500, level: 'info', message: '[10:30:15] Inventory level: 3,847 units (days of supply: 47)' },
      { delay: 1300, level: 'analysis', message: '[10:30:16] Markdown velocity model: need -22% to clear in 30 days' },
      { delay: 2100, level: 'success', message: '[10:30:17] RECOMMENDATION: $69.99 (-22%) — projected clearance: 31 days' },
    ],
    nemoclawLogs: [
      { delay: 500, level: 'info', message: '[10:30:15] Loading clearance optimization model...' },
      { delay: 1200, level: 'analysis', message: '[10:30:16] Demand curve fitting: 180-day sell-through history' },
      { delay: 2000, level: 'info', message: '[10:30:17] Optimal markdown path: 3-step ladder over 21 days' },
      { delay: 2800, level: 'analysis', message: '[10:30:18] Step 1: $79.99 (D1-7), Step 2: $69.99 (D8-14), Step 3: $59.99 (D15-21)' },
      { delay: 3700, level: 'info', message: '[10:30:19] Expected clearance: Day 18.4 ± 1.2 days (95% CI)' },
      { delay: 4500, level: 'success', message: '[10:30:20] Revenue recovery: 94.2% vs single-step markdown — confidence: 93.8%' },
    ],
    narrations: [
      'Analyzing inventory position and sell-through rate...',
      'Fitting demand curve to historical clearance data...',
      'Computing optimal multi-step markdown path...',
      'Final markdown schedule ready...',
    ],
    finalMetrics: {
      openclaw: {
        recommendedPrice: 69.99,
        currentPrice: 89.99,
        revenueLift: -8.4,
        marginImpact: -18.2,
        confidence: 82.1,
        demandChange: 34.6,
        competitorGap: -2.0,
      },
      nemoclaw: {
        recommendedPrice: 79.99,
        currentPrice: 89.99,
        revenueLift: -3.1,
        marginImpact: -9.4,
        confidence: 93.8,
        demandChange: 18.2,
        competitorGap: 0,
      },
    },
    pipelineSequence: ['ingest', 'inventory', 'forecast', 'markdown', 'schedule', 'validate', 'output'],
  },
];
