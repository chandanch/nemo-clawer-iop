import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
  glow?: 'openclaw' | 'nemoclaw' | 'none';
  onClick?: () => void;
}

export function Card({ children, className, glow = 'none', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'rounded-xl p-4 relative',
        glow !== 'none' && 'overflow-hidden',
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        background: 'rgba(15, 22, 36, 0.8)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        boxShadow: glow === 'openclaw'
          ? '0 0 20px rgba(37,99,235,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
          : glow === 'nemoclaw'
          ? '0 0 20px rgba(5,150,105,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
          : 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {glow !== 'none' && (
        <div
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: glow === 'openclaw'
              ? 'linear-gradient(90deg, transparent, #2563EB, transparent)'
              : 'linear-gradient(90deg, transparent, #059669, transparent)',
          }}
        />
      )}
      {children}
    </div>
  );
}

export function MetricCard({ label, value, change, unit = '', color = '#60A5FA' }: { label: string; value: string | number; change?: number; unit?: string; color?: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium mb-1" style={{ color: '#64748B' }}>{label}</p>
      <p className="text-2xl font-bold" style={{ color }}>
        {value}<span className="text-sm font-normal ml-0.5" style={{ color: '#94A3B8' }}>{unit}</span>
      </p>
      {change !== undefined && (
        <p className="text-xs mt-1" style={{ color: change >= 0 ? '#34D399' : '#F87171' }}>
          {change >= 0 ? '+' : ''}{change}% vs baseline
        </p>
      )}
    </Card>
  );
}
