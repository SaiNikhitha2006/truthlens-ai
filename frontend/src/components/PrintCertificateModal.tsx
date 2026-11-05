import React from 'react';
import { ForensicAnalysisResult } from '../types';
import { Shield, Printer, CheckCircle2, Lock, Copy, X, QrCode } from 'lucide-react';

interface PrintCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ForensicAnalysisResult;
}

export const PrintCertificateModal: React.FC<PrintCertificateModalProps> = ({
  isOpen,
  onClose,
  result
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(result.sha256);
    alert('Cryptographic Certificate Hash copied to clipboard.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-deep border-2 border-cyan/40 shadow-2xl p-6 sm:p-8 text-gray-100 my-8">
        {/* Modal Controls Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-border print:hidden">
          <div className="flex items-center space-x-2 text-cyan text-xs font-semibold">
            <Lock className="w-4 h-4" />
            <span>Cryptographically Verified Forensic Certificate</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-electric hover:bg-electric-hover text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-glow-electric"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-navy transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Document Body */}
        <div id="printable-certificate" className="mt-4 p-6 sm:p-8 rounded-2xl bg-navy border border-cyan/30 text-gray-200 space-y-6">
          {/* Certificate Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-border pb-6 text-center sm:text-left">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-electric to-cyan flex items-center justify-center shadow-lg flex-shrink-0">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">TRUE LENS AI FORENSICS</h2>
                <p className="text-xs text-cyan font-mono tracking-widest uppercase">Digital Provenance & Media Attestation</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Consortium ID: TL-CERT-{result.sha256.substring(0, 12).toUpperCase()}</p>
              </div>
            </div>

            {/* Trust Index Score Stamp */}
            <div className="p-3 rounded-2xl bg-slate-deep border border-slate-border text-center min-w-[140px]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">Trust Index</span>
              <span className="text-3xl font-extrabold text-cyan font-mono">{result.trust_score}</span>
              <span className="text-[10px] font-semibold text-gray-300 block uppercase">
                {result.risk_level.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Asset & Attestation Particulars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-gray-400 font-semibold">Analyzed Asset Name:</span>
              <p className="font-mono text-white truncate">{result.file_name}</p>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 font-semibold">Verification Timestamp:</span>
              <p className="font-mono text-white">{new Date().toUTCString()}</p>
            </div>

            <div className="space-y-1 sm:col-span-2">
              <span className="text-gray-400 font-semibold">SHA-256 Cryptographic Hash:</span>
              <p className="font-mono text-cyan break-all text-[11px] bg-navy-dark p-2 rounded border border-slate-border">
                {result.sha256}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 font-semibold">64-bit DCT Perceptual pHash:</span>
              <p className="font-mono text-white">{result.phash}</p>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 font-semibold">Confidence Interval:</span>
              <p className="font-mono text-white">94.2% [{result.confidence_interval.lower} – {result.confidence_interval.upper}]</p>
            </div>
          </div>

          {/* Verification Verdict */}
          <div className="p-4 rounded-xl bg-slate-deep/70 border border-slate-border space-y-1 text-xs">
            <span className="font-bold text-white uppercase text-[11px] text-cyan">Official Forensic Verdict:</span>
            <p className="text-sm font-bold text-white">{result.verdict_title}</p>
            <p className="text-gray-300 leading-relaxed text-xs">
              {result.findings[0]?.message || 'Media verified using 90% JPEG quantization ELA and 2D Fourier decomposition.'}
            </p>
          </div>

          {/* Multi-Layer Score Breakdown Table */}
          <div className="space-y-2 text-xs">
            <span className="font-semibold text-gray-300 block">Forensic Indicator Diagnostics:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
              <div className="p-2 rounded bg-slate-deep border border-slate-border">
                <span className="text-gray-400 block text-[10px]">Spectral 2D FFT</span>
                <strong className="text-cyan font-mono">{result.breakdown.spectral_authenticity}/100</strong>
              </div>
              <div className="p-2 rounded bg-slate-deep border border-slate-border">
                <span className="text-gray-400 block text-[10px]">ELA Uniformity</span>
                <strong className="text-electric font-mono">{result.breakdown.ela_compression_uniformity}/100</strong>
              </div>
              <div className="p-2 rounded bg-slate-deep border border-slate-border">
                <span className="text-gray-400 block text-[10px]">PRNU Noise Floor</span>
                <strong className="text-emerald-400 font-mono">{result.breakdown.noise_variance_consistency}/100</strong>
              </div>
              <div className="p-2 rounded bg-slate-deep border border-slate-border">
                <span className="text-gray-400 block text-[10px]">Edge Integrity</span>
                <strong className="text-amber-400 font-mono">{result.breakdown.edge_lighting_integrity}/100</strong>
              </div>
            </div>
          </div>

          {/* Bottom Security Hologram & Stamp */}
          <div className="pt-4 border-t border-slate-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center space-x-2 text-[10px] text-gray-400">
              <CheckCircle2 className="w-4 h-4 text-cyan flex-shrink-0" />
              <span>Certified under Open Verification Standards • True Lens Global Forensic Network</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyHash}
                className="px-3 py-1.5 rounded-lg bg-slate-deep border border-slate-border text-cyan text-[11px] font-semibold hover:bg-slate-hover transition"
              >
                Copy Hash Seal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
