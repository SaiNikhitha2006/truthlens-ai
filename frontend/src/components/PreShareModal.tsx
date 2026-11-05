import React, { useState } from 'react';
import { AlertOctagon, ShieldAlert, Check, X, Share2, Copy, ExternalLink } from 'lucide-react';
import { RiskLevel } from '../types';

interface PreShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  trustScore: number;
  riskLevel: RiskLevel;
  sha256: string;
  thumbnailUrl?: string;
  shareableUrl: string;
}

export const PreShareModal: React.FC<PreShareModalProps> = ({
  isOpen,
  onClose,
  title,
  trustScore,
  riskLevel,
  sha256,
  thumbnailUrl,
  shareableUrl
}) => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isHighRisk = riskLevel === 'HIGH_RISK_MANIPULATED' || riskLevel === 'AI_GENERATED';

  const fullShareUrl = window.location.origin + shareableUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullShareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-deep border-2 border-red-500/50 shadow-glow-danger p-6 text-gray-100 overflow-hidden">
        {/* Warning Accent Banner */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-pink-600 to-amber-500" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800">
                  Pre-Share Intercept
                </span>
                <span className="text-xs text-gray-400">Mechanism 4-D</span>
              </div>
              <h3 className="text-lg font-bold text-white mt-1">Caution: Flagged Media Intercept</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-navy/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Asset Brief */}
        <div className="p-3 rounded-xl bg-navy/80 border border-slate-border flex items-center space-x-3 my-3">
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt="Asset Thumbnail"
              className="w-14 h-14 rounded-lg object-cover border border-slate-border flex-shrink-0"
            />
          )}
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-white truncate">{title || 'Inspected Media Asset'}</h4>
            <div className="flex items-center space-x-2 mt-1 text-xs">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isHighRisk ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {riskLevel.replace(/_/g, ' ')}
              </span>
              <span className="text-gray-400 font-mono">Trust Score: {trustScore}/100</span>
            </div>
            <p className="text-[10px] font-mono text-gray-500 truncate mt-1">
              SHA: {sha256}
            </p>
          </div>
        </div>

        {/* Advisory Body */}
        <div className="space-y-3 text-xs text-gray-300 leading-relaxed my-4">
          <p className="p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-200">
            <strong>Viral Friction Warning:</strong> Circulating synthetic or tampered assets without contextual verification fuels social panic, financial fraud, or defamation.
          </p>

          <p>
            If you proceed to share, a mandatory <strong>True Lens Verification Seal</strong> and forensic dossier link will be appended to the asset URL to alert downstream recipients.
          </p>
        </div>

        {/* Explicit User Acknowledgement Checkbox */}
        <label className="flex items-start space-x-3 p-3 rounded-xl bg-navy/70 border border-slate-border cursor-pointer select-none mb-5 hover:bg-navy transition">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-electric focus:ring-0 focus:ring-offset-0 bg-slate-deep border-slate-border accent-electric cursor-pointer"
          />
          <span className="text-xs text-gray-200 leading-normal">
            I explicitly acknowledge that this image contains <strong>verified digital anomalies or synthetic artifacts</strong>, and I am sharing exclusively for educational debriefing, fact-checking, or warning purposes.
          </span>
        </label>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-border/80">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-navy/80 transition"
          >
            Cancel & Do Not Circulate
          </button>

          <button
            disabled={!acknowledged}
            onClick={handleCopyLink}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition shadow-md ${
              acknowledged
                ? 'bg-gradient-to-r from-electric to-cyan text-white hover:brightness-110 cursor-pointer'
                : 'bg-slate-border text-gray-500 cursor-not-allowed'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Verification Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Proceed with Warning Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
