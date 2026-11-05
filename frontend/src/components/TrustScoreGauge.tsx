import React from 'react';
import { RiskLevel } from '../types';
import { ShieldCheck, AlertCircle, AlertTriangle, Sparkles } from 'lucide-react';

interface TrustScoreGaugeProps {
  score: number;
  riskLevel: RiskLevel;
  verdictTitle: string;
  confidenceInterval?: {
    lower: number;
    upper: number;
    confidence_pct: number;
  };
}

export const TrustScoreGauge: React.FC<TrustScoreGaugeProps> = ({
  score,
  riskLevel,
  verdictTitle,
  confidenceInterval
}) => {
  // Gauge math: semi-circle from 180 deg to 0 deg
  const radius = 80;
  const strokeWidth = 14;
  const circumference = Math.PI * radius;
  const clampedScore = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  const getTheme = () => {
    switch (riskLevel) {
      case 'LOW_RISK':
        return {
          color: '#10b981',
          gradientId: 'gauge-green',
          badgeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
          label: 'Authentic Optical Media',
          icon: ShieldCheck,
          strokeClass: 'stroke-emerald-400'
        };
      case 'SUSPICIOUS':
        return {
          color: '#f59e0b',
          gradientId: 'gauge-amber',
          badgeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-400',
          label: 'Suspicious Anomalies',
          icon: AlertTriangle,
          strokeClass: 'stroke-amber-400'
        };
      case 'HIGH_RISK_MANIPULATED':
        return {
          color: '#ef4444',
          gradientId: 'gauge-red',
          badgeBg: 'bg-red-500/15 border-red-500/40 text-red-400',
          label: 'Manipulated / Spliced',
          icon: AlertCircle,
          strokeClass: 'stroke-red-400'
        };
      case 'AI_GENERATED':
        return {
          color: '#ec4899',
          gradientId: 'gauge-pink',
          badgeBg: 'bg-pink-500/15 border-pink-500/40 text-pink-400',
          label: 'Synthetic AI Media',
          icon: Sparkles,
          strokeClass: 'stroke-pink-400'
        };
      default:
        return {
          color: '#3a86ff',
          gradientId: 'gauge-blue',
          badgeBg: 'bg-electric/15 border-electric/40 text-electric',
          label: 'Uncertain',
          icon: ShieldCheck,
          strokeClass: 'stroke-electric'
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.icon;

  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-deep/70 border border-slate-border shadow-lg">
      <div className="relative w-56 h-36 flex items-center justify-center">
        <svg className="w-56 h-36 overflow-visible" viewBox="0 0 200 110">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="35%" stopColor="#ec4899" />
              <stop offset="65%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="glow" />
              <feComposite in="SourceGraphic" in2="glow" operator="over" />
            </filter>
          </defs>

          {/* Background Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#1c2541"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Gradient Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            filter="url(#glow)"
            className="transition-all duration-1000 ease-out"
          />

          {/* Needle / Value dot indicator */}
          <g transform={`rotate(${-180 + (clampedScore / 100) * 180} 100 100)`}>
            <circle cx="100" cy="20" r="6" fill="#ffffff" filter="url(#glow)" />
            <circle cx="100" cy="20" r="3" fill={theme.color} />
          </g>
        </svg>

        {/* Center Score Display */}
        <div className="absolute bottom-2 flex flex-col items-center">
          <span className="text-4xl font-extrabold text-white tracking-tight">{score}</span>
          <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest">Trust Index</span>
        </div>
      </div>

      {/* Risk Badge */}
      <div className={`mt-3 px-3 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1.5 ${theme.badgeBg}`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{theme.label}</span>
      </div>

      <h3 className="mt-2 text-sm font-semibold text-white text-center">{verdictTitle}</h3>

      {/* Confidence interval */}
      {confidenceInterval && (
        <div className="mt-3 text-[11px] text-gray-400 flex items-center space-x-2 bg-navy/60 px-3 py-1.5 rounded-lg border border-slate-border/50">
          <span>Confidence: <strong className="text-gray-200">{confidenceInterval.confidence_pct}%</strong></span>
          <span className="text-gray-500">•</span>
          <span>Range: [{confidenceInterval.lower} – {confidenceInterval.upper}]</span>
        </div>
      )}
    </div>
  );
};
