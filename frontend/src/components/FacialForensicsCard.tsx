import React from 'react';
import { FacialForensicsResult } from '../types';
import { Sparkles, AlertCircle, CheckCircle2, UserCheck, Eye, ScanLine } from 'lucide-react';

interface FacialForensicsCardProps {
  data?: FacialForensicsResult;
}

export const FacialForensicsCard: React.FC<FacialForensicsCardProps> = ({ data }) => {
  if (!data) return null;

  const isAnomalous = data.face_detected && (data.boundary_seam_score < 60 || data.symmetry_score < 60);

  return (
    <div className="flex flex-col rounded-2xl bg-slate-deep/70 border border-slate-border p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-border/80">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-5 h-5 text-pink-400" />
          <h3 className="text-base font-semibold text-white">Facial Boundary & Deepfake Landmark Forensics</h3>
        </div>

        {data.face_detected ? (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center space-x-1 ${
            isAnomalous
              ? 'bg-red-500/15 border-red-500/40 text-red-400'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
          }`}>
            {isAnomalous ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{isAnomalous ? 'Facial Seam Tampering Detected' : 'Natural Facial Coherence'}</span>
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-500/15 border border-slate-border text-gray-400">
            No Prominent Face Detected
          </span>
        )}
      </div>

      {data.face_detected ? (
        <div className="space-y-4">
          {/* Metrics meters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-navy/70 border border-slate-border/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-gray-300 flex items-center space-x-1.5">
                  <ScanLine className="w-3.5 h-3.5 text-cyan" />
                  <span>Jawline Boundary Seam Integrity</span>
                </span>
                <span className={`font-mono font-bold ${data.boundary_seam_score < 60 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {data.boundary_seam_score}/100
                </span>
              </div>
              <div className="w-full bg-navy rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${
                    data.boundary_seam_score < 60 ? 'bg-red-500' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${data.boundary_seam_score}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400 block">
                Evaluates micro-gradient transition and Poisson feathering around face perimeter
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-navy/70 border border-slate-border/70 space-y-2">
              <div className="flex items-center justify-between text-xs font-medium">
                <span className="text-gray-300 flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5 text-pink-400" />
                  <span>Iris & Highlight Symmetry Index</span>
                </span>
                <span className={`font-mono font-bold ${data.symmetry_score < 60 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {data.symmetry_score}/100
                </span>
              </div>
              <div className="w-full bg-navy rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${
                    data.symmetry_score < 60 ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${data.symmetry_score}%` }}
                />
              </div>
              <span className="text-[10px] text-gray-400 block">
                Detects unnatural hyper-symmetry typical of StyleGAN and Diffusion portraits
              </span>
            </div>
          </div>

          {/* Visual Crops */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {data.face_roi_base64 && (
              <div className="space-y-1.5">
                <span className="text-xs text-gray-400 font-medium">Extracted Facial ROI:</span>
                <div className="h-44 rounded-xl overflow-hidden bg-navy-dark border border-slate-border flex items-center justify-center">
                  <img
                    src={data.face_roi_base64}
                    alt="Facial ROI"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {data.annotated_preview_base64 && (
              <div className="space-y-1.5">
                <span className="text-xs text-gray-400 font-medium">Skin Segmentation & Contour Map:</span>
                <div className="h-44 rounded-xl overflow-hidden bg-navy-dark border border-slate-border flex items-center justify-center">
                  <img
                    src={data.annotated_preview_base64}
                    alt="Annotated Contour Map"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Findings */}
          <div className="p-3.5 rounded-xl bg-navy/80 border border-slate-border/80 text-xs space-y-1.5">
            <span className="font-semibold text-gray-200">Facial Diagnostic Notes:</span>
            <ul className="space-y-1 text-gray-300">
              {data.findings.map((f, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-pink-400">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-6 rounded-xl bg-navy/40 border border-slate-border/60 text-xs text-gray-400 text-center">
          No human faces identified in this asset. Facial boundary and eye reflection diagnostics are automatically bypassed for non-portrait scenery or documents.
        </div>
      )}
    </div>
  );
};
