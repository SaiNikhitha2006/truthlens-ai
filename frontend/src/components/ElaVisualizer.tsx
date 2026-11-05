import React from 'react';
import { ElaResult } from '../types';
import { Layers, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ElaVisualizerProps {
  ela: ElaResult;
}

export const ElaVisualizer: React.FC<ElaVisualizerProps> = ({ ela }) => {
  const isSuspicious = ela.assessment.includes('SUSPICIOUS') || ela.anomaly_ratio_pct > 10;

  return (
    <div className="flex flex-col rounded-2xl bg-slate-deep/70 border border-slate-border p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-border/80">
        <div className="flex items-center space-x-2">
          <Layers className="w-5 h-5 text-electric" />
          <h3 className="text-base font-semibold text-white">Error Level Analysis (ELA)</h3>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
            isSuspicious
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-400'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
          }`}
        >
          {ela.assessment.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Numerical Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-navy/60 border border-slate-border/60">
          <span className="text-[11px] text-gray-400 block font-medium">Mean Error</span>
          <span className="text-lg font-bold text-white font-mono">{ela.mean_error}</span>
          <span className="text-[10px] text-gray-400 block mt-0.5">JPEG 90% scale</span>
        </div>

        <div className="p-3 rounded-xl bg-navy/60 border border-slate-border/60">
          <span className="text-[11px] text-gray-400 block font-medium">Variance Std Dev</span>
          <span className="text-lg font-bold text-white font-mono">{ela.variance_std}</span>
          <span className="text-[10px] text-gray-400 block mt-0.5">&gt; 120 spliced threshold</span>
        </div>

        <div className="p-3 rounded-xl bg-navy/60 border border-slate-border/60">
          <span className="text-[11px] text-gray-400 block font-medium">Anomaly Ratio</span>
          <span className="text-lg font-bold text-cyan font-mono">{ela.anomaly_ratio_pct}%</span>
          <span className="text-[10px] text-gray-400 block mt-0.5">High-delta blocks</span>
        </div>

        <div className="p-3 rounded-xl bg-navy/60 border border-slate-border/60">
          <span className="text-[11px] text-gray-400 block font-medium">Peak Delta</span>
          <span className="text-lg font-bold text-white font-mono">{ela.peak_error} / 255</span>
          <span className="text-[10px] text-gray-400 block mt-0.5">Maximum channel diff</span>
        </div>
      </div>

      {/* Detailed Forensic Explanation */}
      <div className="p-4 rounded-xl bg-navy/80 border border-slate-border/70 flex items-start space-x-3">
        {isSuspicious ? (
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        ) : (
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        )}
        <div className="space-y-1 text-xs">
          <span className="font-semibold text-gray-200">Quantization Diagnostic:</span>
          <p className="text-gray-300 leading-relaxed">{ela.explanation}</p>
        </div>
      </div>

      {/* Visual Previews Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="space-y-1.5">
          <span className="text-xs text-gray-400 font-medium">Turbo Colormap Heatmap:</span>
          <div className="rounded-xl overflow-hidden bg-navy-dark border border-slate-border h-48 flex items-center justify-center">
            {ela.heatmap_image_base64 ? (
              <img src={ela.heatmap_image_base64} alt="ELA Turbo Heatmap" className="w-full h-full object-contain" />
            ) : (
              <div className="text-gray-500 text-xs">Heatmap unavailable</div>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs text-gray-400 font-medium">Spatial Blend Overlay:</span>
          <div className="rounded-xl overflow-hidden bg-navy-dark border border-slate-border h-48 flex items-center justify-center">
            {ela.blended_image_base64 ? (
              <img src={ela.blended_image_base64} alt="ELA Spatial Blend" className="w-full h-full object-contain" />
            ) : (
              <div className="text-gray-500 text-xs">Blend unavailable</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
