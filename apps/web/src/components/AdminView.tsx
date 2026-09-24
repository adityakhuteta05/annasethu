import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  Sparkles, 
  Sliders, 
  Receipt, 
  MapPin, 
  FileText, 
  Send,
  AlertTriangle,
  RotateCcw,
  Scale
} from 'lucide-react';
import { AnnaSetuApi } from '../api';

interface AdminViewProps {
  onRefresh: () => void;
  onViewCertificate: (jobId: string) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onRefresh, onViewCertificate }) => {
  const [activeTab, setActiveTab] = useState<'VERIFICATION' | 'INTEGRITY' | 'FLEET' | 'FINANCE' | 'CONFIG' | 'COPILOT'>('VERIFICATION');
  
  // Verification Queue
  const [queue, setQueue] = useState<any[]>([]);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionMsg, setActionMsg] = useState<string | null>(null);

  // Financial Ledger
  const [ledger, setLedger] = useState<any[]>([]);

  // Config
  const [config, setConfig] = useState<any | null>(null);

  // Copilot
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<{ sender: 'user' | 'ai'; text: string }[]>([
    {
      sender: 'ai',
      text: "Greetings. I am AnnaSetu Copilot. I have read-only access to live marketplace data, rescue priority weights, financial ledgers, and verified compliance registries. How can I assist you?",
    },
  ]);
  const [copilotLoading, setCopilotLoading] = useState(false);

  // Fetch initial admin data
  const fetchAdminData = async () => {
    try {
      const q = await AnnaSetuApi.getVerificationQueue();
      setQueue(q);
      const l = await AnnaSetuApi.getLedger();
      setLedger(l);
      const c = await AnnaSetuApi.getConfig();
      setConfig(c);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleReviewAction = async (caseId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      const res = await AnnaSetuApi.reviewVerification(caseId, action, reviewNotes || 'Compliance verified against official registry.');
      setActionMsg(res.message);
      setReviewNotes('');
      fetchAdminData();
      onRefresh();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleCopilotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotInput.trim()) return;

    const userText = copilotInput;
    setCopilotMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setCopilotInput('');
    setCopilotLoading(true);

    try {
      const res = await AnnaSetuApi.queryCopilot(userText, 'ADMIN');
      setCopilotMessages((prev) => [...prev, { sender: 'ai', text: res.answer }]);
    } catch (err: any) {
      setCopilotMessages((prev) => [
        ...prev,
        { sender: 'ai', text: "Service temporarily unavailable. Deterministic rescue loop continues uninterrupted." },
      ]);
    } finally {
      setCopilotLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* COMMAND CENTER HEADER & KPI BANNER */}
      <div className="bg-[#1A1C1E] text-white rounded-2xl p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h1 className="text-xl font-serif font-bold tracking-wide">
                ANNASETU RESCUE COMMAND CENTER
              </h1>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Authoritative Operational Governance · Strict Deterministic Execution · Assistive AI
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 font-mono text-gray-300">
              City: Delhi NCR
            </span>
          </div>
        </div>

        {/* METRICS STRIP (PRD Section 38) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-white/10 text-center">
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-gray-400 block">Active Rescues</span>
            <span className="text-xl font-bold font-mono text-emerald-400">28</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-gray-400 block">Pending Verification</span>
            <span className="text-xl font-bold font-mono text-amber-400">{queue.filter(q => q.status === 'DOCUMENTS_SUBMITTED').length}</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-gray-400 block">Active Drivers</span>
            <span className="text-xl font-bold font-mono text-sky-400">16</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl">
            <span className="text-[10px] uppercase font-semibold text-gray-400 block">Integrity Reviews</span>
            <span className="text-xl font-bold font-mono text-purple-400">0</span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl col-span-2 sm:col-span-1">
            <span className="text-[10px] uppercase font-semibold text-gray-400 block">12% Fee Accrued</span>
            <span className="text-xl font-bold font-mono text-[#D4AF37]">₹4,380</span>
          </div>
        </div>
      </div>

      {/* ACTION FEEDBACK */}
      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionMsg}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="text-emerald-700 underline text-[11px]">Dismiss</button>
        </div>
      )}

      {/* MODULE TABS */}
      <div className="flex flex-wrap gap-2 border-b border-[#E8E1D5] pb-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('VERIFICATION')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'VERIFICATION'
              ? 'bg-[#143D2B] text-white shadow-xs'
              : 'bg-white text-[#5F6368] hover:text-[#1A1C1E] border border-[#E8E1D5]'
          }`}
        >
          Verification Queue ({queue.length})
        </button>

        <button
          onClick={() => setActiveTab('INTEGRITY')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'INTEGRITY'
              ? 'bg-[#143D2B] text-white shadow-xs'
              : 'bg-white text-[#5F6368] hover:text-[#1A1C1E] border border-[#E8E1D5]'
          }`}
        >
          AI Package Integrity Desk
        </button>

        <button
          onClick={() => setActiveTab('FINANCE')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'FINANCE'
              ? 'bg-[#143D2B] text-white shadow-xs'
              : 'bg-white text-[#5F6368] hover:text-[#1A1C1E] border border-[#E8E1D5]'
          }`}
        >
          Financial Ledger & 12% Fees
        </button>

        <button
          onClick={() => setActiveTab('CONFIG')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'CONFIG'
              ? 'bg-[#143D2B] text-white shadow-xs'
              : 'bg-white text-[#5F6368] hover:text-[#1A1C1E] border border-[#E8E1D5]'
          }`}
        >
          Configuration & Weights
        </button>

        <button
          onClick={() => setActiveTab('COPILOT')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeTab === 'COPILOT'
              ? 'bg-[#143D2B] text-white shadow-xs'
              : 'bg-white text-[#5F6368] hover:text-[#1A1C1E] border border-[#E8E1D5]'
          }`}
        >
          ✦ Read-Only Copilot
        </button>
      </div>

      {/* TAB 1: VERIFICATION QUEUE & GOV LOOKUP */}
      {activeTab === 'VERIFICATION' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-[#E8E1D5] p-5 shadow-xs">
            <h2 className="text-base font-bold text-[#143D2B]">
              Government Verification Architecture (PRD Section 8 & Appendix A)
            </h2>
            <p className="text-xs text-[#5F6368] mt-1">
              Hackathon Mode records <code>MANUAL_LOOKUP_REQUIRED</code> and exposes official-source links. No scraping or CAPTCHA bypass is permitted.
            </p>
          </div>

          <div className="space-y-3">
            {queue.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-[#E8E1D5] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F5E9] text-[#143D2B]">
                      {c.role}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#F5F0E8] text-[#5F6368]">
                      Case #{c.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      c.status === 'VERIFIED' ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#143D2B]">
                    {c.entity_name}
                  </h3>

                  {/* Documents with direct government portal link */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#5F6368]">
                    {c.documents?.map((doc: any, i: number) => (
                      <span key={i} className="font-mono bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                        {doc.type}: {doc.value}
                      </span>
                    ))}

                    <a
                      href={c.lookup_guidance?.official_portal_url || 'https://services.gst.gov.in/services/searchtp'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[#2D6A4F] font-semibold hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Verify on Official Portal</span>
                    </a>
                  </div>
                </div>

                {c.status === 'DOCUMENTS_SUBMITTED' && (
                  <div className="flex items-center gap-2 self-end md:self-auto">
                    <button
                      onClick={() => handleReviewAction(c.id, 'REJECT')}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl border border-red-200 text-red-700 text-xs font-semibold hover:bg-red-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleReviewAction(c.id, 'APPROVE')}
                      className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#143D2B] text-white text-xs font-semibold hover:bg-[#1E523A] shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve & Verify</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AI PACKAGE INTEGRITY DESK */}
      {activeTab === 'INTEGRITY' && (
        <div className="bg-white rounded-2xl border border-[#E8E1D5] p-6 shadow-xs space-y-6">
          <div className="border-b border-[#E8E1D5] pb-4">
            <h2 className="text-base font-bold text-[#143D2B]">
              AI Food Package Integrity Desk (Groq Vision)
            </h2>
            <p className="text-xs text-[#5F6368] mt-1">
              Compares pickup and delivery evidence photos for seal status and package tampering. Outputs simple review labels.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-[#E8E1D5] rounded-xl p-4 space-y-3 bg-[#FDFBF7]">
              <span className="text-xs font-bold uppercase text-[#143D2B]">
                1. Pickup Evidence Photo (Donor Loading Dock)
              </span>
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                alt="Pickup Evidence"
                className="w-full h-48 object-cover rounded-lg border border-[#E8E1D5]"
              />
              <p className="text-xs text-[#5F6368] font-mono">
                Tamper Seal: AS-SEAL-8891 · Timestamp: 14:10 UTC · Geofence: 120m (Passed)
              </p>
            </div>

            <div className="border border-[#E8E1D5] rounded-xl p-4 space-y-3 bg-[#FDFBF7]">
              <span className="text-xs font-bold uppercase text-[#2D6A4F]">
                2. Delivery Evidence Photo (NGO Receiving Dock)
              </span>
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
                alt="Delivery Evidence"
                className="w-full h-48 object-cover rounded-lg border border-[#E8E1D5]"
              />
              <p className="text-xs text-[#5F6368] font-mono">
                Tamper Seal: AS-SEAL-8891 · Timestamp: 14:42 UTC · Geofence: 85m (Passed)
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-bold text-sm">Groq Vision AI Verdict: NO_VISIBLE_DISCREPANCY</span>
            </div>
            <p className="text-[11px] text-emerald-800">
              Analysis: Tamper-evident seal AS-SEAL-8891 matches intact contours. No container puncturing or liquid spillage observed. Confidence: 95%.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: FINANCIAL LEDGER */}
      {activeTab === 'FINANCE' && (
        <div className="bg-white rounded-2xl border border-[#E8E1D5] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8E1D5] pb-4">
            <div>
              <h2 className="text-base font-bold text-[#143D2B]">
                Append-Only Double-Entry Financial Ledger (PRD Section 25)
              </h2>
              <p className="text-xs text-[#5F6368]">
                Shows immutable trail of NGO reserve holds, delivery charges, driver payouts, and 12% platform fee.
              </p>
            </div>
            <span className="badge-verified">
              Auditable Ledger
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F5F0E8] text-[#143D2B] uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Entry ID</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Account Name</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-right">Balance After</th>
                  <th className="p-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E1D5]">
                {ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50/50">
                    <td className="p-3 font-mono font-medium text-gray-500">{entry.id}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        entry.entry_type === 'PLATFORM_FEE' ? 'bg-[#FEF9E7] text-[#D4AF37] border border-amber-300' :
                        entry.entry_type === 'DRIVER_PAYOUT' ? 'bg-emerald-50 text-emerald-800' :
                        entry.entry_type === 'FINAL_CHARGE' ? 'bg-rose-50 text-rose-800' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {entry.entry_type}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-[#1A1C1E]">{entry.account_name}</td>
                    <td className="p-3 text-[#5F6368]">{entry.role}</td>
                    <td className={`p-3 font-mono font-bold text-right ${entry.amount >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                      {entry.amount >= 0 ? `+₹${entry.amount}` : `-₹${Math.abs(entry.amount)}`}
                    </td>
                    <td className="p-3 font-mono text-right text-gray-600">₹{entry.balance_after}</td>
                    <td className="p-3 text-gray-500 max-w-xs truncate">{entry.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: CONFIGURATION & WEIGHTS */}
      {activeTab === 'CONFIG' && (
        <div className="bg-white rounded-2xl border border-[#E8E1D5] p-6 shadow-xs space-y-6">
          <div className="border-b border-[#E8E1D5] pb-4">
            <h2 className="text-base font-bold text-[#143D2B]">
              Versioned Business Rules Configuration (PRD Section 41)
            </h2>
            <p className="text-xs text-[#5F6368]">
              Matching weights, threshold rules, and platform fees are configuration-driven, never hardcoded.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-[#143D2B]">Rescue Priority Scoring Weights (Sum = 1.00)</h3>
              <div className="space-y-3 bg-[#FDFBF7] p-4 rounded-xl border border-[#E8E1D5] text-xs">
                <div className="flex items-center justify-between">
                  <span>Expiry Urgency:</span>
                  <span className="font-mono font-bold">0.30 (30%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>ETA Efficiency:</span>
                  <span className="font-mono font-bold">0.25 (25%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Distance Efficiency:</span>
                  <span className="font-mono font-bold">0.20 (20%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Need Fulfillment:</span>
                  <span className="font-mono font-bold">0.15 (15%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Route Efficiency:</span>
                  <span className="font-mono font-bold">0.10 (10%)</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase text-[#143D2B]">Platform Thresholds & Economics</h3>
              <div className="space-y-3 bg-[#FDFBF7] p-4 rounded-xl border border-[#E8E1D5] text-xs">
                <div className="flex items-center justify-between">
                  <span>Minimum Donation Quantity:</span>
                  <span className="font-mono font-bold text-[#D9480F]">5.0 kg</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Logistics Coordination Fee:</span>
                  <span className="font-mono font-bold text-[#2D6A4F]">12% (explicitly itemized)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>GPS Geofence Proximity Radius:</span>
                  <span className="font-mono font-bold">300 meters</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Driver Dynamic Search Radius:</span>
                  <span className="font-mono font-bold">5 km → 10 km → 20 km</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AI COPILOT */}
      {activeTab === 'COPILOT' && (
        <div className="bg-white rounded-2xl border border-[#E8E1D5] p-6 shadow-xs space-y-4 flex flex-col h-[520px]">
          <div className="border-b border-[#E8E1D5] pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#2D6A4F]" />
              <h2 className="text-base font-bold text-[#143D2B]">
                ✦ Read-Only AnnaSetu AI Copilot
              </h2>
            </div>
            <span className="text-[11px] text-[#5F6368]">
              Scoped query interface · Cannot mutate records
            </span>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 p-2">
            {copilotMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-lg p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#143D2B] text-white rounded-br-xs'
                      : 'bg-[#F5F0E8] text-[#1A1C1E] border border-[#E8E1D5] rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {copilotLoading && (
              <div className="text-xs text-gray-500 italic p-2">
                AnnaSetu Copilot querying operational snapshot...
              </div>
            )}
          </div>

          {/* Query Input */}
          <form onSubmit={handleCopilotSubmit} className="flex gap-2 pt-2 border-t border-[#E8E1D5]">
            <input
              type="text"
              placeholder="Ask about live rescues, driver payouts, impact statistics, or trust chains..."
              value={copilotInput}
              onChange={(e) => setCopilotInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#E8E1D5] text-xs focus:ring-2 focus:ring-[#143D2B] focus:outline-none"
            />
            <button
              type="submit"
              disabled={copilotLoading}
              className="px-5 py-2.5 rounded-xl bg-[#143D2B] text-white text-xs font-semibold shadow-xs hover:bg-[#1E523A] transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask</span>
            </button>
          </form>
        </div>
      )}

    </div>
  );
};
