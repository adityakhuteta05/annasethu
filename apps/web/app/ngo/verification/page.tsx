'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Building2, 
  RefreshCw, 
  ArrowRight,
  ExternalLink,
  Info
} from 'lucide-react';

export default function NGOVerificationStatusPage() {
  const [status, setStatus] = useState<'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED'>('UNDER_REVIEW');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#fdfbf7] dark:bg-[#121417]">
      {/* Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-4 border-b border-[#e5dec9] dark:border-[#2d3239]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#2d6a4f] text-[#f7f1e3] flex items-center justify-center font-heading text-lg font-bold">
            अ
          </div>
          <div>
            <span className="font-heading font-bold text-lg text-[#1f4d36] dark:text-[#f7f1e3]">
              ANNASETU
            </span>
            <span className="text-[10px] text-[#5c6068] block -mt-1 font-semibold">
              NGO Institutional Verification
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e5dec9] text-xs font-semibold text-[#5c6068] hover:bg-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Status</span>
          </button>
          <Link
            href="/ngo/dashboard"
            className="px-3.5 py-1.5 rounded-xl bg-[#2d6a4f] text-[#f7f1e3] text-xs font-bold hover:bg-[#1b4332]"
          >
            Go to Dashboard &rarr;
          </Link>
        </div>
      </header>

      <div className="max-w-3xl w-full mx-auto py-8 space-y-6">
        
        {/* Status Hero Card */}
        <div className="bg-white dark:bg-[#1c2024] rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-md p-6 sm:p-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5dec9] dark:border-[#2d3239] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-200 text-xs font-bold mb-2">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Verification Status: Under Review</span>
              </div>
              <h1 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                Delhi Roti Bank Relief Foundation
              </h1>
              <p className="text-xs text-[#5c6068] mt-1">
                Application Reference: <span className="font-mono font-bold text-[#23262b]">VER-NGO-2026-88412</span>
              </p>
            </div>

            <div className="text-right text-xs text-[#5c6068] shrink-0">
              <div><strong>Submitted:</strong> Today, 08:30 AM</div>
              <div><strong>Last Updated:</strong> Just Now</div>
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="space-y-4">
            <h2 className="text-sm font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
              Submitted Verification Items
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Organization Registration
                  </div>
                  <div className="text-[11px] text-[#5c6068] mt-0.5">
                    Trust Deed & Registration No. REG-DL-8874-2018 verified.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Permanent Account Number (PAN)
                  </div>
                  <div className="text-[11px] text-[#5c6068] mt-0.5">
                    PAN: AAATD1234C format and checksum verified.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    Authorized Representative
                  </div>
                  <div className="text-[11px] text-[#5c6068] mt-0.5">
                    Dr. Arvind Swaminathan (Executive Director) credentials recorded.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-spin" />
                <div>
                  <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    Government / Public Source Review
                  </div>
                  <div className="text-[11px] text-[#5c6068] mt-0.5">
                    Cross-checking NITI Aayog NGO-DARPAN portal (DL/2021/0291456).
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desk Notes */}
          <div className="p-4 rounded-2xl bg-[#f7f1e3]/60 dark:bg-[#14171a] border border-[#e5dec9] dark:border-[#2d3239] space-y-2">
            <div className="text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#2d6a4f]" />
              <span>Desk Review Notes:</span>
            </div>
            <p className="text-xs text-[#5c6068]">
              "Primary registration certificates and 80G tax status have been validated against submitted records. Your receiving dock at Paharganj Shelter has been mapped. Standard desk turnaround is 2–4 hours during operational hours."
            </p>
          </div>

          {/* Legal Transparency Disclaimer */}
          <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 text-blue-900 dark:text-blue-300 text-xs flex items-start gap-2.5">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong>Institutional Disclaimer:</strong> AnnaSetu is a technology platform connecting food surplus with verified community need. AnnaSetu does not issue government certifications or act as a statutory authority.
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-[#e5dec9] dark:border-[#2d3239]">
            <Link
              href="/ngo/profile"
              className="text-xs font-semibold text-[#5c6068] hover:text-[#1f4d36] underline"
            >
              Update Organization Documents &rarr;
            </Link>

            <Link
              href="/ngo/dashboard"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-[#f7f1e3] text-xs font-bold text-center shadow-xs"
            >
              Enter NGO Workspace &rarr;
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
