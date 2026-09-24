'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Download,
  Eye,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  X,
  Printer
} from 'lucide-react';

export default function NGOReportsPage() {
  const [selectedReport, setSelectedReport] = useState<any | null>(null);

  const reports = [
    {
      id: 'REP-FR-0926',
      title: 'Food Received Report (September 2026)',
      type: 'FOOD_RECEIVED',
      period: 'Sep 1 – Sep 25, 2026',
      recordsCount: 38,
      totalWeightKg: 846.0,
      description: 'Itemized log of every food lot received, sorted by donor, category, and temperature seal verification.',
      previewData: [
        { date: '2026-09-25', donor: 'The Grand Palace Hotel', item: 'Vegetarian Pulao & Dal', weight: '25 kg', seal: 'AN-SEAL-88219', status: 'VERIFIED' },
        { date: '2026-09-24', donor: 'Star Supermarket CP', item: 'Sandwiches & Bakery Packs', weight: '18 kg', seal: 'AN-SEAL-88190', status: 'VERIFIED' },
        { date: '2026-09-24', donor: 'Royal Feast Banquets', item: 'Cooked Rice & Dal', weight: '30 kg', seal: 'AN-SEAL-88172', status: 'VERIFIED' },
        { date: '2026-09-23', donor: 'Imperial Caterers', item: 'Vegetable Biryani Pots', weight: '45 kg', seal: 'AN-SEAL-88155', status: 'VERIFIED' },
      ]
    },
    {
      id: 'REP-NF-0926',
      title: 'Need Fulfillment Report',
      type: 'NEED_FULFILLMENT',
      period: 'Monthly Aggregated',
      recordsCount: 42,
      totalWeightKg: 1040.0,
      description: 'Audit tracking how daily scheduled requirements for Breakfast, Lunch, and Dinner were met.',
      previewData: [
        { date: '2026-09-25', shift: 'Breakfast', required: '60 kg', fulfilled: '40 kg', rate: '67%' },
        { date: '2026-09-25', shift: 'Lunch', required: '100 kg', fulfilled: '75 kg', rate: '75%' },
        { date: '2026-09-25', shift: 'Dinner', required: '80 kg', fulfilled: '25 kg (In Transit)', rate: '100%' },
      ]
    },
    {
      id: 'REP-DEL-0926',
      title: 'Delivery & Logistics Custody Report',
      type: 'DELIVERY_LOGISTICS',
      period: 'Last 30 Days',
      recordsCount: 38,
      totalWeightKg: 846.0,
      description: 'Chain-of-custody verification records including driver identity, transit durations, and OTP handoffs.',
      previewData: [
        { deliveryId: 'DEL-2026-001', driver: 'Rahul Sharma', distance: '2.4 km', duration: '14 min', otpStatus: 'VERIFIED' },
        { deliveryId: 'DEL-2026-000', driver: 'Rajesh Kumar', distance: '4.2 km', duration: '18 min', otpStatus: 'VERIFIED' },
      ]
    },
    {
      id: 'REP-IMP-0926',
      title: 'Monthly Impact & Community CSR Report',
      type: 'COMMUNITY_IMPACT',
      period: 'September 2026',
      recordsCount: 1692,
      totalWeightKg: 846.0,
      description: 'Summary of total meals provided, demographic impact, and estimated landfill diversion statistics.',
      previewData: [
        { metric: 'Meals Supported', value: '1,692 Meals' },
        { metric: 'CO2e Diverted (Est.)', value: '2,115 kg' },
        { metric: 'Water Conserved (Est.)', value: '380,700 Liters' },
      ]
    },
    {
      id: 'REP-TXN-0926',
      title: 'Transaction & Logistics Wallet Ledger',
      type: 'TRANSACTIONS',
      period: 'Current Financial Year',
      recordsCount: 18,
      totalWeightKg: 0,
      description: 'Financial accounting ledger of logistics holds, driver settlements, platform service fees, and deposits.',
      previewData: [
        { txnId: 'TXN-8812', type: 'HOLD', amount: '₹370.00', status: 'HELD' },
        { txnId: 'TXN-8805', type: 'SETTLEMENT', amount: '₹340.00', status: 'SETTLED' },
        { txnId: 'TXN-8790', type: 'DEPOSIT', amount: '₹5,000.00', status: 'CREDITED' },
      ]
    }
  ];

  const handleDownload = (rep: any) => {
    // Generate simple downloadable text/csv representation or trigger print
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5dec9] dark:border-[#2d3239] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] text-xs font-bold mb-1">
            <FileText className="w-3.5 h-3.5" />
            <span>Auditable Governance Statements</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
            NGO Compliance & Operations Reports
          </h1>
          <p className="text-xs text-[#5c6068]">
            Downloadable reports for government audits, trustee reviews, and CSR partner verification.
          </p>
        </div>

        <Link
          href="/ngo/dashboard"
          className="text-xs font-bold text-[#5c6068] hover:text-[#2d6a4f]"
        >
          &larr; Operations Dashboard
        </Link>
      </div>

      {/* Reports Grid (PRD Section 26) */}
      <div className="space-y-4">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="p-6 rounded-3xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#2d6a4f] transition-all"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-[#2d6a4f]">
                  {rep.id}
                </span>
                <span className="text-[11px] text-[#5c6068] flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{rep.period}</span>
                </span>
              </div>

              <h2 className="text-base font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                {rep.title}
              </h2>

              <p className="text-xs text-[#5c6068] max-w-2xl">
                {rep.description}
              </p>

              {rep.totalWeightKg > 0 && (
                <div className="text-[11px] font-semibold text-[#1f4d36] dark:text-[#f7f1e3]">
                  Total Verified Food: <strong>{rep.totalWeightKg} kg</strong> ({rep.recordsCount} rescues)
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedReport(rep)}
                className="px-4 py-2.5 rounded-xl border border-[#2d6a4f] text-[#2d6a4f] hover:bg-[#2d6a4f]/10 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Eye className="w-4 h-4" />
                <span>[ VIEW ]</span>
              </button>

              <button
                type="button"
                onClick={() => handleDownload(rep)}
                className="px-4 py-2.5 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-[#f7f1e3] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>[ DOWNLOAD PDF ]</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Report View Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-white dark:bg-[#1c2024] rounded-3xl border border-[#e5dec9] shadow-2xl p-6 sm:p-7 space-y-5 max-h-[85vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-[#e5dec9] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d6a4f]">
                  Verified Audit Report Preview
                </span>
                <h3 className="text-lg font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                  {selectedReport.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="p-1 rounded-lg text-[#5c6068] hover:text-[#23262b]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#5c6068]">
              {selectedReport.description}
            </p>

            {/* Preview table */}
            <div className="border border-[#e5dec9] rounded-2xl overflow-hidden text-xs">
              <pre className="p-4 bg-[#fdfbf7] dark:bg-[#14171a] font-mono text-xs overflow-x-auto">
                {JSON.stringify(selectedReport.previewData, null, 2)}
              </pre>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#e5dec9]">
              <span className="text-[11px] text-[#5c6068]">
                Digitally authenticated by AnnaSetu Protocol Engine
              </span>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl border border-[#e5dec9] text-xs font-bold text-[#5c6068]"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(selectedReport)}
                  className="px-4 py-2 rounded-xl bg-[#2d6a4f] text-[#f7f1e3] text-xs font-bold hover:bg-[#1b4332] flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Save PDF</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
