import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, Loader, AlertCircle } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import type { ProductId } from '../../data/products';

export interface AgentCall {
  id: string;
  agent: string;
  tool: string;
  input: string;
  status: 'pending' | 'running' | 'done' | 'error';
  durationMs?: number;
  delay: number;
  liveOutput?: string;
}

interface AgentCallStackProps {
  calls: AgentCall[];
  product: ProductId;
  isRunning: boolean;
}

const STATUS_ICONS = {
  pending: Clock,
  running: Loader,
  done: CheckCircle,
  error: AlertCircle,
};

const STATUS_COLORS = {
  pending: '#475569',
  running: '#FCD34D',
  done: '#34D399',
  error: '#F87171',
};

export function AgentCallStack({ calls, product, isRunning }: AgentCallStackProps) {
  const p = PRODUCTS[product];

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(15,22,36,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div
          className="w-5 h-5 rounded flex items-center justify-center shrink-0"
          style={{ background: p.color }}
        >
          <span className="text-white text-xs font-bold">{p.name.slice(0, 2)}</span>
        </div>
        <span className="text-xs font-semibold text-white">Agent Calls</span>
        {isRunning && (
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            className="ml-auto w-1.5 h-1.5 rounded-full"
            style={{ background: p.colorLight }}
          />
        )}
        {calls.length > 0 && (
          <span
            className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#64748B' }}
          >
            {calls.filter(c => c.status === 'done').length}/{calls.length}
          </span>
        )}
      </div>

      {/* Call list */}
      <div className="max-h-64 overflow-y-auto">
        {calls.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-xs" style={{ color: '#334155' }}>
              {isRunning ? 'Initializing agents...' : 'Run agent to see tool calls'}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {calls.map((call) => {
              const StatusIcon = STATUS_ICONS[call.status];
              return (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.25 }}
                  className="px-3 py-2.5 border-b"
                  style={{ borderColor: 'rgba(255,255,255,0.04)' }}
                >
                  {/* Agent name + status */}
                  <div className="flex items-center gap-2 mb-1">
                    <motion.div
                      animate={call.status === 'running' ? { rotate: 360 } : {}}
                      transition={call.status === 'running' ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
                    >
                      <StatusIcon size={11} color={STATUS_COLORS[call.status]} />
                    </motion.div>
                    <span className="text-xs font-semibold" style={{ color: p.colorLight }}>
                      {call.agent}
                    </span>
                    <span
                      className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded"
                      style={{ background: `${p.color}22`, color: p.colorLight, fontSize: '10px' }}
                    >
                      {call.tool}
                    </span>
                  </div>

                  {/* Input preview */}
                  <p
                    className="text-xs leading-relaxed truncate"
                    style={{ color: '#475569', fontFamily: 'ui-monospace, monospace', fontSize: '11px' }}
                  >
                    {call.input}
                  </p>

                  {/* Live output while running */}
                  {call.status === 'running' && call.liveOutput && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs mt-1 truncate"
                      style={{ color: p.colorLight, fontFamily: 'ui-monospace, monospace', fontSize: '10px' }}
                    >
                      ↳ {call.liveOutput}
                    </motion.p>
                  )}

                  {/* Duration on done */}
                  {call.status === 'done' && call.durationMs !== undefined && (
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs" style={{ color: '#34D399', fontSize: '10px' }}>completed</span>
                      <span className="text-xs font-mono" style={{ color: '#334155' }}>
                        {call.durationMs}ms
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
