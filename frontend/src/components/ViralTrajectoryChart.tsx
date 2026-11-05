import React from 'react';
import { Flame, ShieldCheck, TrendingDown } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ViralTrajectoryChartProps {
  velocityScore?: number;
  duplicateCount?: number;
}

export const ViralTrajectoryChart: React.FC<ViralTrajectoryChartProps> = ({
  velocityScore = 88,
  duplicateCount = 48
}) => {
  // Generate 24-hour projection curve
  const data = Array.from({ length: 9 }, (_, idx) => {
    const hour = idx * 3;
    // Exponential baseline
    const unmitigated = Math.round(500 * Math.exp(0.32 * hour));
    // Flattened curve with True Lens friction
    const mitigated = Math.round(500 * Math.exp(0.11 * hour));
    return {
      hour: `${hour}h`,
      unmitigated,
      mitigated,
      prevented: Math.max(0, unmitigated - mitigated)
    };
  });

  const totalPrevented = data[data.length - 1].prevented;

  return (
    <div className="p-5 rounded-2xl bg-slate-deep/75 border border-slate-border space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-border/80">
        <div className="flex items-center space-x-2">
          <TrendingDown className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-semibold text-white">Viral Velocity Dissemination Model</h3>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span className="text-gray-400">Unmitigated Spread</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan" />
            <span className="text-gray-400">True Lens Intercept</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-xl bg-navy/70 border border-slate-border">
          <span className="text-gray-400 block">Viral Velocity Score</span>
          <span className="text-xl font-bold text-amber-400 font-mono mt-0.5">{velocityScore}/100</span>
          <span className="text-[10px] text-gray-400 block">Clustered growth coefficient</span>
        </div>

        <div className="p-3 rounded-xl bg-navy/70 border border-slate-border">
          <span className="text-gray-400 block">24h Interceptions Prevented</span>
          <span className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
            ~{totalPrevented.toLocaleString()}
          </span>
          <span className="text-[10px] text-gray-400 block">Projected impressions dampened</span>
        </div>

        <div className="p-3 rounded-xl bg-navy/70 border border-slate-border">
          <span className="text-gray-400 block">Friction Containment Rate</span>
          <span className="text-xl font-bold text-cyan font-mono mt-0.5">78.4%</span>
          <span className="text-[10px] text-gray-400 block">Pre-share modal cancellation rate</span>
        </div>
      </div>

      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="unmitigatedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="mitigatedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4cc9f0" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="#4cc9f0" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1c2541" />
            <XAxis dataKey="hour" stroke="#64748b" fontSize={11} />
            <YAxis stroke="#64748b" fontSize={11} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0b132b', borderColor: '#2a3b60', borderRadius: '10px', fontSize: '11px' }}
              labelStyle={{ color: '#4cc9f0' }}
            />
            <Area
              type="monotone"
              dataKey="unmitigated"
              name="Unmitigated Reach"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#unmitigatedGrad)"
            />
            <Area
              type="monotone"
              dataKey="mitigated"
              name="With True Lens Friction"
              stroke="#4cc9f0"
              fillOpacity={1}
              fill="url(#mitigatedGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
