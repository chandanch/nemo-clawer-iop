import { motion } from 'framer-motion';
import { Activity, ArrowUpRight, BarChart2, Clock, DollarSign, Target, TrendingUp, Zap } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import { Link } from 'react-router-dom';
import { SCENARIOS } from '../data/scenarios';

// Generate mock dashboard data
const SPARKLINE_DATA = Array.from({ length: 20 }, (_, i) => ({
  t: i,
  openclaw: 44 + Math.sin(i * 0.5) * 3 + Math.random() * 2,
  nemoclaw: 46 + Math.cos(i * 0.4) * 2 + Math.random() * 2,
}));

const REVENUE_DATA = [
  { day: 'Mon', lift: 6.2 },
  { day: 'Tue', lift: 8.1 },
  { day: 'Wed', lift: 11.4 },
  { day: 'Thu', lift: 9.8 },
  { day: 'Fri', lift: 14.2 },
  { day: 'Sat', lift: 18.7 },
  { day: 'Sun', lift: 22.1 },
];

const KPIS = [
  { label: 'Revenue Lift Today', value: '+18.7%', sub: 'vs baseline pricing', icon: TrendingUp, color: '#34D399', bg: 'rgba(5,150,105,0.12)' },
  { label: 'Optimal Price (Avg)', value: '$44.99', sub: 'across 1,284 SKUs', icon: DollarSign, color: '#60A5FA', bg: 'rgba(37,99,235,0.12)' },
  { label: 'Price Changes (24h)', value: '2,847', sub: 'automated adjustments', icon: Zap, color: '#FCD34D', bg: 'rgba(245,158,11,0.12)' },
  { label: 'Forecast Accuracy', value: '94.7%', sub: '30-day rolling avg', icon: Target, color: '#C4B5FD', bg: 'rgba(139,92,246,0.12)' },
  { label: 'Agent Uptime', value: '99.98%', sub: 'last 30 days', icon: Activity, color: '#34D399', bg: 'rgba(5,150,105,0.12)' },
  { label: 'Avg Decision Time', value: '87ms', sub: 'OpenClaw median', icon: Clock, color: '#F87171', bg: 'rgba(239,68,68,0.12)' },
];

function KpiCard({ kpi, delay }: { kpi: typeof KPIS[0]; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl p-5"
      style={{ background: 'rgba(15,22,36,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: kpi.bg }}>
          <kpi.icon size={16} style={{ color: kpi.color }} />
        </div>
        <ArrowUpRight size={14} style={{ color: '#334155' }} />
      </div>
      <div className="text-2xl font-bold mb-0.5" style={{ color: kpi.color }}>{kpi.value}</div>
      <div className="text-sm font-medium text-white mb-0.5">{kpi.label}</div>
      <div className="text-xs" style={{ color: '#475569' }}>{kpi.sub}</div>
    </motion.div>
  );
}

export function Dashboard() {
  return (
    <div className="min-h-screen pt-16" style={{ background: '#080B14' }}>
      <div className="fixed inset-0 grid-bg opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Mission Control</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Live pricing intelligence overview</p>
          </div>
          <div className="flex items-center gap-2 text-sm" style={{ color: '#34D399' }}>
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full w-2 h-2 bg-emerald-400" />
            </span>
            Live — Last updated now
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {KPIS.map((kpi, i) => (
            <KpiCard key={kpi.label} kpi={kpi} delay={i * 0.06} />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Price trend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl p-5"
            style={{ background: 'rgba(15,22,36,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Price Optimization Trend</h3>
              <div className="flex gap-3 text-xs" style={{ color: '#64748B' }}>
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 inline-block bg-blue-500" />OpenClaw</span>
                <span className="flex items-center gap-1"><span className="w-2 h-0.5 inline-block bg-emerald-500" />NemoClaw</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={SPARKLINE_DATA}>
                <defs>
                  <linearGradient id="ocGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ncGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip
                  contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: '#64748B' }}
                />
                <Area type="monotone" dataKey="openclaw" name="OpenClaw" stroke="#2563EB" strokeWidth={2} fill="url(#ocGrad)" dot={false} />
                <Area type="monotone" dataKey="nemoclaw" name="NemoClaw" stroke="#059669" strokeWidth={2} fill="url(#ncGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Revenue lift */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl p-5"
            style={{ background: 'rgba(15,22,36,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">Revenue Lift by Day</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={REVENUE_DATA} barSize={24}>
                <XAxis dataKey="day" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v) => [`${v}%`, 'Revenue Lift']}
                />
                <Bar dataKey="lift" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Scenarios row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-xl p-5"
          style={{ background: 'rgba(15,22,36,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">Simulation Scenarios</h3>
            <Link to="/simulator" className="text-xs flex items-center gap-1 hover:opacity-80" style={{ color: '#60A5FA' }}>
              Open Simulator <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {SCENARIOS.map(s => (
              <Link
                key={s.id}
                to="/simulator"
                className="p-3 rounded-xl block hover:opacity-80 transition-opacity"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <BarChart2 size={13} style={{ color: '#60A5FA' }} />
                  <span className="text-xs font-semibold text-white">{s.name}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>{s.description}</p>
                <div className="mt-2 text-xs" style={{ color: '#334155' }}>{s.category}</div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
