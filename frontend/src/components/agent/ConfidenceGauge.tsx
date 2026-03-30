import { motion } from 'framer-motion';

interface ConfidenceGaugeProps {
  value: number; // 0-100
  size?: number;
  product?: 'openclaw' | 'nemoclaw';
}

export function ConfidenceGauge({ value, size = 120, product = 'openclaw' }: ConfidenceGaugeProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (value / 100) * circumference;
  const color = product === 'openclaw' ? '#2563EB' : '#059669';
  const colorLight = product === 'openclaw' ? '#60A5FA' : '#34D399';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={8}
          />
          {/* Animated progress */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#gauge-gradient-${product})`}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - strokeDash }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id={`gauge-gradient-${product}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={colorLight} />
            </linearGradient>
          </defs>
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-2xl font-bold"
            style={{ color: colorLight }}
            animate={{ opacity: 1 }}
          >
            {value.toFixed(1)}
          </motion.span>
          <span className="text-xs" style={{ color: '#475569' }}>%</span>
        </div>
      </div>
      <span className="text-xs font-medium" style={{ color: '#64748B' }}>Confidence</span>
    </div>
  );
}
