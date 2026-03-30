import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Legend } from 'recharts';
import { PRODUCTS } from '../../data/products';

export function CapabilityRadarChart() {
  const capabilities = PRODUCTS.openclaw.capabilities.map((cap, i) => ({
    subject: cap.name,
    OpenClaw: cap.score,
    NemoClaw: PRODUCTS.nemoclaw.capabilities[i].score,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={capabilities}>
        <PolarGrid stroke="rgba(255,255,255,0.08)" />
        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748B', fontSize: 11 }} />
        <Radar
          name="OpenClaw"
          dataKey="OpenClaw"
          stroke="#2563EB"
          fill="#2563EB"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Radar
          name="NemoClaw"
          dataKey="NemoClaw"
          stroke="#059669"
          fill="#059669"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Legend
          wrapperStyle={{ fontSize: 12 }}
          formatter={(v) => <span style={{ color: v === 'OpenClaw' ? '#60A5FA' : '#34D399' }}>{v}</span>}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
