import React from 'react';
import { SpectralResult } from '../types';
import { Activity, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface SpectralVisualizerProps {
  spectral: SpectralResult;
}

export const SpectralVisualizer: React.FC<SpectralVisualizerProps> = ({ spectral }) => {
  return (
    <div className="flex flex-col rounded-2xl bg-slate-deep/70 border border-slate-border p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-border/80">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-cyan" />
          <h3 className="text-base font-semibold text-white">2D FFT Spectral & GAN Deconvolution Analysis</h3>
        </div>
        <div className="flex items-center space-x-2">
          {spectral.is_synthetic_signature ? (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-500/15 border border-pink-500/40 text-pink-400 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Synthetic Spectral Artifacts</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Natural 1/f Optical Curve</span>
            </span>
          )}
        </div>
      </div>

      {/* Numerical Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-navy/60 border border-slate-border/60">
          <span className="text-[11px] text-gray-400 block font-medium">High/Low Energy Ratio</span>
          <span className="text-lg font-bold text-white font-mono">{spectral.high_low_ratio}</span>
          <span className="text-[10px] text-gray-400 block mt-0.5">Threshold &gt; 0.42</span>
        </div>

        <div className="p-3 rounded-xl bg-navy/60 border border-slate-border/60">
          <span className="text-[11px] text-gray-400 block font-medium">Periodic Spikes</span>
          <span className={`text-lg font-bold font-mono ${spectral.peak_artifact_count >= 8 ? 'text-pink-400' : 'text-white'}`}>
            {spectral.peak_artifact_count}
          </span>
          <span className="text-[10px] text-gray-400 block mt-0.5">Checkerboard grid peaks</span>
        </div>

        <div className="p-3 rounded-xl bg-navy/60 border border-slate-border/60">
          <span className="text-[11px] text-gray-400 block font-medium">High Energy %</span>
          <span className="text-lg font-bold text-cyan font-mono">{spectral.high_energy_pct}%</span>
          <span className="text-[10px] text-gray-400 block mt-0.5">Outer Nyquist band</span>
        </div>

        <div className="p-3 rounded-xl bg-navy/60 border border-slate-border/60">
          <span className="text-[11px] text-gray-400 block font-medium">Decay Tail Slope</span>
          <span className="text-lg font-bold text-white font-mono">{spectral.spectral_tail_slope}</span>
          <span className="text-[10px] text-gray-400 block mt-0.5">Organic slope &lt; -0.18</span>
        </div>
      </div>

      {/* Visual Map and Recharts Azimuthal Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {/* 2D FFT Magnitude Spectrum Map */}
        <div className="space-y-1.5">
          <span className="text-xs text-gray-400 font-medium">2D Fourier Magnitude Heatmap (Inferno):</span>
          <div className="rounded-xl overflow-hidden bg-navy-dark border border-slate-border h-64 flex items-center justify-center relative">
            {spectral.spectrum_image_base64 ? (
              <img
                src={spectral.spectrum_image_base64}
                alt="2D FFT Spectrum"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-gray-500 text-xs">Spectrum unavailable</div>
            )}
            <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-cyan border border-cyan/20">
              Shifted 2D DFT (512x512)
            </div>
          </div>
        </div>

        {/* 1D Azimuthal Radial Profile Chart */}
        <div className="space-y-1.5">
          <span className="text-xs text-gray-400 font-medium">Azimuthal Radial Power Profile:</span>
          <div className="rounded-xl bg-navy-dark border border-slate-border h-64 p-2 flex flex-col justify-between">
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spectral.radial_distribution} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2541" />
                  <XAxis dataKey="frequency" stroke="#64748b" fontSize={10} unit="%" />
                  <YAxis stroke="#64748b" fontSize={10} domain={['auto', 'auto']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0b132b', borderColor: '#2a3b60', borderRadius: '8px', fontSize: '11px' }}
                    labelStyle={{ color: '#4cc9f0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="amplitude"
                    stroke="#4cc9f0"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#3a86ff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="text-[10px] text-gray-400 text-center pb-1">
              Radial distance from DC Center (Low Frequencies) to Nyquist Limit (High Frequencies)
            </div>
          </div>
        </div>
      </div>

      {/* Synthetic Artifact Indications */}
      <div className="p-4 rounded-xl bg-navy/80 border border-slate-border/70 space-y-2">
        <span className="text-xs font-semibold text-gray-300 block">Spectral Diagnostic Findings:</span>
        <ul className="space-y-1.5">
          {spectral.ai_indicators.map((ind, idx) => (
            <li key={idx} className="text-xs text-gray-300 flex items-start space-x-2">
              <span className="text-cyan mt-0.5">•</span>
              <span className="leading-relaxed">{ind}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
