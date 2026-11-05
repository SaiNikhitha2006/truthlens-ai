import React from 'react';
import { SystemStats, GlobalAlert, CommunityReport } from '../types';
import { 
  ShieldCheck, 
  Search, 
  Flame, 
  Cpu, 
  Share2, 
  Bell, 
  Layers, 
  Users, 
  CheckCircle2, 
  ArrowRight,
  Database,
  Radio,
  Lock,
  Sparkles,
  TrendingDown,
  Compass
} from 'lucide-react';
import { ReportCard } from '../components/ReportCard';
import { SocialFeedExtensionSim } from '../components/SocialFeedExtensionSim';
import { ViralTrajectoryChart } from '../components/ViralTrajectoryChart';
import { audioCues } from '../components/AudioCues';

interface HomePageProps {
  stats: SystemStats;
  alerts: GlobalAlert[];
  recentReports: CommunityReport[];
  setActiveTab: (tab: string) => void;
  onViewReport: (reportId: string) => void;
  onPreShareIntercept: (report: CommunityReport) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  stats,
  alerts,
  recentReports,
  setActiveTab,
  onViewReport,
  onPreShareIntercept
}) => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-navy via-slate-deep to-navy-dark border border-slate-border p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-electric/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-cyan/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/30 text-cyan text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan" />
            <span>Real-Time Multi-Spectral Forensics & Cryptographic Governance</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Detect Synthetic Media. <br />
            <span className="bg-gradient-to-r from-electric via-cyan to-white bg-clip-text text-transparent">
              Verify Authenticity. Prevent Viral Disinfo.
            </span>
          </h1>

          <p className="text-gray-300 text-base sm:text-lg leading-relaxed">
            True Lens AI combines Error Level Analysis (ELA), 2D Fourier spectral decomposition, copy-move detection, and bilateral platform APIs to detect deepfakes, calculate viral velocity, and intercept misinformation before it cascades across networks.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => {
                audioCues.playScanTone();
                setActiveTab('scan');
              }}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-electric to-blue-600 hover:from-blue-600 hover:to-electric text-white font-semibold text-sm shadow-glow-electric flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
            >
              <Search className="w-4 h-4" />
              <span>Launch Forensic Scan</span>
            </button>

            <button
              onClick={() => {
                audioCues.playScanTone();
                setActiveTab('community');
              }}
              className="px-6 py-3 rounded-xl bg-slate-deep hover:bg-slate-hover text-gray-200 border border-slate-border font-semibold text-sm flex items-center space-x-2 transition"
            >
              <Users className="w-4 h-4 text-cyan" />
              <span>Explore Flagged Feed</span>
            </button>
          </div>
        </div>
      </section>

      {/* Live System Stats Metrics */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-deep/70 border border-slate-border shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Total Scans Run</span>
              <Search className="w-4 h-4 text-electric" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono mt-2">
              {stats.scans_completed?.toLocaleString() || '128,490'}
            </div>
            <span className="text-[11px] text-emerald-400 font-medium mt-1 block">
              +1,280 in past 24 hrs
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-deep/70 border border-slate-border shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Flagged Manipulated</span>
              <ShieldCheck className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-pink-400 font-mono mt-2">
              {stats.flagged_assets?.toLocaleString() || '4,812'}
            </div>
            <span className="text-[11px] text-gray-400 mt-1 block">
              Cryptographically fingerprinted
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-deep/70 border border-slate-border shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Global Fingerprint DB</span>
              <Database className="w-4 h-4 text-cyan" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan font-mono mt-2">
              {stats.hash_database_size?.toLocaleString() || '24,900'}
            </div>
            <span className="text-[11px] text-gray-400 mt-1 block">
              SHA-256 + 64-bit pHashes
            </span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-deep/70 border border-slate-border shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Viral Interceptions</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono mt-2">
              {stats.viral_interceptions_today?.toLocaleString() || '3,420'}
            </div>
            <span className="text-[11px] text-emerald-400 font-medium mt-1 block">
              Pre-share friction engaged
            </span>
          </div>
        </div>
      </section>

      {/* In-Situ Social Extension Simulation Demo */}
      <section>
        <SocialFeedExtensionSim />
      </section>

      {/* Five Circulation Reduction Mechanisms Overview */}
      <section className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan">System Architecture</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Five Circulation Reduction Mechanisms</h2>
          <p className="text-sm text-gray-400 max-w-2xl">
            A comprehensive pipeline engineered to stop viral falsehoods at every layer of distribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-slate-deep/60 border border-slate-border hover:border-cyan/40 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-electric/20 text-electric flex items-center justify-center font-bold text-sm">
              A
            </div>
            <h3 className="text-base font-semibold text-white">Global Image Fingerprint Database</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Every uploaded asset is cross-referenced against SHA-256 binary digests and 64-bit DCT Perceptual Hashes (pHash) via Hamming Distance to match previously moderated media instantly.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-deep/60 border border-slate-border hover:border-cyan/40 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan/20 text-cyan flex items-center justify-center font-bold text-sm">
              B
            </div>
            <h3 className="text-base font-semibold text-white">Cross-Platform Reporting Flows</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Enables OSINT investigators and citizens to log claims with platform-specific context (X/Twitter, Facebook, Reddit, Instagram) and evidence links to prioritize high-risk disinformation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-deep/60 border border-slate-border hover:border-cyan/40 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-sm">
              C
            </div>
            <h3 className="text-base font-semibold text-white">Platform Partner Integration API</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Secure REST endpoints (<code className="text-cyan font-mono">/moderation/flag</code>, <code className="text-cyan font-mono">/moderation/check-hash</code>) allowing partner networks to sync real-time content warnings.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-deep/60 border border-slate-border hover:border-cyan/40 transition space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              D
            </div>
            <h3 className="text-base font-semibold text-white">Global Alerts & Pre-Share Intercept</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Viral warning modal intercepts users before they re-share flagged media, imposing friction and appending tamper verification certificates to debunking links.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-deep/60 border border-slate-border hover:border-cyan/40 transition space-y-3 md:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
              E
            </div>
            <h3 className="text-base font-semibold text-white">Community Governance & Viral Velocity Engine</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Clusters duplicate reports by perceptual proximity, calculates hourly viral acceleration, and delivers prioritized queues to human-in-the-loop expert moderators.
            </p>
          </div>
        </div>
      </section>

      {/* Viral Velocity Dissemination Model */}
      <section>
        <ViralTrajectoryChart />
      </section>

      {/* Recent High-Velocity Outbreaks Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
              <Flame className="w-5 h-5 text-red-400" />
              <span>High-Velocity Disinformation Watchlist</span>
            </h2>
            <p className="text-xs text-gray-400">Assets demonstrating abnormal circulation speed across social networks</p>
          </div>

          <button
            onClick={() => {
              audioCues.playScanTone();
              setActiveTab('community');
            }}
            className="text-xs font-semibold text-cyan hover:underline flex items-center space-x-1"
          >
            <span>View All Reports</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-3">
          {recentReports.slice(0, 3).map((rep) => (
            <ReportCard
              key={rep.id}
              report={rep}
              onViewDetails={onViewReport}
              onPreShareIntercept={onPreShareIntercept}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
