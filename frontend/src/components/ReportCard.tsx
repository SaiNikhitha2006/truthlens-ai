import React from 'react';
import { CommunityReport } from '../types';
import { Flame, ShieldAlert, Share2, ExternalLink, CheckCircle, Clock, Copy, Hash } from 'lucide-react';

interface ReportCardProps {
  report: CommunityReport;
  onViewDetails: (reportId: string) => void;
  onPreShareIntercept: (report: CommunityReport) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onViewDetails,
  onPreShareIntercept
}) => {
  const getVelocityColor = (tier: string) => {
    switch (tier) {
      case 'EXPLOSIVE':
        return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MODERATE':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed_manipulated':
        return { text: 'Confirmed Manipulated', bg: 'bg-red-500/15 text-red-400 border-red-500/40' };
      case 'under_review':
        return { text: 'Under Investigation', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/40' };
      case 'cleared':
        return { text: 'Cleared Authentic', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40' };
      default:
        return { text: 'Pending Triage', bg: 'bg-gray-500/15 text-gray-400 border-gray-500/40' };
    }
  };

  const statusBadge = getStatusBadge(report.status);

  return (
    <div className="flex flex-col sm:flex-row items-start justify-between p-4 rounded-xl bg-slate-deep/70 border border-slate-border hover:border-slate-border/90 hover:bg-slate-deep/90 transition-all gap-4">
      {/* Thumbnail */}
      {report.thumbnail_url && (
        <div className="w-full sm:w-28 h-28 rounded-lg overflow-hidden bg-navy-dark border border-slate-border/50 flex-shrink-0">
          <img
            src={report.thumbnail_url}
            alt={report.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Main Content Info */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Platform Tag */}
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-navy border border-slate-border text-cyan">
            {report.platform}
          </span>

          {/* Status Badge */}
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${statusBadge.bg}`}>
            {statusBadge.text}
          </span>

          {/* Viral Velocity Pill */}
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center space-x-1 ${getVelocityColor(report.velocity_tier)}`}>
            <Flame className="w-3 h-3" />
            <span>Velocity: {report.viral_velocity_score}/100 ({report.velocity_tier})</span>
          </span>

          {/* Duplicate Cluster Count */}
          {report.duplicate_count > 1 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-electric/15 text-electric border border-electric/30 flex items-center space-x-1">
              <Hash className="w-2.5 h-2.5" />
              <span>{report.duplicate_count} Clustered Submissions</span>
            </span>
          )}
        </div>

        <h4 className="text-sm font-semibold text-white leading-snug hover:text-cyan cursor-pointer" onClick={() => onViewDetails(report.id)}>
          {report.title}
        </h4>

        <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed">
          {report.evidence_text}
        </p>

        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 pt-1">
          <span>Reported by: <strong className="text-gray-300">{report.reporter_handle}</strong></span>
          <span>•</span>
          <a
            href={report.post_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan hover:underline flex items-center space-x-1"
          >
            <span>Original Post</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <span>•</span>
          <span className="font-mono text-[10px] text-gray-400">
            Hash: {report.sha256.substring(0, 16)}...
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto flex-shrink-0 pt-2 sm:pt-0">
        <button
          onClick={() => onViewDetails(report.id)}
          className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-navy hover:bg-slate-hover text-cyan border border-slate-border text-xs font-semibold transition"
        >
          View Dossier
        </button>

        <button
          onClick={() => onPreShareIntercept(report)}
          className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900/80 text-red-300 border border-red-800 text-xs font-semibold flex items-center justify-center space-x-1 transition"
        >
          <Share2 className="w-3 h-3" />
          <span>Intercept Share</span>
        </button>
      </div>
    </div>
  );
};
