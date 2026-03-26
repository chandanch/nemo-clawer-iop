export type ProductId = 'openclaw' | 'nemoclaw';

export interface Capability {
  name: string;
  score: number; // 0-100
  description: string;
}

export interface BenchmarkCategory {
  name: string;
  openclaw: number;
  nemoclaw: number;
}

export interface Feature {
  name: string;
  openclaw: boolean | string;
  nemoclaw: boolean | string;
  category: string;
}

export const PRODUCTS = {
  openclaw: {
    id: 'openclaw' as ProductId,
    name: 'OpenClaw',
    tagline: 'Real-time competitive pricing intelligence',
    description: 'OpenClaw specializes in lightning-fast competitor monitoring and reactive pricing. Built for high-velocity markets where speed is the competitive edge.',
    color: '#2563EB',
    colorLight: '#60A5FA',
    colorGlow: 'rgba(37,99,235,0.25)',
    capabilities: [
      { name: 'Speed', score: 96, description: 'Sub-second price decisions' },
      { name: 'Competitor Intel', score: 94, description: 'Real-time scraping of 500+ sources' },
      { name: 'Elasticity Modeling', score: 78, description: 'ML-driven demand curves' },
      { name: 'Margin Protection', score: 82, description: 'Floor/ceiling guardrails' },
      { name: 'Forecasting', score: 71, description: 'Short-horizon demand prediction' },
      { name: 'Personalization', score: 65, description: 'Segment-level pricing' },
    ],
    strengths: ['Lightning-fast response (<100ms)', 'Broadest competitor coverage', 'Simple integration API', 'Real-time alerting'],
    bestFor: 'E-commerce, flash sales, high-SKU retail, competitive markets',
  },
  nemoclaw: {
    id: 'nemoclaw' as ProductId,
    name: 'NemoClaw',
    tagline: 'Deep demand intelligence & strategic pricing',
    description: 'NemoClaw leverages advanced deep learning for demand forecasting and strategic price optimization. Built for complex pricing scenarios requiring high accuracy.',
    color: '#059669',
    colorLight: '#34D399',
    colorGlow: 'rgba(5,150,105,0.25)',
    capabilities: [
      { name: 'Speed', score: 74, description: 'Near-real-time decisions (~2s)' },
      { name: 'Competitor Intel', score: 81, description: 'Curated competitive signals' },
      { name: 'Elasticity Modeling', score: 97, description: 'Deep learning demand models' },
      { name: 'Margin Protection', score: 91, description: 'Portfolio-level optimization' },
      { name: 'Forecasting', score: 95, description: 'Long-horizon demand forecasting' },
      { name: 'Personalization', score: 89, description: 'Individual-level pricing' },
    ],
    strengths: ['Highest forecast accuracy (94.7%)', 'Portfolio-wide optimization', 'Long-horizon planning', 'Deep personalization'],
    bestFor: 'SaaS, subscriptions, B2B pricing, seasonal businesses, luxury retail',
  },
};

export const BENCHMARKS: BenchmarkCategory[] = [
  { name: 'Price Decision Speed', openclaw: 96, nemoclaw: 74 },
  { name: 'Forecast Accuracy', openclaw: 71, nemoclaw: 95 },
  { name: 'Revenue Lift', openclaw: 8.4, nemoclaw: 12.7 },
  { name: 'Margin Protection', openclaw: 82, nemoclaw: 91 },
  { name: 'Competitor Coverage', openclaw: 94, nemoclaw: 81 },
  { name: 'Personalization Depth', openclaw: 65, nemoclaw: 89 },
  { name: 'Integration Ease', openclaw: 91, nemoclaw: 78 },
  { name: 'Scalability (M SKUs)', openclaw: 88, nemoclaw: 85 },
];

export const FEATURES: Feature[] = [
  { name: 'Real-time price scraping', category: 'Competitive Intel', openclaw: true, nemoclaw: 'Curated' },
  { name: 'Competitor monitoring sources', category: 'Competitive Intel', openclaw: '500+', nemoclaw: '200+' },
  { name: 'Price change alerts', category: 'Competitive Intel', openclaw: true, nemoclaw: true },
  { name: 'Market share tracking', category: 'Competitive Intel', openclaw: true, nemoclaw: true },
  { name: 'Demand forecasting horizon', category: 'Forecasting', openclaw: '7 days', nemoclaw: '180 days' },
  { name: 'Deep learning models', category: 'Forecasting', openclaw: false, nemoclaw: true },
  { name: 'Seasonality detection', category: 'Forecasting', openclaw: 'Basic', nemoclaw: 'Advanced' },
  { name: 'External signal integration', category: 'Forecasting', openclaw: false, nemoclaw: true },
  { name: 'Portfolio optimization', category: 'Optimization', openclaw: false, nemoclaw: true },
  { name: 'Margin floor guardrails', category: 'Optimization', openclaw: true, nemoclaw: true },
  { name: 'Bundle pricing', category: 'Optimization', openclaw: false, nemoclaw: true },
  { name: 'Dynamic markdown', category: 'Optimization', openclaw: true, nemoclaw: true },
  { name: 'Individual personalization', category: 'Optimization', openclaw: false, nemoclaw: true },
  { name: 'A/B price testing', category: 'Testing', openclaw: true, nemoclaw: true },
  { name: 'Bandit optimization', category: 'Testing', openclaw: false, nemoclaw: true },
  { name: 'REST API', category: 'Integration', openclaw: true, nemoclaw: true },
  { name: 'Webhook support', category: 'Integration', openclaw: true, nemoclaw: true },
  { name: 'Batch pricing API', category: 'Integration', openclaw: true, nemoclaw: true },
  { name: 'Real-time streaming API', category: 'Integration', openclaw: true, nemoclaw: false },
];
