import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { ForecastPoint } from '../../data/scenarios';

interface DemandForecastChartProps {
  data: ForecastPoint[];
  product?: 'openclaw' | 'nemoclaw';
}

export function DemandForecastChart({ data, product = 'openclaw' }: DemandForecastChartProps) {
  const color = product === 'openclaw' ? '#60A5FA' : '#34D399';
  const splitIndex = data.findIndex(d => d.actual === undefined);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={`bandGrad-${product}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
        <YAxis tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8, fontSize: 11 }}
          labelStyle={{ color: '#64748B' }}
          itemStyle={{ color: color }}
        />
        {splitIndex > 0 && (
          <ReferenceLine
            x={data[splitIndex]?.time}
            stroke="rgba(255,255,255,0.15)"
            strokeDasharray="4 4"
            label={{ value: 'Forecast →', fill: '#475569', fontSize: 10, position: 'top' }}
          />
        )}
        <Area
          type="monotone"
          dataKey="upper"
          stroke="none"
          fill={`url(#bandGrad-${product})`}
          isAnimationActive={false}
        />
        <Area
          type="monotone"
          dataKey="lower"
          stroke="none"
          fill="transparent"
          isAnimationActive={false}
        />
        <Line
          type="monotone"
          dataKey="actual"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
          name="Actual"
        />
        <Line
          type="monotone"
          dataKey="predicted"
          stroke={color}
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={false}
          isAnimationActive={false}
          name="Predicted"
          opacity={0.7}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
