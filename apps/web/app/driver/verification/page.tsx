'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  FileText, 
  ArrowRight,
  Upload,
  Info
} from 'lucide-react';

export default function DriverVerificationStatusPage() {
  const [refreshing, setRefreshing] = useState(false);

  const complianceItems = [
    {
      id: 'doc-identity',
      title: 'Identity Document (Aadhaar / Voter ID)',
      docRef: 'XXXX-XXXX-1145',
      status: 'VERIFIED',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      statusText: 'Verified',
      validity: 'Permanent',
      verifiedDate: '2026-09-24',
    },
    {
      id: 'doc-dl',
      title: 'Driving Licence (DL)',
      docRef: 'DL-1420110098412',
      status: 'VERIFIED',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      statusText: 'Verified',
      validity: 'Valid until Oct 18, 2031',
      verifiedDate: '2026-09-24',
    },
    {
      id: 'doc-rc',
      title: 'Vehicle Registration Certificate (RC)',
      docRef: 'DL 1V AC 8412 (Maruti Eeco Cargo Van)',
      status: 'VERIFIED',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      statusText: 'Verified',
      validity: 'Active Commercial RC',
      verifiedDate: '2026-09-24',
    },
    {
      id: 'doc-ins',
      title: 'Commercial Vehicle Insurance',
      docRef: 'Policy #HDFC-ERGO-COMM-881923',
      status: 'VERIFIED',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      statusText: 'Verified',
      validity: 'Valid until Apr 15, 2027',
      verifiedDate: '2026-09-24',
    },
    {
      id: 'doc-puc',
      title: 'Pollution Under Control (PUC)',
      docRef: 'PUC #PUC-DL-99120',
      status: 'EXPIRING',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      statusText: 'Expiring Soon (56 Days)',
      validity: 'Valid until Nov 20, 2026',
      verifiedDate: '2026-09-24',
    },
    {
      id: 'doc-fitness',
      title: 'Transport Vehicle Fitness Certificate',
      docRef: 'Fitness Certificate #FIT-DEL-8812',
      status: 'VERIFIED',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      statusText: 'Verified',
      validity: 'Valid until Aug 10, 2027',
      verifiedDate: '2026-09-24',
    },
    {
      id: 'doc-permit',
      title: 'Commercial Carrier Goods Permit',
      docRef: 'Permit #NCT-DL-GOODS-2024',
      status: 'VERIFIED',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      statusText: 'Verified',
      validity: 'Valid across Delhi-NCR',
      verifiedDate: '2026-09-24',
    },
  ];

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const allCompliant = complianceItems.every(
    item => item.status === 'VERIFIED' || item.status === 'EXPIRING'
  );

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#fdfbf7] dark:bg-[#121417]">
      {/* Header */}
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between pb-4 border-b border-[#e5dec9] dark:border-[#2d3239]">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-[#e0662b] text-white flex items-center justify-center font-heading text-lg font-bold">
            अ
          </div>
          <div>
            <span className="font-heading font-bold text-lg text-[#1f4d36] dark:text-[#f7f1e3]">
              ANNASETU
            </span>
            <span className="text-[10px] text-[#5c6068] block -mt-1 font-semibold">
              Driver Compliance Desk
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e5dec9] text-xs font-semibold text-[#5c6068] hover:bg-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/driver/dashboard"
            className="px-3.5 py-1.5 rounded-xl bg-[#e0662b] text-white text-xs font-bold hover:bg-[#c2511d]"
          >
            Driver Console &rarr;
          </Link>
        </div>
      </header>

      <div className="max-w-3xl w-full mx-auto py-6 space-y-6">
        
        {/* Compliance Hero Banner */}
        <div className="bg-white dark:bg-[#1c2024] rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-md p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Overall Status: Active & Fully Compliant</span>
              </div>
              <h1 className="text-xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                Rahul Sharma · Van Logistics
              </h1>
              <p className="text-xs text-[#5c6068]">
                Vehicle: <strong>DL 1V AC 8412</strong> (Cargo Van, 250 kg Payload)
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-[#f7f1e3] dark:bg-[#14171a] border border-[#e5dec9] dark:border-[#2d3239] text-center">
              <div className="text-xs font-bold text-[#1f4d36] dark:text-[#4f9d3a]">
                Operational Clearance
              </div>
              <div className="text-[11px] text-emerald-600 font-bold mt-0.5">
                Eligible for High-Urgency Jobs
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Rule:</strong> Drivers cannot accept food rescue missions if any mandatory document is EXPIRED or REJECTED.
            </span>
          </div>
        </div>

        {/* Compliance Item Matrix */}
        <div className="bg-white dark:bg-[#1c2024] rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-md p-6 space-y-4">
          <h2 className="text-sm font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
            Mandatory Compliance Checklist (7 Records)
          </h2>

          <div className="space-y-3">
            {complianceItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-[#e5dec9] dark:border-[#2d3239] bg-[#fdfbf7] dark:bg-[#14171a] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                      {item.title}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeClass}`}>
                      {item.statusText}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-[#5c6068] dark:text-[#a0a5ad]">
                    {item.docRef}
                  </div>
                  <div className="text-[11px] text-[#5c6068]">
                    {item.validity} · Verified on {item.verifiedDate}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl border border-[#e5dec9] text-xs font-bold text-[#5c6068] hover:bg-white"
                  >
                    View File
                  </button>
                  {item.status === 'EXPIRING' && (
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Renew</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Return Button */}
        <div className="flex justify-end">
          <Link
            href="/driver/dashboard"
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#e0662b] hover:bg-[#c2511d] text-white text-xs font-bold text-center shadow-sm"
          >
            Launch Driver Console &rarr;
          </Link>
        </div>

      </div>
    </main>
  );
}
