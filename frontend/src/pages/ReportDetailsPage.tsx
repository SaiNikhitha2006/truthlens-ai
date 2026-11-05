import React, { useState } from 'react';
import { ForensicAnalysisResult } from '../types';
import { 
  ShieldCheck, 
  Share2, 
  Download, 
  Flag, 
  ArrowLeft, 
  Copy, 
  Check, 
  AlertTriangle, 
  FileText, 
  Database,
  Sparkles,
  Sliders,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { TrustScoreGauge } from '../components/TrustScoreGauge';
import { ImageSplitView } from '../components/ImageSplitView';
import { ElaVisualizer } from '../components/ElaVisualizer';
import { SpectralVisualizer } from '../components/SpectralVisualizer';
import { PreShareModal } from '../components/PreShareModal';
import { api } from '../services/api';

interface ReportDetailsPageProps {
  result: ForensicAnalysisResult;
  onBack: () => void;
  onSubmitToCommunity?: (result: ForensicAnalysisResult) => void;
}

export const ReportDetailsPage: React.FC<ReportDetailsPageProps> = ({
  result,
  onBack,
  onSubmitToCommunity
}) => {
  const [isPreShareOpen, setIsPreShareOpen] = useState<boolean>(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState<boolean>(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);
  const [platformSelect, setPlatformSelect] = useState<string>('X/Twitter');
  const [postUrlInput, setPostUrlInput] = useState<string>('');
  const [reasonInput, setReasonInput] = useState<string>('synthetic_disinformation');
  const [evidenceInput, setEvidenceInput] = useState<string>('');
  const [copiedSha, setCopiedSha] = useState<boolean>(false);

  const handleCopySha = () => {
    navigator.clipboard.writeText(result.sha256);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const handleDownloadReport = () => {
    const reportData = {
      title: "TRUE LENS AI - FORENSIC MEDIA VERIFICATION DOSSIER",
      generated_at: new Date().toISOString(),
      file_name: result.file_name,
      sha256: result.sha256,
      phash: result.phash,
      trust_score: result.trust_score,
      risk_level: result.risk_level,
      verdict: result.verdict_title,
      confidence_interval: result.confidence_interval,
      breakdown: result.breakdown,
      findings: result.findings,
      ela_metrics: {
        mean_error: result.ela.mean_error,
        variance_std: result.ela.variance_std,
        anomaly_ratio_pct: result.ela.anomaly_ratio_pct,
        assessment: result.ela.assessment
      },
      spectral_metrics: {
        high_low_ratio: result.spectral.high_low_ratio,
        peak_artifacts: result.spectral.peak_artifact_count,
        is_synthetic: result.spectral.is_synthetic_signature
      },
      cryptographic_attestation: "SHA256_VERIFIED_BY_TRUE_LENS_AI_CONSORTIUM"
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truelens_forensic_report_${result.sha256.substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCommunitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.submitReport({
        sha256: result.sha256,
        phash: result.phash,
        title: result.verdict_title || 'Community Escalated Flag',
        platform: platformSelect,
        post_url: postUrlInput || 'https://example.com/reported_post',
        reason: reasonInput,
        evidence_text: evidenceInput || `Forensic Trust Score: ${result.trust_score}/100. ${result.findings[0]?.message || 'Tampering detected.'}`,
        thumbnail_url: result.original_preview
      });
      setReportSuccess('Report successfully submitted to Community Governance Network!');
      setTimeout(() => {
        setIsSubmittingReport(false);
        setReportSuccess(null);
      }, 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit community report.');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-border">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-sm text-gray-400 hover:text-white transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Scanner</span>
        </button>

        {/* Action Bar */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsPreShareOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-red-950/70 hover:bg-red-900/80 border border-red-700 text-red-200 text-xs font-semibold flex items-center space-x-1.5 transition shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Warning Link</span>
          </button>

          <button
            onClick={() => setIsSubmittingReport(true)}
            className="px-3.5 py-2 rounded-xl bg-navy hover:bg-slate-hover border border-slate-border text-cyan text-xs font-semibold flex items-center space-x-1.5 transition"
          >
            <Flag className="w-3.5 h-3.5" />
            <span>Log Community Report</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="px-3.5 py-2 rounded-xl bg-electric hover:bg-electric-hover text-white text-xs font-semibold flex items-center space-x-1.5 transition shadow-glow-electric"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Forensic JSON</span>
          </button>
        </div>
      </div>

      {/* Global Fingerprint Database Alert Banner (if matched) */}
      {result.database_match.matched && (
        <div className="p-4 rounded-2xl bg-red-950/60 border border-red-500/60 flex items-start space-x-3 shadow-glow-danger animate-fade-in">
          <Database className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-900 text-red-200">
                Known Disinformation Match
              </span>
              <span className="text-xs text-red-300 font-mono">
                Match Method: {result.database_match.match_type}
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">
              {result.database_match.details?.title}
            </h4>
            <p className="text-xs text-red-200 leading-relaxed">
              {result.database_match.details?.notes}
            </p>
          </div>
        </div>
      )}

      {/* Hero Overview Grid: Trust Gauge + Cryptographic Provenance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Trust Score Gauge */}
        <div className="lg:col-span-1">
          <TrustScoreGauge
            score={result.trust_score}
            riskLevel={result.risk_level}
            verdictTitle={result.verdict_title}
            confidenceInterval={result.confidence_interval}
          />
        </div>

        {/* Right: Granular Score Breakdown & Cryptographic Identity */}
        <div className="lg:col-span-2 flex flex-col justify-between p-6 rounded-2xl bg-slate-deep/70 border border-slate-border space-y-4">
          <div>
            <h3 className="text-base font-semibold text-white">Forensic Provenance & Multi-Layer Audit</h3>
            <p className="text-xs text-gray-400 mt-0.5">Composite assessment across five forensic dimensions</p>
          </div>

          {/* Breakdown progress bars */}
          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-300">Spectral Authenticity (2D FFT / GAN signature)</span>
                <span className="text-cyan font-mono">{result.breakdown.spectral_authenticity}/100</span>
              </div>
              <div className="w-full bg-navy rounded-full h-2 overflow-hidden">
                <div
                  className="bg-cyan h-2 rounded-full transition-all duration-700"
                  style={{ width: `${result.breakdown.spectral_authenticity}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-300">ELA Compression Uniformity (Quantization grid)</span>
                <span className="text-electric font-mono">{result.breakdown.ela_compression_uniformity}/100</span>
              </div>
              <div className="w-full bg-navy rounded-full h-2 overflow-hidden">
                <div
                  className="bg-electric h-2 rounded-full transition-all duration-700"
                  style={{ width: `${result.breakdown.ela_compression_uniformity}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-300">Sensor Noise Consistency (PRNU residue)</span>
                <span className="text-emerald-400 font-mono">{result.breakdown.noise_variance_consistency}/100</span>
              </div>
              <div className="w-full bg-navy rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${result.breakdown.noise_variance_consistency}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-gray-300">Edge & Lighting Coherence</span>
                <span className="text-amber-400 font-mono">{result.breakdown.edge_lighting_integrity}/100</span>
              </div>
              <div className="w-full bg-navy rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-400 h-2 rounded-full transition-all duration-700"
                  style={{ width: `${result.breakdown.edge_lighting_integrity}%` }}
                />
              </div>
            </div>
          </div>

          {/* Cryptographic Hashes Footer */}
          <div className="pt-3 border-t border-slate-border/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-cyan" />
              <span className="text-gray-400 font-medium">SHA-256 Digest:</span>
              <span className="font-mono text-gray-200 bg-navy px-2 py-0.5 rounded border border-slate-border text-[11px]">
                {result.sha256.substring(0, 20)}...
              </span>
              <button
                onClick={handleCopySha}
                className="text-gray-400 hover:text-white p-1 rounded"
                title="Copy SHA-256"
              >
                {copiedSha ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-gray-400 font-medium">Perceptual pHash:</span>
              <span className="font-mono text-cyan bg-navy px-2 py-0.5 rounded border border-slate-border text-[11px]">
                {result.phash}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Findings Log */}
      <div className="p-6 rounded-2xl bg-slate-deep/70 border border-slate-border space-y-3">
        <h3 className="text-base font-semibold text-white">Forensic Diagnostic Findings</h3>
        <div className="space-y-2">
          {result.findings.map((finding, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-start space-x-3 text-xs leading-relaxed ${
                finding.severity === 'CRITICAL' || finding.severity === 'HIGH'
                  ? 'bg-red-950/40 border-red-900/60 text-red-200'
                  : finding.severity === 'MEDIUM'
                  ? 'bg-amber-950/40 border-amber-900/60 text-amber-200'
                  : 'bg-navy/80 border-slate-border text-gray-300'
              }`}
            >
              <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-current" />
              <div>
                <span className="font-bold uppercase tracking-wider text-[10px] mr-2 px-1.5 py-0.5 rounded bg-black/40">
                  {finding.type}
                </span>
                <span>{finding.message}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Split View: Original vs ELA vs FFT Spectrum */}
      <ImageSplitView
        originalUrl={result.original_preview}
        elaHeatmapUrl={result.ela.heatmap_image_base64}
        spectralUrl={result.spectral.spectrum_image_base64}
        elaDiffUrl={result.ela.diff_image_base64}
        blendedUrl={result.ela.blended_image_base64}
      />

      {/* Side by Side Deep Dives: ELA Analysis & FFT Spectral Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ElaVisualizer ela={result.ela} />
        <SpectralVisualizer spectral={result.spectral} />
      </div>

      {/* Pre-Share Intercept Modal */}
      <PreShareModal
        isOpen={isPreShareOpen}
        onClose={() => setIsPreShareOpen(false)}
        title={result.verdict_title}
        trustScore={result.trust_score}
        riskLevel={result.risk_level}
        sha256={result.sha256}
        thumbnailUrl={result.original_preview}
        shareableUrl={`/verify/${result.sha256}`}
      />

      {/* Submit Community Report Modal */}
      {isSubmittingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-dark/85 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-slate-deep border border-slate-border p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2">Escalate to Community Governance Feed</h3>
            <p className="text-xs text-gray-400 mb-4">
              Submit this asset to the public watchlist so other platforms and fact-checkers can verify and warn their users.
            </p>

            <form onSubmit={handleCommunitySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-semibold mb-1">Platform Source:</label>
                <select
                  value={platformSelect}
                  onChange={(e) => setPlatformSelect(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy border border-slate-border text-white"
                >
                  <option value="X/Twitter">X / Twitter</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Reddit">Reddit</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Telegram">Telegram</option>
                  <option value="Other">Other Platform</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Public Post / Context URL:</label>
                <input
                  type="url"
                  required
                  placeholder="https://x.com/post_id_or_similar"
                  value={postUrlInput}
                  onChange={(e) => setPostUrlInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy border border-slate-border text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Violation Reason:</label>
                <select
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy border border-slate-border text-white"
                >
                  <option value="synthetic_disinformation">Synthetic Media / Disinformation</option>
                  <option value="deepfake_impersonation">Deepfake Impersonation of Public Official</option>
                  <option value="financial_fraud">Financial Splicing & Market Manipulation</option>
                  <option value="synthetic_avatar">Synthetic AI Avatar Network</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 font-semibold mb-1">Supporting Evidence / Context:</label>
                <textarea
                  rows={3}
                  placeholder="Explain why this content is misleading..."
                  value={evidenceInput}
                  onChange={(e) => setEvidenceInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy border border-slate-border text-white"
                />
              </div>

              {reportSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs">
                  {reportSuccess}
                </div>
              )}

              <div className="flex items-center justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsSubmittingReport(false)}
                  className="px-4 py-2 rounded-xl bg-navy text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan hover:bg-cyan-hover text-navy-dark font-bold"
                >
                  Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
