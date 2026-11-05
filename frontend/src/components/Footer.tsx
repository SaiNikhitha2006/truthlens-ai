import React from 'react';
import { Shield, Lock, FileCode, CheckCircle2, AlertTriangle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-slate-border bg-navy-dark py-12 px-4 sm:px-6 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Purpose */}
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-electric flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">True Lens AI</span>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Autonomous multi-spectral digital forensics and decentralized community governance to neutralize synthetic media, deepfakes, and viral manipulation.
          </p>
          <div className="flex items-center space-x-2 text-[11px] text-gray-400">
            <Lock className="w-3.5 h-3.5 text-cyan" />
            <span>SHA-256 + 64-bit DCT pHash Verified</span>
          </div>
        </div>

        {/* Five Reduction Mechanisms */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Five Mitigation Pillars</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan flex-shrink-0" />
              <span>A. Global Fingerprint Database</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan flex-shrink-0" />
              <span>B. Cross-Platform Reporting Flow</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan flex-shrink-0" />
              <span>C. Platform Partner Integration API</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan flex-shrink-0" />
              <span>D. Global Alerts & Pre-Share Intercept</span>
            </li>
            <li className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan flex-shrink-0" />
              <span>E. Community Governance & Velocity</span>
            </li>
          </ul>
        </div>

        {/* Forensics Engines */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Forensic Technologies</h4>
          <ul className="space-y-1.5 text-xs text-gray-400">
            <li>• Error Level Analysis (90% Q-Matrix)</li>
            <li>• 2D Fast Fourier Spectral Decomposition</li>
            <li>• PRNU Sensor Noise Quadrant Variance</li>
            <li>• Laplacian Micro-Edge Coherence</li>
            <li>• Cryptographic Hamming Clustered Triage</li>
          </ul>
        </div>

        {/* Partner Governance Disclaimer */}
        <div className="space-y-3 p-4 rounded-xl bg-slate-deep/40 border border-slate-border/60">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Bilateral API Disclaimer</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            True Lens AI operates via cryptographic trust federation. Unpartnered external platforms cannot be forcibly altered without bilateral content-labeling APIs and mutual agreement protocols.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-border/50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400">
        <p>© 2026 True Lens AI Forensic Consortium. Open standard digital verification.</p>
        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <span className="hover:text-cyan cursor-pointer">Forensic Whitepaper</span>
          <span className="hover:text-cyan cursor-pointer">API Agreement v1.0</span>
          <span className="hover:text-cyan cursor-pointer">Transparency Matrix</span>
        </div>
      </div>
    </footer>
  );
};
