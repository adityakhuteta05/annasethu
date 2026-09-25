'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  Calendar,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export default function DonorReportsPage() {
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const reportsList = [
    {
      id: 'REP-2026-09-01',
      title: 'September 2026 Comprehensive Sustainability Report',
      period: '1 Sep 2026 – 24 Sep 2026',
      rescued_kg: 290.0,
      meals: 580,
      missions: 21,
      co2e: 725.0,
      status: 'AUDITED_AND_SEALED',
      type: 'MONTHLY_SUMMARY',
    },
    {
      id: 'REP-2026-08-01',
      title: 'August 2026 Comprehensive Sustainability Report',
      period: '1 Aug 2026 – 31 Aug 2026',
      rescued_kg: 290.0,
      meals: 580,
      missions: 20,
      co2e: 725.0,
      status: 'AUDITED_AND_SEALED',
      type: 'MONTHLY_SUMMARY',
    },
    {
      id: 'REP-2026-Q2-01',
      title: 'Q2 2026 Food Waste Diversion & Carbon Offset Report',
      period: '1 Apr 2026 – 30 Jun 2026',
      rescued_kg: 660.0,
      meals: 1320,
      missions: 45,
      co2e: 1650.0,
      status: 'AUDITED_AND_SEALED',
      type: 'CSR_QUARTERLY',
    },
    {
      id: 'REP-2025-ANNUAL',
      title: 'FY 2025-26 Annual Environmental Social Governance (ESG) Audit',
      period: '1 Apr 2025 – 31 Mar 2026',
      rescued_kg: 2450.0,
      meals: 4900,
      missions: 168,
      co2e: 6125.0,
      status: 'CERTIFIED_ANNUAL',
      type: 'ANNUAL_AUDIT',
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="border-b border-slate-200 border-slate-200 pb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
          Corporate Social Responsibility Documentation
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          AnnaSetu Verified Impact Reporting
        </h1>
        <p className="text-xs text-slate-500">
          Cryptographically timestamped documentation formatted for ESG disclosures and corporate compliance audits
        </p>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reportsList.map((r) => (
          <div
            key={r.id}
            className="p-6 rounded-3xl bg-white border border-slate-200 border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#1f4d36] transition-all"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 dark:text-[#4f9d3a]">
                  {r.id}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  ✓ Certified Audit Trail
                </span>
              </div>
              <h3 className="font-bold tracking-tight text-base text-slate-900 dark:text-white">
                {r.title}
              </h3>
              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                <span>Period: {r.period}</span>
                <span>•</span>
                <span>{r.missions} verified deliveries</span>
                <span>•</span>
                <span className="font-bold text-slate-900 dark:text-[#4f9d3a]">{r.rescued_kg} kg rescued</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSelectedReport(r)}
                className="px-4 py-2 rounded-xl border border-[#1f4d36] text-slate-900 dark:text-[#4f9d3a] text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Full Audit</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report Modal Viewer */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white max-w-2xl w-full rounded-3xl p-8 border border-slate-200 border-slate-200 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  Official Verification Document
                </span>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  {selectedReport.title}
                </h2>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-xs text-slate-500 hover:text-slate-900 p-1"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Issuing Authority:</span>
                  <span className="font-bold text-slate-900 dark:text-[#4f9d3a]">AnnaSetu Verified Impact Architecture</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Donor Entity:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">The Oberoi Grand Kitchens</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">GSTIN Reference:</span>
                  <span className="font-mono">07AAACC1206D1Z1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">FSSAI Clearance:</span>
                  <span className="font-mono">12345678901234</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                  <span className="text-slate-500 block">Weight Rescued</span>
                  <span className="text-base font-bold text-slate-900 dark:text-[#4f9d3a]">{selectedReport.rescued_kg} kg</span>
                </div>
                <div className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                  <span className="text-slate-500 block">Meals Equivalent</span>
                  <span className="text-base font-bold text-[#e0662b]">{selectedReport.meals}</span>
                </div>
                <div className="p-3 rounded-xl border border-gray-100 dark:border-gray-800 text-center">
                  <span className="text-slate-500 block">CO₂e Avoided</span>
                  <span className="text-base font-bold text-emerald-700">{selectedReport.co2e} kg</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed pt-2">
                This document certifies that the aforementioned surplus food was inspected, sealed, and delivered directly to registered non-profit welfare institutions via verifiable dual-OTP custody protocols.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 rounded-xl border text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Certificate</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
