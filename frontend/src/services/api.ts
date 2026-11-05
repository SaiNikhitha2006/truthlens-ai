import {
  ForensicAnalysisResult,
  CommunityReport,
  PartnerPlatform,
  GlobalAlert,
  SystemStats,
  SampleImage,
  ElaResult
} from '../types';

const API_BASE = `${(import.process.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')}/api/v1`;

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorMsg = `Server error ${res.status}`;
    try {
      const errJson = await res.json();
      errorMsg = errJson.detail || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export const api = {
  // Forensics Engine
  async analyzeUpload(file: File): Promise<ForensicAnalysisResult> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/forensics/analyze-upload`, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<ForensicAnalysisResult>(res);
  },

  async analyzeUrl(imageUrl?: string, imageBase64?: string): Promise<ForensicAnalysisResult> {
    const res = await fetch(`${API_BASE}/forensics/analyze-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl, image_base64: imageBase64 }),
    });
    return handleResponse<ForensicAnalysisResult>(res);
  },

  async tuneEla(imageBase64: string, quality: number, scale: number, colormap: string): Promise<ElaResult> {
    const res = await fetch(`${API_BASE}/forensics/tune-ela`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: imageBase64, quality, scale, colormap }),
    });
    return handleResponse<ElaResult>(res);
  },

  async getSamples(): Promise<SampleImage[]> {
    const res = await fetch(`${API_BASE}/forensics/samples`);
    return handleResponse<SampleImage[]>(res);
  },

  // Moderation / Hash Database
  async checkHash(sha256?: string, phash?: string, threshold: number = 10): Promise<any> {
    const res = await fetch(`${API_BASE}/moderation/check-hash`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sha256, phash, threshold }),
    });
    return handleResponse<any>(res);
  },

  async flagContent(payload: {
    sha256: string;
    phash?: string;
    title: string;
    category: string;
    risk_level?: string;
    source_platform: string;
    post_url?: string;
    evidence_text?: string;
    thumbnail_url?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE}/moderation/flag`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  // Community Reports
  async getReports(platform?: string, status?: string, search?: string): Promise<{ total: number; reports: CommunityReport[] }> {
    const params = new URLSearchParams();
    if (platform && platform !== 'all') params.append('platform', platform);
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);

    const res = await fetch(`${API_BASE}/reports?${params.toString()}`);
    return handleResponse<{ total: number; reports: CommunityReport[] }>(res);
  },

  async getReportById(reportId: string): Promise<{ report: CommunityReport; moderation_record: any; shareable_url: string; viral_warning_active: boolean }> {
    const res = await fetch(`${API_BASE}/reports/${reportId}`);
    return handleResponse<any>(res);
  },

  async submitReport(payload: {
    sha256: string;
    phash?: string;
    title: string;
    platform: string;
    post_url: string;
    reason: string;
    evidence_text: string;
    reporter_handle?: string;
    thumbnail_url?: string;
  }): Promise<{ status: string; message: string; report: CommunityReport; is_duplicate_cluster: boolean }> {
    const res = await fetch(`${API_BASE}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<any>(res);
  },

  async updateReportStatus(reportId: string, status: string, notes?: string, addToGlobal: boolean = true): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/${reportId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, moderator_notes: notes, add_to_global_hashes: addToGlobal }),
    });
    return handleResponse<any>(res);
  },

  // Partners API
  async getPartners(): Promise<{ partners: PartnerPlatform[]; disclaimer: string }> {
    const res = await fetch(`${API_BASE}/partners`);
    return handleResponse<any>(res);
  },

  async registerPartner(platformName: string, contactEmail: string, webhookUrl?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/partners/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform_name: platformName, contact_email: contactEmail, webhook_url: webhookUrl }),
    });
    return handleResponse<any>(res);
  },

  async testWebhook(partnerId: string, sampleHash?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/partners/test-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partner_id: partnerId, sample_hash: sampleHash }),
    });
    return handleResponse<any>(res);
  },

  // Global Alerts
  async getAlerts(): Promise<{ alerts: GlobalAlert[]; active_count: number }> {
    const res = await fetch(`${API_BASE}/alerts`);
    return handleResponse<any>(res);
  },

  async subscribeAlerts(categories: string[], email?: string, webhookUrl?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/alerts/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categories, email, webhook_url: webhookUrl }),
    });
    return handleResponse<any>(res);
  },

  // System Stats
  async getStats(): Promise<{ stats: SystemStats }> {
    const res = await fetch(`${API_BASE}/stats`);
    return handleResponse<{ stats: SystemStats }>(res);
  }
};
