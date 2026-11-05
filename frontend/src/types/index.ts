export type RiskLevel = 'LOW_RISK' | 'SUSPICIOUS' | 'HIGH_RISK_MANIPULATED' | 'AI_GENERATED';

export type VelocityTier = 'EXPLOSIVE' | 'HIGH' | 'MODERATE' | 'STEADY';

export interface ForensicFinding {
  type: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  message: string;
}

export interface ElaResult {
  status: string;
  quality_tested?: number;
  scale_factor?: number;
  colormap_used?: string;
  mean_error: number;
  std_error: number;
  peak_error: number;
  variance_std: number;
  anomaly_ratio_pct: number;
  assessment: string;
  explanation: string;
  diff_image_base64: string;
  heatmap_image_base64: string;
  blended_image_base64: string;
  dimensions: { width: number; height: number };
}

export interface RadialPoint {
  frequency: number;
  amplitude: number;
}

export interface SpectralResult {
  status: string;
  high_low_ratio: number;
  high_energy_pct: number;
  peak_artifact_count: number;
  spectral_tail_slope: number;
  is_synthetic_signature: boolean;
  synthetic_confidence: number;
  ai_indicators: string[];
  radial_distribution: RadialPoint[];
  spectrum_image_base64: string;
}

export interface CopyMoveResult {
  detected: boolean;
  cloned_cluster_count: number;
  confidence_score: number;
  explanation: string;
  visual_base64: string;
}

export interface ChrominanceResult {
  status: string;
  chroma_edge_ratio: number;
  cb_variance: number;
  cr_variance: number;
  assessment: string;
  explanation: string;
  score: number;
  chroma_heatmap_base64: string;
}

export interface FacialForensicsResult {
  face_detected: boolean;
  boundary_seam_score: number;
  symmetry_score: number;
  findings: string[];
  face_roi_base64: string;
  annotated_preview_base64: string;
}

export interface NoisePrintResult {
  status: string;
  noise_std: number;
  noise_variance_heterogeneity: number;
  description: string;
  score: number;
  noise_map_base64: string;
}

export interface DatabaseMatch {
  matched: boolean;
  match_type: string;
  hamming_distance: number | null;
  details: {
    id: string;
    title: string;
    category: string;
    risk_level: RiskLevel;
    trust_score: number;
    status: string;
    source_platform: string;
    viral_count: number;
    reported_at: string;
    verified_by: string;
    notes: string;
    thumbnail_url?: string;
  } | null;
}

export interface ForensicAnalysisResult {
  status: string;
  file_name: string;
  sha256: string;
  phash: string;
  database_match: DatabaseMatch;
  trust_score: number;
  risk_level: RiskLevel;
  verdict_title: string;
  confidence_interval: {
    lower: number;
    upper: number;
    confidence_pct: number;
  };
  breakdown: {
    spectral_authenticity: number;
    ela_compression_uniformity: number;
    noise_variance_consistency: number;
    edge_lighting_integrity: number;
    metadata_provenance: number;
    copy_move_integrity?: number;
    chrominance_coherence?: number;
    prnu_sensor_uniformity?: number;
  };
  findings: ForensicFinding[];
  metadata_summary: {
    has_exif: boolean;
    software: string;
    camera: string;
    metadata_score: number;
    raw_tags: Record<string, string>;
  };
  noise_summary: {
    score: number;
    status: string;
    variance_ratio: number;
    quadrant_variances: number[];
    detail: string;
  };
  edge_summary: {
    edge_score: number;
    laplacian_variance: number;
    lighting_entropy: number;
    description: string;
  };
  ela: ElaResult;
  spectral: SpectralResult;
  copymove?: CopyMoveResult;
  chrominance?: ChrominanceResult;
  facial_forensics?: FacialForensicsResult;
  prnu?: NoisePrintResult;
  original_preview: string;
}

export interface CommunityReport {
  id: string;
  sha256: string;
  phash?: string;
  title: string;
  platform: 'X/Twitter' | 'Facebook' | 'Instagram' | 'Reddit' | 'TikTok' | 'YouTube' | 'Other' | string;
  post_url: string;
  reason: string;
  evidence_text: string;
  reporter_handle: string;
  status: 'pending' | 'under_review' | 'confirmed_manipulated' | 'cleared';
  duplicate_count: number;
  viral_velocity_score: number;
  velocity_tier: VelocityTier;
  created_at: string;
  updated_at: string;
  moderator_notes?: string;
  thumbnail_url?: string;
}

export interface PartnerPlatform {
  id: string;
  name: string;
  api_key: string;
  webhook_url: string;
  is_active: boolean;
  total_queries: number;
  flags_submitted: number;
  last_sync: string;
}

export interface GlobalAlert {
  id: string;
  title: string;
  category: string;
  severity: 'CRITICAL' | 'HIGH' | 'WARNING' | 'INFO';
  message: string;
  report_id?: string;
  sha256: string;
  viral_velocity: number;
  created_at: string;
  platforms_affected: string[];
}

export interface SystemStats {
  scans_completed: number;
  flagged_assets: number;
  global_alerts_active: number;
  hash_database_size: number;
  viral_interceptions_today: number;
  partner_queries_24h: number;
  active_disinformation_clusters?: number;
  confirmed_tampered_count?: number;
  active_partners?: number;
  critical_alerts_count?: number;
}

export interface SampleImage {
  id: string;
  title: string;
  type: 'AUTHENTIC' | 'AI_GENERATED' | 'MANIPULATED';
  description: string;
  data_url: string;
}
