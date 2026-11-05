import React, { useState, useEffect } from 'react';
import { GlobalAlert } from '../types';
import { 
  Bell, 
  Radio, 
  ShieldAlert, 
  Check, 
  Flame, 
  ExternalLink, 
  Sliders, 
  Mail, 
  CheckCircle2 
} from 'lucide-react';
import { AlertBadge } from '../components/AlertBadge';
import { api } from '../services/api';

interface NotificationsPageProps {
  alerts: GlobalAlert[];
  onViewReport?: (reportId: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  alerts,
  onViewReport
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'deepfakes',
    'election_media',
    'financial_fraud'
  ]);
  const [emailInput, setEmailInput] = useState<string>('');
  const [subscribeSuccess, setSubscribeSuccess] = useState<string | null>(null);

  const categories = [
    { id: 'deepfakes', label: 'Deepfakes & Video Impersonation', desc: 'Face swaps, audio clones, and puppet head synthesis' },
    { id: 'election_media', label: 'Election & Political Disinformation', desc: 'Fabricated ballot memos and political rallies' },
    { id: 'synthetic_avatars', label: 'Synthetic AI Social Avatars', desc: 'Diffusion profile networks operating fraud rings' },
    { id: 'financial_fraud', label: 'Financial Statements & Audit Splicing', desc: 'Tampered bank reports and market manipulating graphics' },
    { id: 'breaking_news', label: 'Disaster & Warzone Splicing', desc: 'Altered storm, conflict, and crisis footage' }
  ];

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    );
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.subscribeAlerts(selectedCategories, emailInput);
      setSubscribeSuccess('Alert subscription active! You will receive cryptographic alerts when viral velocity exceeds threshold.');
      setTimeout(() => setSubscribeSuccess(null), 4000);
      setEmailInput('');
    } catch (err: any) {
      alert(err.message || 'Subscription failed.');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-red-400">Mechanism 2-D</span>
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Global Alerts & Incident Dispatch</h2>
        <p className="text-sm text-gray-400 mt-1">
          High-priority notifications dispatched when an asset surpasses viral containment thresholds across federated networks.
        </p>
      </div>

      {/* Live Alerts Stream */}
      <div className="space-y-4">
        <h3 className="text-base font-semibold text-white flex items-center space-x-2">
          <Radio className="w-4 h-4 text-red-400 animate-pulse" />
          <span>Active High-Priority Outbreak Advisories ({alerts.length})</span>
        </h3>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-5 rounded-2xl bg-slate-deep/75 border border-slate-border hover:border-red-500/40 transition-all space-y-3 shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <AlertBadge severity={alert.severity} />
                  <span className="text-xs text-gray-400 font-mono">#{alert.id}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-semibold text-amber-400 flex items-center space-x-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>Viral Velocity: {alert.viral_velocity}/100</span>
                  </span>
                  <span className="text-gray-500 text-xs">•</span>
                  <span className="text-[11px] text-gray-400">
                    {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              <h4 className="text-base font-bold text-white">{alert.title}</h4>
              <p className="text-xs text-gray-300 leading-relaxed">{alert.message}</p>

              <div className="pt-2 border-t border-slate-border/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">Platforms Affected:</span>
                  <div className="flex items-center space-x-1.5">
                    {alert.platforms_affected.map((p, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-navy text-cyan text-[10px] font-medium border border-slate-border">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {alert.report_id && onViewReport && (
                  <button
                    onClick={() => onViewReport(alert.report_id!)}
                    className="text-cyan hover:underline font-semibold flex items-center space-x-1"
                  >
                    <span>Inspect Forensic Dossier</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription Panel */}
      <div className="p-6 rounded-2xl bg-slate-deep/70 border border-slate-border space-y-6">
        <div>
          <h3 className="text-base font-semibold text-white">Subscribe to Specialized Risk Streams</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Receive automated notifications when coordinated manipulation is identified in your sectors of interest.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const isChecked = selectedCategories.includes(cat.id);
            return (
              <div
                key={cat.id}
                onClick={() => toggleCategory(cat.id)}
                className={`p-3.5 rounded-xl border cursor-pointer select-none transition-all flex items-start space-x-3 ${
                  isChecked
                    ? 'bg-navy border-cyan/60 shadow-sm'
                    : 'bg-navy/40 border-slate-border text-gray-400 hover:border-slate-border/80'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  className="mt-0.5 w-4 h-4 rounded text-cyan accent-cyan focus:ring-0 bg-slate-deep border-slate-border"
                />
                <div className="space-y-0.5">
                  <span className={`text-xs font-semibold block ${isChecked ? 'text-white' : 'text-gray-400'}`}>
                    {cat.label}
                  </span>
                  <span className="text-[11px] text-gray-400 block leading-snug">
                    {cat.desc}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSubscribe} className="pt-2">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="Enter alert notification email or webhook target..."
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-navy border border-slate-border text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-electric to-cyan text-white text-xs font-bold shadow-md hover:brightness-110 transition"
            >
              Activate Risk Subscription
            </button>
          </div>
        </form>

        {subscribeSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{subscribeSuccess}</span>
          </div>
        )}
      </div>
    </div>
  );
};
