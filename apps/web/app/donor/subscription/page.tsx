'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Check, ShieldCheck, Zap, Building } from 'lucide-react';

export default function DonorSubscriptionPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function loadSub() {
      try {
        const res = await fetch('http://localhost:8000/api/v1/donor/subscription');
        if (res.ok) {
          setData(await res.json());
        }
      } catch (e) {
        // Fallback handled
      }
    }
    loadSub();
  }, []);

  const currentPlan = data?.current_plan || {
    tier: 'BUSINESS',
    name: 'Business Sustainability Tier',
    renewal_date: '31 March 2027',
    billing_status: 'ACTIVE',
    monthly_quota_kg: 'Unlimited',
    active_locations: 1,
    locations_limit: 5,
  };

  const plans = data?.available_plans || [
    {
      tier: 'BASIC',
      name: 'Community Partner',
      price: 'Free / Non-Profit',
      features: [
        'Surplus food posting & matching',
        'Dual-OTP pickup verification',
        'Basic rescue tracking',
        'Monthly impact email',
      ],
    },
    {
      tier: 'BUSINESS',
      name: 'Business Sustainability',
      price: '₹1,999 / month',
      is_current: true,
      features: [
        'Unlimited surplus postings',
        'Fast-track volunteer & van dispatch',
        'Official CSR & carbon offset certificates',
        'Full business analytics dashboard',
        'Up to 5 kitchen loading docks',
      ],
    },
    {
      tier: 'ENTERPRISE',
      name: 'Enterprise Coalition',
      price: 'Custom / Annual',
      features: [
        'Unlimited kitchen locations & multi-city',
        'ERP & Kitchen Display System API access',
        'Dedicated CSR auditor sign-off',
        'Custom SLA & Priority Support hotline',
        'Branded milestone impact reports',
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="border-b border-slate-200 border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Subscription & Location Quotas
        </h1>
        <p className="text-xs text-slate-500">
          Manage your organizational plan, ESG reporting privileges, and multi-location dispatch settings
        </p>
      </div>

      {/* Current Active Plan Card */}
      <div className="p-6 rounded-3xl bg-linear-to-r from-emerald-50 via-white to-teal-50 dark:from-[#162118] dark:to-[#1c2024] border border-emerald-200 dark:border-emerald-900/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block">
            Current Active License
          </span>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {currentPlan.name}
          </h2>
          <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
            <span>Billing Status: <strong className="text-emerald-700">Active</strong></span>
            <span>•</span>
            <span>Next Renewal: {currentPlan.renewal_date}</span>
            <span>•</span>
            <span>Kitchen Docks: 1 of 5 active</span>
          </div>
        </div>

        <button className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs shrink-0">
          Manage Payment Method
        </button>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        {plans.map((p: any) => (
          <div
            key={p.tier}
            className={`p-6 rounded-3xl bg-white border-2 shadow-xs flex flex-col justify-between space-y-6 ${
              p.is_current ? 'border-[#1f4d36] dark:border-emerald-500' : 'border-slate-200 border-slate-200'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {p.tier}
                </span>
                {p.is_current && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Current Plan
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold tracking-tight text-lg text-slate-900 dark:text-white">
                  {p.name}
                </h3>
                <div className="text-xl font-bold text-slate-900 dark:text-[#4f9d3a] mt-1">
                  {p.price}
                </div>
              </div>

              <ul className="space-y-2 text-xs text-slate-500">
                {p.features.map((f: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              disabled={p.is_current}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                p.is_current
                  ? 'bg-gray-100 text-slate-500 cursor-default'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {p.is_current ? 'Active Subscription' : 'Upgrade Plan'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
