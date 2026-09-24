'use client';

import React from 'react';
import { Award, Download, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function DonorCertificatesPage() {
  const certificates = [
    {
      id: 'AS-CERT-1000M-9182',
      milestone: '1,000 MEALS SUPPORTED',
      title: 'Milestone 1,000 Nutritious Meals Provided',
      description: 'Presented in recognition of vital contributions to regional hunger mitigation through verified zero-waste distribution.',
      issued_date: '10 September 2026',
      hash: 'SHA256:7a89f9e1c3b52d9a4b8c7e6f',
      metric: '1,000 Meals',
      badge_color: 'from-amber-400 to-orange-500',
    },
    {
      id: 'AS-CERT-50RES-9014',
      milestone: '50 SUCCESSFUL RESCUES',
      title: 'Operational Excellence Milestone (50 Missions)',
      description: 'Commemorating 50 consecutive surplus food deliveries with 100% custody seal integrity and zero cancellations.',
      issued_date: '22 August 2026',
      hash: 'SHA256:4b2e8f1c9d3a7e5f8a6b2c4e',
      metric: '50 Rescues',
      badge_color: 'from-emerald-400 to-teal-600',
    },
    {
      id: 'AS-CERT-100KG-8812',
      milestone: '100 KILOGRAMS RESCUED',
      title: 'Pioneer Zero-Landfill Donor Charter',
      description: 'Awarded upon successfully surpassing 100 kg of edible banquet food diversion from municipal disposal.',
      issued_date: '18 May 2026',
      hash: 'SHA256:1a2b3c4d5e6f7a8b9c0d1e2f',
      metric: '100 KG',
      badge_color: 'from-emerald-600 to-green-700',
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="border-b border-[#e5dec9] dark:border-[#2d3239] pb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
          Audited Sustainability Recognition
        </span>
        <h1 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
          Verified Milestone Certificates
        </h1>
        <p className="text-xs text-[#5c6068]">
          Official certificates awarded exclusively upon cryptographically verified handoff and delivery completion
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="p-6 rounded-3xl bg-white dark:bg-[#1c2024] border-2 border-[#e5dec9] dark:border-[#2d3239] shadow-xs flex flex-col justify-between space-y-6 relative overflow-hidden group hover:border-[#1f4d36] transition-all"
          >
            {/* Top Seal Stamp */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${cert.badge_color} text-white flex items-center justify-center shadow-md`}>
                  <Award className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10px] font-bold text-[#5c6068]">
                  {cert.id}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#e0662b] block">
                  {cert.milestone}
                </span>
                <h3 className="font-heading font-bold text-base text-[#1f4d36] dark:text-[#f7f1e3] mt-1">
                  {cert.title}
                </h3>
                <p className="text-xs text-[#5c6068] mt-2 leading-relaxed">
                  {cert.description}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800 text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-[#5c6068]">Honoree:</span>
                <span className="font-semibold text-[#23262b] dark:text-[#f7f1e3]">The Oberoi Grand Kitchens</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-[#5c6068]">Awarded Date:</span>
                <span className="font-semibold">{cert.issued_date}</span>
              </div>
              <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-[9px] font-mono text-[#5c6068] truncate">
                Hash: {cert.hash}
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-[#1f4d36] hover:bg-[#163827] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>DOWNLOAD CERTIFICATE</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
