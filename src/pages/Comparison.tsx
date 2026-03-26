import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { PRODUCTS, BENCHMARKS, FEATURES } from '../data/products';
import { CapabilityRadarChart } from '../components/charts/CapabilityRadarChart';

const CATEGORIES = ['All', 'Competitive Intel', 'Forecasting', 'Optimization', 'Testing', 'Integration'];

function FeatureValue({ val }: { val: boolean | string }) {
  if (val === true) return <Check size={14} style={{ color: '#34D399' }} className="mx-auto" />;
  if (val === false) return <X size={14} style={{ color: '#475569' }} className="mx-auto" />;
  return <span className="text-xs" style={{ color: '#94A3B8' }}>{val}</span>;
}

export function Comparison() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredFeatures = activeCategory === 'All'
    ? FEATURES
    : FEATURES.filter(f => f.category === activeCategory);

  const oc = PRODUCTS.openclaw;
  const nc = PRODUCTS.nemoclaw;

  return (
    <div className="min-h-screen pt-16" style={{ background: '#080B14' }}>
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.h1 initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-white mb-2">
            OpenClaw vs NemoClaw
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={{ color: '#64748B' }}>
            Choose the right pricing agent for your use case
          </motion.p>
        </div>

        {/* Product hero cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {[oc, nc].map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl p-6"
              style={{ background: 'rgba(15,22,36,0.8)', border: `1px solid ${p.color}44`, boxShadow: `0 0 30px ${p.colorGlow}` }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white" style={{ background: p.color }}>
                  {p.name.slice(0, 2)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  <p className="text-sm" style={{ color: p.colorLight }}>{p.tagline}</p>
                </div>
              </div>

              <div className="space-y-3">
                {p.capabilities.map(cap => (
                  <div key={cap.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: '#94A3B8' }}>{cap.name}</span>
                      <span style={{ color: p.colorLight }}>{cap.score}/100</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${p.color}, ${p.colorLight})` }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${cap.score}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          {/* Radar chart */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="rounded-xl p-5"
            style={{ background: 'rgba(15,22,36,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">Capability Comparison</h3>
            <CapabilityRadarChart />
          </motion.div>

          {/* Benchmark bars */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="rounded-xl p-5"
            style={{ background: 'rgba(15,22,36,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">Benchmark Scores</h3>
            <div className="space-y-3">
              {BENCHMARKS.slice(0, 6).map(b => (
                <div key={b.name}>
                  <div className="flex justify-between text-xs mb-1" style={{ color: '#64748B' }}>
                    <span>{b.name}</span>
                    <span><span style={{ color: '#60A5FA' }}>{b.openclaw}</span> / <span style={{ color: '#34D399' }}>{b.nemoclaw}</span></span>
                  </div>
                  <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <motion.div
                      className="absolute left-0 top-0 h-full rounded-full"
                      style={{ background: '#2563EB', opacity: 0.7 }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${b.openclaw}%` }}
                      transition={{ duration: 0.7 }}
                    />
                    <motion.div
                      className="absolute left-0 top-0 h-full rounded-full"
                      style={{ background: '#059669', opacity: 0.5 }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${b.nemoclaw}%` }}
                      transition={{ duration: 0.7, delay: 0.1 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Feature matrix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="rounded-xl overflow-hidden"
          style={{ background: 'rgba(15,22,36,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Category filter */}
          <div className="flex items-center gap-2 p-4 border-b overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all"
                style={{
                  background: activeCategory === cat ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.04)',
                  color: activeCategory === cat ? '#60A5FA' : '#64748B',
                  border: `1px solid ${activeCategory === cat ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#475569', width: '40%' }}>Feature</th>
                  <th className="text-center px-4 py-3" style={{ width: '30%' }}>
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ background: '#2563EB' }}>OC</div>
                      <span className="text-sm font-semibold text-white">OpenClaw</span>
                    </div>
                  </th>
                  <th className="text-center px-4 py-3" style={{ width: '30%' }}>
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-bold" style={{ background: '#059669' }}>NC</div>
                      <span className="text-sm font-semibold text-white">NemoClaw</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredFeatures.map((f, i) => (
                  <motion.tr
                    key={f.name}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    className="hover:bg-white hover:bg-opacity-[0.02] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm text-white">{f.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#475569' }}>{f.category}</div>
                    </td>
                    <td className="px-4 py-3 text-center"><FeatureValue val={f.openclaw} /></td>
                    <td className="px-4 py-3 text-center"><FeatureValue val={f.nemoclaw} /></td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* When to use */}
        <div className="grid md:grid-cols-2 gap-4 mt-8">
          {[oc, nc].map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="rounded-xl p-5"
              style={{ background: `${p.colorGlow}`, border: `1px solid ${p.color}33` }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ background: p.color }}>{p.name.slice(0, 2)}</div>
                <h4 className="font-semibold text-white">When to use {p.name}</h4>
              </div>
              <p className="text-sm leading-relaxed mb-3" style={{ color: '#94A3B8' }}>{p.description}</p>
              <div className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: p.colorLight }}>Best for</div>
              <p className="text-sm" style={{ color: '#64748B' }}>{p.bestFor}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
