import React, { useState, useEffect } from 'react';
import { PartnerPlatform } from '../types';
import { 
  Cpu, 
  Key, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Code, 
  Copy, 
  Search, 
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { api } from '../services/api';

export const PartnerApiPage: React.FC = () => {
  const [partners, setPartners] = useState<PartnerPlatform[]>([]);
  const [disclaimer, setDisclaimer] = useState<string>('');
  const [checkHashInput, setCheckHashInput] = useState<string>('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  const [thresholdInput, setThresholdInput] = useState<number>(10);
  const [checkResult, setCheckResult] = useState<any | null>(null);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  // New partner registration
  const [newPlatformName, setNewPlatformName] = useState<string>('');
  const [newContactEmail, setNewContactEmail] = useState<string>('');
  const [newWebhookUrl, setNewWebhookUrl] = useState<string>('');
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPartners();
  }, []);

  const loadPartners = async () => {
    try {
      const res = await api.getPartners();
      setPartners(res.partners);
      setDisclaimer(res.disclaimer);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteCheckHash = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsChecking(true);
      const res = await api.checkHash(checkHashInput.trim(), checkHashInput.trim(), thresholdInput);
      setCheckResult(res);
    } catch (err: any) {
      alert(err.message || 'Check-hash failed.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.registerPartner(newPlatformName, newContactEmail, newWebhookUrl);
      setRegisterSuccess(`API Provisioned! Key: ${res.partner.api_key}`);
      loadPartners();
      setNewPlatformName('');
      setNewContactEmail('');
      setNewWebhookUrl('');
    } catch (err: any) {
      alert(err.message || 'Registration failed.');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan">Mechanism 2-C</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">Platform Partner Integration API</h2>
        <p className="text-sm text-gray-400 mt-1">
          High-throughput bilateral REST APIs enabling verified platforms and fact-checking institutions to query and sync cryptographic content warnings in real time.
        </p>
      </div>

      {/* Mandatory Bilateral Governance Notice */}
      <div className="p-5 rounded-2xl bg-amber-950/40 border border-amber-500/50 flex items-start space-x-3.5 text-xs text-amber-200">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-amber-300">Decentralized Governance & Content Labeling Principle</h4>
          <p className="leading-relaxed text-amber-100">
            {disclaimer || "True Lens operates via mutual API integration. Content on unpartnered platforms cannot be forcibly moderated without bilateral API agreements and cryptographic trust federation."}
          </p>
        </div>
      </div>

      {/* Interactive Hash Check Sandbox */}
      <div className="p-6 rounded-2xl bg-slate-deep/70 border border-slate-border space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="w-5 h-5 text-electric" />
          <h3 className="text-base font-semibold text-white">Live Endpoint Sandbox: POST /api/v1/moderation/check-hash</h3>
        </div>
        <p className="text-xs text-gray-400">
          Simulate a real-time pre-publication check from an external client or CMS.
        </p>

        <form onSubmit={handleExecuteCheckHash} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="Enter SHA-256 binary hash or 16-hex pHash..."
              value={checkHashInput}
              onChange={(e) => setCheckHashInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-navy border border-slate-border text-xs text-white font-mono focus:outline-none focus:border-cyan"
            />
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 whitespace-nowrap">Hamming Tol:</span>
              <input
                type="number"
                min="0"
                max="32"
                value={thresholdInput}
                onChange={(e) => setThresholdInput(parseInt(e.target.value) || 10)}
                className="w-16 px-2 py-2 rounded-xl bg-navy border border-slate-border text-xs text-cyan font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={isChecking}
              className="px-5 py-2.5 rounded-xl bg-electric hover:bg-electric-hover text-white text-xs font-semibold flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              <span>Verify Fingerprint</span>
            </button>
          </div>
        </form>

        {/* Check Result JSON / Badge */}
        {checkResult && (
          <div className="mt-4 p-4 rounded-xl bg-navy-dark border border-slate-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Response Payload (HTTP 200 OK):</span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                checkResult.matched ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}>
                {checkResult.matched ? 'MATCH CONFIRMED (Tampered Asset)' : 'NO MATCH RECORDED (Zero Hash Flag)'}
              </span>
            </div>
            <pre className="p-3 rounded-lg bg-navy/80 font-mono text-[11px] text-cyan overflow-x-auto">
              {JSON.stringify(checkResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Registered Partners Table */}
      <div className="p-6 rounded-2xl bg-slate-deep/70 border border-slate-border space-y-4">
        <h3 className="text-base font-semibold text-white">Federated Platform Partners</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-navy border-b border-slate-border text-gray-400 text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">Platform Name</th>
                <th className="py-2.5 px-3">API Key Prefix</th>
                <th className="py-2.5 px-3">Webhook Endpoint</th>
                <th className="py-2.5 px-3">24h Queries</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-border/50">
              {partners.map((p) => (
                <tr key={p.id} className="hover:bg-navy/40">
                  <td className="py-3 px-3 font-semibold text-white">{p.name}</td>
                  <td className="py-3 px-3 font-mono text-cyan">{p.api_key.substring(0, 16)}...</td>
                  <td className="py-3 px-3 font-mono text-gray-400 text-[11px] max-w-xs truncate">{p.webhook_url}</td>
                  <td className="py-3 px-3 font-mono text-white">{p.total_queries.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Active Sync
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Partner Provisioning Form */}
      <div className="p-6 rounded-2xl bg-slate-deep/70 border border-slate-border space-y-4">
        <h3 className="text-base font-semibold text-white">Provision New Platform Partner Credentials</h3>
        <p className="text-xs text-gray-400">
          Register an external fact-checking agency, social platform, or moderation consortium.
        </p>

        <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-gray-300 font-semibold mb-1">Organization / Platform:</label>
            <input
              type="text"
              required
              placeholder="e.g. Bluesky Trust Consortium"
              value={newPlatformName}
              onChange={(e) => setNewPlatformName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy border border-slate-border text-white"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Contact Email:</label>
            <input
              type="email"
              required
              placeholder="trust@platform.org"
              value={newContactEmail}
              onChange={(e) => setNewContactEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy border border-slate-border text-white"
            />
          </div>

          <div>
            <label className="block text-gray-300 font-semibold mb-1">Webhook URL (Optional):</label>
            <input
              type="url"
              placeholder="https://platform.org/api/truelens-flag"
              value={newWebhookUrl}
              onChange={(e) => setNewWebhookUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-navy border border-slate-border text-white"
            />
          </div>

          <div className="sm:col-span-3 flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan hover:bg-cyan-hover text-navy-dark font-bold text-xs shadow-md transition"
            >
              Generate Partner API Key
            </button>
          </div>
        </form>

        {registerSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono">
            {registerSuccess}
          </div>
        )}
      </div>
    </div>
  );
};
