import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { PricePoint } from '../../data/scenarios';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg p-3 text-xs" style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.12)' }}>
      <p className="font-mono mb-2" style={{ color: '#64748B' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: '#94A3B8' }}>{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>${p.value.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

interface PriceHistoryChartProps {
  data: PricePoint[];
  product?: 'openclaw' | 'nemoclaw';
}

export function PriceHistoryChart({ data, product = 'openclaw' }: PriceHistoryChartProps) {
  const primaryColor = product === 'openclaw' ? '#2563EB' : '#059669';
  const primaryLight = product === 'openclaw' ? '#60A5FA' : '#34D399';

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`priceGrad-${product}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
            <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
          </linearGradient>
          <linearGradient id={`compGrad-${product}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval={3} />
        <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 11, color: '#64748B' }}
          formatter={(v) => <span style={{ color: '#94A3B8' }}>{v}</span>}
        />
        <Area
          type="monotone"
          dataKey="price"
          name="Our Price"
          stroke={primaryLight}
          strokeWidth={2}
          fill={`url(#priceGrad-${product})`}
          dot={false}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="competitor"
          name="Competitor"
          stroke="#F59E0B"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          fill={`url(#compGrad-${product})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
