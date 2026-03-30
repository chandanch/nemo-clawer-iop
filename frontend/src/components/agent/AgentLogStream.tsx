import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
interface LogEntry {
  delay: number;
  level: 'info' | 'warn' | 'success' | 'analysis' | 'debug';
  message: string;
}
import { clsx } from 'clsx';

const LEVEL_COLORS: Record<string, string> = {
  info: '#64748B',
  warn: '#F59E0B',
  success: '#34D399',
  analysis: '#818CF8',
  debug: '#334155',
};

const LEVEL_PREFIX: Record<string, string> = {
  info: 'INFO  ',
  warn: 'WARN  ',
  success: '✓ OK  ',
  analysis: 'ANLYS ',
  debug: 'DEBUG ',
};

interface AgentLogStreamProps {
  logs: LogEntry[];
  isRunning: boolean;
}

export function AgentLogStream({ logs, isRunning }: AgentLogStreamProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll only within the log container, never the page
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [logs.length]);

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: '#060910', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70" />
          </div>
          <span className="text-xs font-mono ml-1" style={{ color: '#475569' }}>agent.log</span>
        </div>
        {isRunning && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#34D399' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      {/* Log content */}
      <div ref={scrollContainerRef} className="h-64 overflow-y-auto p-3 space-y-0.5">
        {logs.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs font-mono" style={{ color: '#1E293B' }}>Waiting for agent initialization...</p>
          </div>
        )}
        <AnimatePresence>
          {logs.map((log, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className={clsx('log-entry flex gap-2 py-0.5', i === logs.length - 1 && 'animate-pulse')}
            >
              <span style={{ color: '#1E293B', flexShrink: 0 }}>{LEVEL_PREFIX[log.level]}</span>
              <span style={{ color: LEVEL_COLORS[log.level] || '#64748B' }}>{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
