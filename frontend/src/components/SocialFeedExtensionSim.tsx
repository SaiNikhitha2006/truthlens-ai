import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, ExternalLink, Check, Eye, EyeOff, Radio } from 'lucide-react';

export const SocialFeedExtensionSim: React.FC = () => {
  const [platform, setPlatform] = useState<'twitter' | 'reddit' | 'instagram'>('twitter');
  const [warningEnabled, setWarningEnabled] = useState<boolean>(true);

  return (
    <div className="p-6 rounded-3xl bg-slate-deep/75 border border-slate-border space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-border/80">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-electric/20 text-cyan border border-cyan/30">
              In-Situ Social Intercept Simulation
            </span>
            <span className="text-xs text-gray-400">Mechanism 2-C / 2-D</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">Live Feed Warning Badge Simulator</h3>
        </div>

        {/* Platform switcher */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-navy/80 border border-slate-border">
          <button
            onClick={() => setPlatform('twitter')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              platform === 'twitter' ? 'bg-cyan text-navy-dark shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            X / Twitter
          </button>
          <button
            onClick={() => setPlatform('reddit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              platform === 'reddit' ? 'bg-cyan text-navy-dark shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Reddit
          </button>
          <button
            onClick={() => setPlatform('instagram')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              platform === 'instagram' ? 'bg-cyan text-navy-dark shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            Instagram
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-300 leading-relaxed">
        See how True Lens bilateral partner APIs and browser extensions inject cryptographic warning overlays directly over social content feeds before viral redistribution can occur:
      </p>

      {/* Simulated Social Media Card */}
      <div className="max-w-xl mx-auto rounded-2xl bg-navy border border-slate-border p-4 shadow-xl space-y-3">
        {/* Post Author Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-pink-500 to-amber-500 flex items-center justify-center font-bold text-white text-xs">
              {platform === 'twitter' ? 'DW' : platform === 'reddit' ? 'u/' : 'IG'}
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-bold text-white">
                  {platform === 'twitter' ? 'DisinfoWatch Daily' : platform === 'reddit' ? 'u/NewsSpill24' : 'viral_news_network'}
                </span>
                <span className="text-[11px] text-gray-400">
                  {platform === 'twitter' ? '@disinfo_watch' : '• 2h ago'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400">Breaking News Dispatch</p>
            </div>
          </div>

          <button
            onClick={() => setWarningEnabled(!warningEnabled)}
            className="text-[11px] text-cyan hover:underline flex items-center space-x-1"
          >
            {warningEnabled ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{warningEnabled ? 'Hide TrueLens Label' : 'Show TrueLens Label'}</span>
          </button>
        </div>

        {/* Post Content */}
        <p className="text-xs text-gray-200">
          "LEAKED: High-ranking official announces emergency measures in unreleased cabinet video footage..."
        </p>

        {/* Media Container with True Lens Warning Overlay */}
        <div className="relative rounded-xl overflow-hidden bg-navy-dark border border-slate-border aspect-video flex items-center justify-center">
          <img
            src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80"
            alt="Simulated Post Asset"
            className="w-full h-full object-cover filter contrast-105"
          />

          {/* Active In-Situ Warning Badge */}
          {warningEnabled && (
            <div className="absolute inset-0 bg-navy-dark/80 backdrop-blur-sm p-4 flex flex-col justify-between animate-fade-in border-2 border-red-500/80 m-1 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  <span>TRUE LENS VERIFICATION: HIGH RISK MANIPULATION</span>
                </div>
                <span className="text-[10px] font-mono text-cyan bg-navy/80 px-2 py-0.5 rounded border border-slate-border">
                  Trust Index: 12/100
                </span>
              </div>

              <div className="space-y-1 text-center py-2">
                <h4 className="text-xs font-bold text-white">Synthetic Face Swap Detected</h4>
                <p className="text-[11px] text-red-200 leading-snug max-w-sm mx-auto">
                  Spectral 2D FFT shows periodic high-frequency checkerboard peaks. Confirmed by 48 clustered community reports.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-red-900/60 text-[10px]">
                <span className="text-gray-400">Cryptographically fingerprinted (SHA-256)</span>
                <span className="text-cyan font-bold hover:underline cursor-pointer">
                  Inspect Forensic Proof →
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
