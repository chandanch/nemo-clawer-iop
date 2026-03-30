import { clsx } from 'clsx';

type BadgeVariant = 'openclaw' | 'nemoclaw' | 'success' | 'warning' | 'danger' | 'neutral' | 'analysis';

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
  openclaw: { bg: 'rgba(37,99,235,0.15)', text: '#60A5FA', border: 'rgba(37,99,235,0.3)' },
  nemoclaw: { bg: 'rgba(5,150,105,0.15)', text: '#34D399', border: 'rgba(5,150,105,0.3)' },
  success: { bg: 'rgba(16,185,129,0.15)', text: '#34D399', border: 'rgba(16,185,129,0.3)' },
  warning: { bg: 'rgba(245,158,11,0.15)', text: '#FCD34D', border: 'rgba(245,158,11,0.3)' },
  danger: { bg: 'rgba(239,68,68,0.15)', text: '#F87171', border: 'rgba(239,68,68,0.3)' },
  neutral: { bg: 'rgba(255,255,255,0.08)', text: '#94A3B8', border: 'rgba(255,255,255,0.12)' },
  analysis: { bg: 'rgba(139,92,246,0.15)', text: '#C4B5FD', border: 'rgba(139,92,246,0.3)' },
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export function Badge({ children, variant = 'neutral', size = 'sm', pulse = false }: BadgeProps) {
  const s = VARIANT_STYLES[variant];
  return (
    <span
      className={clsx('inline-flex items-center gap-1.5 font-medium rounded-full', size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm')}
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}` }}
    >
      {pulse && (
        <span className="relative flex w-1.5 h-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: s.text }} />
          <span className="relative inline-flex rounded-full w-1.5 h-1.5" style={{ background: s.text }} />
        </span>
      )}
      {children}
    </span>
  );
}
