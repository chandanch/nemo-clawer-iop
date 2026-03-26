import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Cpu, Globe, Shield, TrendingUp, Zap, CheckCircle } from 'lucide-react';
import { PRODUCTS } from '../data/products';

const STATS = [
  { label: 'Revenue Lift', value: '12.7%', desc: 'Average across deployments' },
  { label: 'Price Decisions/sec', value: '50K+', desc: 'At peak capacity' },
  { label: 'Competitor Sources', value: '500+', desc: 'Real-time monitoring' },
  { label: 'Forecast Accuracy', value: '94.7%', desc: 'NemoClaw benchmark' },
];

const FEATURES_GRID = [
  { icon: Zap, title: 'Real-time Decisions', desc: 'Sub-second price optimization responding to market signals as they happen.' },
  { icon: Brain, title: 'Deep Learning Models', desc: 'Neural networks trained on billions of pricing events across industries.' },
  { icon: Globe, title: 'Global Market Intel', desc: '500+ competitor data sources monitored continuously across all geographies.' },
  { icon: TrendingUp, title: 'Revenue Maximization', desc: 'Proven 8–22% revenue lift through intelligent demand-curve pricing.' },
  { icon: Shield, title: 'Margin Protection', desc: 'Automated guardrails ensure you never price below your defined floor.' },
  { icon: Cpu, title: 'Autonomous Agents', desc: 'Multi-step AI agents that reason, plan, and execute pricing strategies.' },
];

export function Landing() {
  return (
    <div className="min-h-screen" style={{ background: '#080B14' }}>
      {/* Grid background */}
      <div className="fixed inset-0 grid-bg opacity-60 pointer-events-none" />

      {/* Hero section */}
      <section className="relative pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-sm"
            style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)', color: '#60A5FA' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            AI-Powered Pricing Intelligence
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
            style={{ color: '#F1F5F9' }}
          >
            AI that sets the{' '}
            <span style={{ background: 'linear-gradient(135deg, #2563EB, #34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              right price
            </span>
            ,<br />every time
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: '#64748B' }}
          >
            OpenClaw and NemoClaw are autonomous AI pricing agents that monitor competitors,
            forecast demand, and optimize prices in real time — maximizing revenue while protecting margins.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/simulator"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', color: 'white', boxShadow: '0 0 24px rgba(37,99,235,0.4)' }}
            >
              Launch Simulator
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/comparison"
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all hover:opacity-80"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#F1F5F9', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              Compare Products
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.1 }}
                className="text-center p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="text-3xl font-bold mb-1" style={{ background: 'linear-gradient(135deg, #60A5FA, #34D399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {stat.value}
                </div>
                <div className="text-sm font-medium mb-0.5" style={{ color: '#F1F5F9' }}>{stat.label}</div>
                <div className="text-xs" style={{ color: '#475569' }}>{stat.desc}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Cards */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#F1F5F9' }}>Two products, one mission</h2>
            <p style={{ color: '#64748B' }}>Choose the right agent for your pricing challenge</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {(['openclaw', 'nemoclaw'] as const).map((id, idx) => {
              const p = PRODUCTS[id];
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="rounded-2xl p-6 relative overflow-hidden hover:scale-[1.02] transition-transform"
                  style={{ background: 'rgba(15,22,36,0.8)', border: `1px solid ${p.color}44`, boxShadow: `0 0 40px ${p.colorGlow}` }}
                >
                  {/* Top gradient line */}
                  <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${p.color}, transparent)` }} />

                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ background: p.color }}>
                          {p.name.slice(0, 2)}
                        </div>
                        <h3 className="text-xl font-bold text-white">{p.name}</h3>
                      </div>
                      <p className="text-sm" style={{ color: p.colorLight }}>{p.tagline}</p>
                    </div>
                  </div>

                  <p className="text-sm mb-4 leading-relaxed" style={{ color: '#64748B' }}>{p.description}</p>

                  <div className="space-y-2 mb-6">
                    {p.strengths.map(s => (
                      <div key={s} className="flex items-center gap-2 text-sm">
                        <CheckCircle size={13} style={{ color: p.colorLight, flexShrink: 0 }} />
                        <span style={{ color: '#94A3B8' }}>{s}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#475569' }}>Best for</p>
                    <p className="text-xs" style={{ color: '#64748B' }}>{p.bestFor}</p>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      to="/simulator"
                      className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90"
                      style={{ background: p.color, color: 'white' }}
                    >
                      Try in Simulator
                    </Link>
                    <Link
                      to="/comparison"
                      className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
                      style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      Compare
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-4 pb-20">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-10" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#F1F5F9' }}>Built for real-world pricing complexity</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES_GRID.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="p-5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'rgba(37,99,235,0.15)' }}>
                  <f.icon size={18} style={{ color: '#60A5FA' }} />
                </div>
                <h4 className="font-semibold mb-1.5 text-white">{f.title}</h4>
                <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <section className="px-4 pb-24">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl"
            style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.2)' }}
          >
            <h3 className="text-2xl font-bold mb-3" style={{ color: '#F1F5F9' }}>Ready to see it in action?</h3>
            <p className="mb-6" style={{ color: '#64748B' }}>Run a live simulation and watch the AI agent reason through real pricing challenges.</p>
            <Link
              to="/simulator"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold hover:scale-105 transition-transform"
              style={{ background: 'linear-gradient(135deg, #2563EB, #059669)', color: 'white', boxShadow: '0 0 32px rgba(37,99,235,0.3)' }}
            >
              Launch the Simulator
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
