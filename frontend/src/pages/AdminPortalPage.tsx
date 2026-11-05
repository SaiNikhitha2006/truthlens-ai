import React, { useState, useEffect } from 'react';
import { CommunityReport, PartnerPlatform } from '../types';
import { 
  ShieldAlert, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send, 
  Database, 
  Flame, 
  ExternalLink,
  MessageSquare,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export const AdminPortalPage: React.FC = () => {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [partners, setPartners] = useState<PartnerPlatform[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(null);
  const [moderatorNotes, setModeratorNotes] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isDispatchingWebhook, setIsDispatchingWebhook] = useState<boolean>(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [repsRes, partsRes] = await Promise.all([
        api.getReports(),
        api.getPartners()
      ]);
      setReports(repsRes.reports);
      setPartners(partsRes.partners);
      if (repsRes.reports.length > 0 && !selectedReport) {
        setSelectedReport(repsRes.reports[0]);
        setModeratorNotes(repsRes.reports[0].moderator_notes || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedReport) return;
    try {
      const res = await api.updateReportStatus(
        selectedReport.id,
        status,
        moderatorNotes,
        true // add to global hashes if confirmed
      );
      setActionSuccess(`Status updated to '${status.toUpperCase()}'. Automatically synced with Global Fingerprint DB.`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update report status.');
    }
  };

  const handleDispatchWebhook = async (partnerId: string) => {
    if (!selectedReport) return;
    try {
      setIsDispatchingWebhook(true);
      await api.testWebhook(partnerId, selectedReport.sha256);
      setActionSuccess(`Compliance content-warning webhook dispatched to partner platform.`);
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Webhook dispatch failed.');
    } finally {
      setIsDispatchingWebhook(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-400">Mechanism 2-E</span>
            <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Admin Moderation & Governance Portal</h2>
          <p className="text-sm text-gray-400 mt-1">
            Human-in-the-loop verification console, viral velocity escalation triage, and partner compliance dispatch.
          </p>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-xl bg-slate-deep hover:bg-slate-hover border border-slate-border text-gray-300 hover:text-white transition"
          title="Refresh Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Grid: Queue on Left, Decision Console on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Triage Queue (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl bg-slate-deep/70 border border-slate-border p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-border/80 text-xs font-semibold text-gray-300">
            <span>Submissions by Viral Velocity</span>
            <span className="text-gray-400">{reports.length} in queue</span>
          </div>

          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {reports.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => {
                    setSelectedReport(rep);
                    setModeratorNotes(rep.moderator_notes || '');
                  }}
                  className={`p-3 rounded-xl cursor-pointer border transition-all text-xs space-y-1.5 ${
                    isSelected
                      ? 'bg-navy border-cyan shadow-glow-cyan'
                      : 'bg-navy/60 border-slate-border/60 hover:border-slate-border hover:bg-navy/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan">{rep.platform}</span>
                    <span className="font-mono text-[10px] text-gray-400">{rep.id}</span>
                  </div>

                  <h5 className="font-semibold text-white truncate">{rep.title}</h5>

                  <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1">
                    <span className="flex items-center space-x-1 text-amber-400">
                      <Flame className="w-3 h-3" />
                      <span>Velocity: {rep.viral_velocity_score}</span>
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-black/40 uppercase font-semibold">
                      {rep.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Decision & Audit Console (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl bg-slate-deep/70 border border-slate-border p-6 space-y-5">
          {selectedReport ? (
            <div className="space-y-5">
              <div className="flex items-start justify-between pb-3 border-b border-slate-border/80">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-navy text-cyan border border-slate-border">
                    Report ID: {selectedReport.id}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-2 leading-snug">{selectedReport.title}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/30">
                  {selectedReport.status.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Media Preview & Details */}
              <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-navy/80 border border-slate-border">
                {selectedReport.thumbnail_url && (
                  <img
                    src={selectedReport.thumbnail_url}
                    alt="Asset"
                    className="w-full sm:w-36 h-36 rounded-lg object-cover border border-slate-border flex-shrink-0"
                  />
                )}
                <div className="space-y-2 text-xs flex-1">
                  <div>
                    <span className="text-gray-400">Platform & URL: </span>
                    <strong className="text-white">{selectedReport.platform}</strong>
                    <a
                      href={selectedReport.post_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-cyan inline-flex items-center hover:underline"
                    >
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </a>
                  </div>

                  <div>
                    <span className="text-gray-400">Reporter: </span>
                    <span className="text-gray-200">{selectedReport.reporter_handle}</span>
                  </div>

                  <div>
                    <span className="text-gray-400">Duplicate Clusters: </span>
                    <strong className="text-electric">{selectedReport.duplicate_count} matches</strong>
                  </div>

                  <p className="text-gray-300 bg-slate-deep/50 p-2 rounded-lg border border-slate-border/50">
                    "{selectedReport.evidence_text}"
                  </p>
                </div>
              </div>

              {/* Cryptographic SHA */}
              <div className="p-3 rounded-xl bg-navy/60 border border-slate-border text-xs flex items-center justify-between">
                <span className="text-gray-400 font-mono text-[11px]">SHA-256:</span>
                <span className="text-gray-300 font-mono text-[11px] truncate max-w-[340px]">
                  {selectedReport.sha256}
                </span>
              </div>

              {/* Moderator Decision Notes */}
              <div className="space-y-2 text-xs">
                <label className="block text-gray-300 font-semibold flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan" />
                  <span>Human-in-the-Loop Verification Rationale:</span>
                </label>
                <textarea
                  rows={3}
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                  placeholder="Record forensic corroboration, source attribution, or reason for clearance..."
                  className="w-full px-3 py-2 rounded-xl bg-navy border border-slate-border text-white text-xs placeholder-gray-500 focus:outline-none focus:border-cyan"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleUpdateStatus('confirmed_manipulated')}
                  className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify as Manipulated (Sync DB)</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('cleared')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 transition"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Clear as Authentic</span>
                </button>

                <button
                  onClick={() => handleUpdateStatus('under_review')}
                  className="px-3 py-2.5 rounded-xl bg-navy hover:bg-slate-hover text-gray-300 border border-slate-border text-xs font-semibold transition"
                >
                  <Clock className="w-4 h-4" />
                  <span>Queue for Review</span>
                </button>
              </div>

              {/* Dispatch Webhook to Partners */}
              <div className="pt-4 border-t border-slate-border/80 space-y-2">
                <span className="text-xs font-semibold text-gray-300 block">
                  Dispatch Partner API Webhook Content Warning:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {partners.map((partner) => (
                    <button
                      key={partner.id}
                      disabled={isDispatchingWebhook}
                      onClick={() => handleDispatchWebhook(partner.id)}
                      className="px-3 py-1.5 rounded-lg bg-navy hover:bg-slate-hover border border-slate-border text-[11px] font-medium text-cyan flex items-center space-x-1 transition disabled:opacity-50"
                    >
                      <Send className="w-3 h-3" />
                      <span>{partner.name.split(' ')[0]} Webhook</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 text-xs">
              Select a submission from the triage queue on the left.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
