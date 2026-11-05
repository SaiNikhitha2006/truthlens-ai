import React from 'react';
import { Shield, Radio, Search, Activity, Users, ShieldAlert, Cpu, Bell } from 'lucide-react';
import { GlobalAlert } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  alerts: GlobalAlert[];
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, alerts }) => {
  const criticalCount = alerts.filter(a => a.severity === 'CRITICAL').length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-border bg-navy/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveTab('home')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-electric to-cyan shadow-glow-electric group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
              <div className="absolute inset-0 rounded-xl border border-white/30 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-bold tracking-tight text-white">True Lens</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-electric/20 text-cyan border border-cyan/30">AI</span>
              </div>
              <p className="text-[10px] text-gray-400 tracking-wider uppercase font-medium">Detect • Verify • Prevent</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'home'
                  ? 'bg-slate-deep text-cyan shadow-inner'
                  : 'text-gray-300 hover:text-white hover:bg-slate-deep/50'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('scan')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'scan'
                  ? 'bg-slate-deep text-cyan shadow-inner'
                  : 'text-gray-300 hover:text-white hover:bg-slate-deep/50'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Scan & Forensics</span>
            </button>

            <button
              onClick={() => setActiveTab('community')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'community'
                  ? 'bg-slate-deep text-cyan shadow-inner'
                  : 'text-gray-300 hover:text-white hover:bg-slate-deep/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Flagged Feed</span>
            </button>

            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'admin'
                  ? 'bg-slate-deep text-cyan shadow-inner'
                  : 'text-gray-300 hover:text-white hover:bg-slate-deep/50'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Portal</span>
            </button>

            <button
              onClick={() => setActiveTab('partners')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'partners'
                  ? 'bg-slate-deep text-cyan shadow-inner'
                  : 'text-gray-300 hover:text-white hover:bg-slate-deep/50'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Partner API</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 relative ${
                activeTab === 'notifications'
                  ? 'bg-slate-deep text-cyan shadow-inner'
                  : 'text-gray-300 hover:text-white hover:bg-slate-deep/50'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Alerts</span>
              {criticalCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute top-2 right-2" />
              )}
            </button>
          </nav>

          {/* Quick CTA and Live Signal */}
          <div className="flex items-center space-x-3">
            {criticalCount > 0 && (
              <div 
                onClick={() => setActiveTab('notifications')}
                className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-red-300 text-xs cursor-pointer hover:bg-red-900/60 transition"
              >
                <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                <span className="font-medium">{criticalCount} Critical Outbreak</span>
              </div>
            )}

            <button
              onClick={() => setActiveTab('scan')}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-electric to-blue-600 hover:from-blue-600 hover:to-electric text-white text-sm font-semibold shadow-glow-electric transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Analyze Media
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
