import React from 'react';
import { CopyMoveResult } from '../types';
import { Scissors, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface CopyMoveVisualizerProps {
  data?: CopyMoveResult;
}

export const CopyMoveVisualizer: React.FC<CopyMoveVisualizerProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="flex flex-col rounded-2xl bg-slate-deep/70 border border-slate-border p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-border/80">
        <div className="flex items-center space-x-2">
          <Scissors className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-semibold text-white">Copy-Move Forgery & Region Cloning Detector</h3>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1 ${
            data.detected
              ? 'bg-red-500/15 border-red-500/40 text-red-400'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
          }`}
        >
          {data.detected ? <AlertTriangle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          <span>{data.detected ? 'Cloned Regions Identified' : 'No Cloning Detected'}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Visual Map */}
        <div className="space-y-1.5">
          <span className="text-xs text-gray-400 font-medium">ORB Keypoint Displacement Map:</span>
          <div className="h-56 rounded-xl overflow-hidden bg-navy-dark border border-slate-border flex items-center justify-center">
            {data.visual_base64 ? (
              <img
                src={data.visual_base64}
                alt="Copy Move Map"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-xs text-gray-500">Visualization unavailable</div>
            )}
          </div>
        </div>

        {/* Narrative & Metrics */}
        <div className="flex flex-col justify-between space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-navy/70 border border-slate-border">
              <span className="text-[11px] text-gray-400 block font-medium">Correlated Clusters</span>
              <span className={`text-xl font-bold font-mono ${data.detected ? 'text-red-400' : 'text-white'}`}>
                {data.cloned_cluster_count}
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">Parallel displacement vectors</span>
            </div>

            <div className="p-3 rounded-xl bg-navy/70 border border-slate-border">
              <span className="text-[11px] text-gray-400 block font-medium">Detector Confidence</span>
              <span className="text-xl font-bold text-cyan font-mono">{data.confidence_score}%</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">Spatial Euclidean separation</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-navy/80 border border-slate-border text-xs space-y-1.5 flex-1">
            <span className="font-semibold text-gray-200">Algorithmic Interpretation:</span>
            <p className="text-gray-300 leading-relaxed">{data.explanation}</p>
            <p className="text-[11px] text-gray-400 pt-1">
              Copy-move forgery occurs when part of an image is duplicated to hide an object (e.g. stamping background texture over a person) or multiply elements (e.g. crowds, weapons).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
