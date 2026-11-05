import React, { useState, useEffect } from 'react';
import { 
  ForensicAnalysisResult, 
  SystemStats, 
  GlobalAlert, 
  CommunityReport, 
  SampleImage,
  RiskLevel 
} from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { PreShareModal } from './components/PreShareModal';
import { HomePage } from './pages/HomePage';
import { ScanPage } from './pages/ScanPage';
import { ReportDetailsPage } from './pages/ReportDetailsPage';
import { CommunityFeedPage } from './pages/CommunityFeedPage';
import { AdminPortalPage } from './pages/AdminPortalPage';
import { PartnerApiPage } from './pages/PartnerApiPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { api } from './services/api';
import { AlertCircle, Flame, X } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [analysisResult, setAnalysisResult] = useState<ForensicAnalysisResult | null>(null);
  const [stats, setStats] = useState<SystemStats>({
    scans_completed: 128490,
    flagged_assets: 4812,
    global_alerts_active: 3,
    hash_database_size: 24900,
    viral_interceptions_today: 3420,
    partner_queries_24h: 146950
  });
  const [alerts, setAlerts] = useState<GlobalAlert[]>([]);
  const [recentReports, setRecentReports] = useState<CommunityReport[]>([]);
  const [samples, setSamples] = useState<SampleImage[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);

  // Pre-share intercept modal state
  const [preShareModal, setPreShareModal] = useState<{
    isOpen: boolean;
    title: string;
    score: number;
    risk: RiskLevel;
    sha: string;
    thumbnail?: string;
    url: string;
  }>({
    isOpen: false,
    title: '',
    score: 15,
    risk: 'HIGH_RISK_MANIPULATED',
    sha: '',
    thumbnail: undefined,
    url: ''
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [statsRes, alertsRes, reportsRes, samplesRes] = await Promise.allSettled([
        api.getStats(),
        api.getAlerts(),
        api.getReports(),
        api.getSamples()
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.stats);
      if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.alerts);
      if (reportsRes.status === 'fulfilled') setRecentReports(reportsRes.value.reports);
      if (samplesRes.status === 'fulfilled') setSamples(samplesRes.value);
    } catch (err) {
      console.warn('Initial data load warning:', err);
    }
  };

  const handleScanComplete = (result: ForensicAnalysisResult) => {
    setAnalysisResult(result);
    setActiveTab('report_details');
    // Refresh stats
    api.getStats().then(s => setStats(s.stats)).catch(() => {});
  };

  const handleOpenPreShare = (report: CommunityReport) => {
    setPreShareModal({
      isOpen: true,
      title: report.title,
      score: 15,
      risk: 'HIGH_RISK_MANIPULATED',
      sha: report.sha256,
      thumbnail: report.thumbnail_url,
      url: `/verify/${report.id}`
    });
  };

  const handleViewReportDossier = async (reportId: string) => {
    try {
      const details = await api.getReportById(reportId);
      const rep = details.report;

      // Construct a full dossier representation from report
      const synthesizedResult: ForensicAnalysisResult = {
        status: 'success',
        file_name: `${rep.platform}_${rep.id}.jpg`,
        sha256: rep.sha256,
        phash: rep.phash || 'f0e1d2c3b4a59687',
        database_match: {
          matched: true,
          match_type: 'VERIFIED_COMMUNITY_FLAG',
          hamming_distance: 0,
          details: details.moderation_record || {
            id: rep.id,
            title: rep.title,
            category: rep.reason,
            risk_level: 'HIGH_RISK_MANIPULATED',
            trust_score: 18,
            status: rep.status,
            source_platform: rep.platform,
            viral_count: rep.duplicate_count * 250,
            reported_at: rep.created_at,
            verified_by: 'Community Escalation Network',
            notes: rep.evidence_text,
            thumbnail_url: rep.thumbnail_url
          }
        },
        trust_score: 18,
        risk_level: 'HIGH_RISK_MANIPULATED',
        verdict_title: rep.title,
        confidence_interval: {
          lower: 12,
          upper: 24,
          confidence_pct: 95.8
        },
        breakdown: {
          spectral_authenticity: 20,
          ela_compression_uniformity: 22,
          noise_variance_consistency: 18,
          edge_lighting_integrity: 25,
          metadata_provenance: 15
        },
        findings: [
          {
            type: 'COMMUNITY_CONSORTIUM_FLAG',
            severity: 'CRITICAL',
            message: `Flagged on ${rep.platform} for ${rep.reason}. Duplicate cluster index: ${rep.duplicate_count} reports.`
          },
          {
            type: 'EVIDENCE_NOTE',
            severity: 'HIGH',
            message: rep.evidence_text
          }
        ],
        metadata_summary: {
          has_exif: false,
          software: 'Stripped by social media ingestion pipeline',
          camera: 'None',
          metadata_score: 25,
          raw_tags: {}
        },
        noise_summary: {
          score: 20,
          status: 'INCONSISTENT_SENSOR_NOISE',
          variance_ratio: 3.8,
          quadrant_variances: [42.1, 11.2, 38.6, 12.0],
          detail: 'High noise variance disparity indicates composite splicing.'
        },
        edge_summary: {
          edge_score: 30,
          laplacian_variance: 42.0,
          lighting_entropy: 1.8,
          description: 'Localized edge blur mismatch around target subject.'
        },
        ela: {
          status: 'success',
          mean_error: 14.2,
          std_error: 18.5,
          peak_error: 240,
          variance_std: 182.4,
          anomaly_ratio_pct: 22.4,
          assessment: 'SUSPICIOUS_SPLICING_DETECTED',
          explanation: 'Significant localized compression error disparity detected.',
          diff_image_base64: rep.thumbnail_url || '',
          heatmap_image_base64: rep.thumbnail_url || '',
          blended_image_base64: rep.thumbnail_url || '',
          dimensions: { width: 640, height: 480 }
        },
        spectral: {
          status: 'success',
          high_low_ratio: 0.48,
          high_energy_pct: 34.5,
          peak_artifact_count: 14,
          spectral_tail_slope: -0.04,
          is_synthetic_signature: true,
          synthetic_confidence: 88,
          ai_indicators: ['Periodic high-frequency checkerboard peaks (14 spikes).'],
          radial_distribution: Array.from({ length: 25 }, (_, i) => ({ frequency: i * 4, amplitude: Math.max(10, 80 - i * 2.2) })),
          spectrum_image_base64: ''
        },
        original_preview: rep.thumbnail_url || ''
      };

      setAnalysisResult(synthesizedResult);
      setActiveTab('report_details');
    } catch (err: any) {
      alert(err.message || 'Failed to load report dossier.');
    }
  };

  const criticalAlert = alerts.find(a => a.severity === 'CRITICAL');

  return (
    <div className="min-h-screen bg-navy text-gray-100 flex flex-col font-sans">
      {/* Critical Outbreak Top Banner */}
      {criticalAlert && !bannerDismissed && (
        <div className="bg-gradient-to-r from-red-900 via-pink-900 to-red-950 border-b border-red-700/60 px-4 py-2.5 text-xs text-red-100 flex items-center justify-between">
          <div 
            onClick={() => setActiveTab('notifications')}
            className="max-w-6xl mx-auto flex items-center space-x-2.5 cursor-pointer hover:underline flex-1"
          >
            <AlertCircle className="w-4 h-4 text-red-400 animate-pulse flex-shrink-0" />
            <span className="font-bold uppercase tracking-wider text-red-300">CRITICAL OUTBREAK:</span>
            <span className="truncate">{criticalAlert.title}</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-black/40 text-[10px] text-amber-300">
              Velocity: {criticalAlert.viral_velocity}/100
            </span>
          </div>
          <button
            onClick={() => setBannerDismissed(true)}
            className="text-red-300 hover:text-white p-1 rounded transition ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        alerts={alerts}
      />

      {/* Page Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <HomePage
            stats={stats}
            alerts={alerts}
            recentReports={recentReports}
            setActiveTab={setActiveTab}
            onViewReport={handleViewReportDossier}
            onPreShareIntercept={handleOpenPreShare}
          />
        )}

        {activeTab === 'scan' && (
          <ScanPage
            onScanComplete={handleScanComplete}
            samples={samples}
          />
        )}

        {activeTab === 'report_details' && analysisResult && (
          <ReportDetailsPage
            result={analysisResult}
            onBack={() => setActiveTab('scan')}
          />
        )}

        {activeTab === 'community' && (
          <CommunityFeedPage
            onViewReport={handleViewReportDossier}
            onPreShareIntercept={handleOpenPreShare}
          />
        )}

        {activeTab === 'admin' && (
          <AdminPortalPage />
        )}

        {activeTab === 'partners' && (
          <PartnerApiPage />
        )}

        {activeTab === 'notifications' && (
          <NotificationsPage
            alerts={alerts}
            onViewReport={handleViewReportDossier}
          />
        )}
      </main>

      {/* Pre-Share Intercept Modal */}
      <PreShareModal
        isOpen={preShareModal.isOpen}
        onClose={() => setPreShareModal(prev => ({ ...prev, isOpen: false }))}
        title={preShareModal.title}
        trustScore={preShareModal.score}
        riskLevel={preShareModal.risk}
        sha256={preShareModal.sha}
        thumbnailUrl={preShareModal.thumbnail}
        shareableUrl={preShareModal.url}
      />

      {/* Global Footer */}
      <Footer />
    </div>
  );
};
export default App;
