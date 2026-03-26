import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, BarChart3, GitBranch, Home, Layers, Menu, X, Zap } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/simulator', label: 'Simulator', icon: Zap },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { path: '/comparison', label: 'Compare', icon: Layers },
  { path: '/pipeline', label: 'Pipeline', icon: GitBranch },
];

export function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(8,11,20,0.92)', backdropFilter: 'blur(16px)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #2563EB, #059669)' }}>
              <Activity size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-sm">PricingAI</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(37,99,235,0.2)', color: '#60A5FA', border: '1px solid rgba(37,99,235,0.3)' }}>Beta</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ color: active ? '#F1F5F9' : '#94A3B8' }}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-bg"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.08)' }}
                    />
                  )}
                  <Icon size={14} />
                  <span className="relative">{label}</span>
                </Link>
              );
            })}
          </div>

          {/* Status badge */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#34D399' }}>
              <div className="relative w-2 h-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <div className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-50" />
              </div>
              Systems Operational
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg"
            style={{ color: '#94A3B8' }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t px-4 py-3"
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(8,11,20,0.98)' }}
        >
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
              style={{ color: location.pathname === path ? '#F1F5F9' : '#94A3B8', background: location.pathname === path ? 'rgba(255,255,255,0.08)' : 'transparent' }}
            >
              <Icon size={14} />
              {label}
            </Link>
          ))}
        </motion.div>
      )}
    </nav>
  );
}
