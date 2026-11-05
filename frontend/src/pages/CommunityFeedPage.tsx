import React, { useState, useEffect } from 'react';
import { CommunityReport } from '../types';
import { 
  Users, 
  Search, 
  Filter, 
  Flame, 
  Flag, 
  ExternalLink, 
  HelpCircle, 
  ShieldCheck, 
  AlertTriangle,
  ChevronRight,
  Info
} from 'lucide-react';
import { ReportCard } from '../components/ReportCard';
import { PreShareModal } from '../components/PreShareModal';
import { api } from '../services/api';

interface CommunityFeedPageProps {
  onViewReport: (reportId: string) => void;
  onPreShareIntercept: (report: CommunityReport) => void;
}

export const CommunityFeedPage: React.FC<CommunityFeedPageProps> = ({
  onViewReport,
  onPreShareIntercept
}) => {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showPlatformGuide, setShowPlatformGuide] = useState<boolean>(false);

  useEffect(() => {
    loadReports();
  }, [platformFilter, statusFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await api.getReports(platformFilter, statusFilter, search);
      setReports(res.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadReports();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan">Mechanism 2-B</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Community Watchlist & Flagged Feed</h2>
          <p className="text-sm text-gray-400 mt-1">
            Citizen-reported media verified through digital forensics and perceptual hash duplicate clustering.
          </p>
        </div>

        <button
          onClick={() => setShowPlatformGuide(!showPlatformGuide)}
          className="px-4 py-2 rounded-xl bg-slate-deep hover:bg-slate-hover border border-slate-border text-xs font-semibold text-cyan flex items-center space-x-1.5 self-start md:self-auto transition"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Platform Reporting Guidelines</span>
        </button>
      </div>

      {/* Platform Reporting Guide Accordion */}
      {showPlatformGuide && (
        <div className="p-6 rounded-2xl bg-slate-deep border border-cyan/40 shadow-glow-cyan space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Info className="w-4 h-4 text-cyan" />
              <span>How to Escalate Synthetic Media on External Networks:</span>
            </h3>
            <span className="text-xs text-gray-400">Platform-Specific Steps</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-navy/80 border border-slate-border space-y-1.5">
              <span className="font-bold text-cyan">X / Twitter</span>
              <p className="text-gray-300">Click ⋯ menu &gt; Report Post &gt; "It's misleading" &gt; "Synthetic or manipulated media". Attach TrueLens SHA link.</p>
            </div>
            <div className="p-3 rounded-xl bg-navy/80 border border-slate-border space-y-1.5">
              <span className="font-bold text-cyan">Meta / Facebook</span>
              <p className="text-gray-300">Select Post options &gt; Report &gt; False Information &gt; Fact-Checker Dispatch request.</p>
            </div>
            <div className="p-3 rounded-xl bg-navy/80 border border-slate-border space-y-1.5">
              <span className="font-bold text-cyan">Reddit</span>
              <p className="text-gray-300">Report to Subreddit Mods & Reddit AEO under "Impersonation or Non-consensual synthetic media".</p>
            </div>
            <div className="p-3 rounded-xl bg-navy/80 border border-slate-border space-y-1.5">
              <span className="font-bold text-cyan">Instagram</span>
              <p className="text-gray-300">Report &gt; "False Information" &gt; "AI or digitally generated without transparent label".</p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="p-4 rounded-2xl bg-slate-deep/70 border border-slate-border flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title, hash, or evidence keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-navy border border-slate-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          {/* Platform Filter */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-gray-400">Platform:</span>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-navy border border-slate-border text-xs text-gray-200 focus:outline-none"
            >
              <option value="all">All Networks</option>
              <option value="X/Twitter">X / Twitter</option>
              <option value="Facebook">Facebook</option>
              <option value="Reddit">Reddit</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1 text-xs">
            <span className="text-gray-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-navy border border-slate-border text-xs text-gray-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed_manipulated">Confirmed Manipulated</option>
              <option value="under_review">Under Review</option>
              <option value="pending">Pending</option>
              <option value="cleared">Cleared Authentic</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Feed List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-xs">
            Loading community flagged assets...
          </div>
        ) : reports.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-deep/40 border border-slate-border text-gray-400 text-sm">
            No reports matching your criteria. Try adjusting filters or search query.
          </div>
        ) : (
          reports.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              onViewDetails={onViewReport}
              onPreShareIntercept={onPreShareIntercept}
            />
          ))
        )}
      </div>
    </div>
  );
};
