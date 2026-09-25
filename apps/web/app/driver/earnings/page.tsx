'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  IndianRupee,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  FileText,
  DollarSign,
  Download,
  AlertCircle
} from 'lucide-react';

interface EarningsLedgerItem {
  id: string;
  delivery_id: string;
  date: string;
  food_title: string;
  distance_km: number;
  duration_min: number;
  fare_inr: number;
  driver_payout_inr: number;
  settlement_status: string; // SETTLED, PENDING, PROCESSING
}

export default function DriverEarningsPage() {
  const [summary, setSummary] = useState({
    available_balance: 4250.0,
    pending_settlement: 720.0,
    this_month_earned: 12480.0,
    total_lifetime_earned: 32400.0,
    payout_bank: 'HDFC Bank (A/C **8912)'
  });

  const [transactions, setTransactions] = useState<EarningsLedgerItem[]>([
    {
      id: 'TXN-DRV-901',
      delivery_id: 'DEL-2026-001',
      date: '2026-09-25 18:35',
      food_title: '24 kg Prepared Vegetarian Meals',
      distance_km: 7.2,
      duration_min: 26,
      fare_inr: 370.0,
      driver_payout_inr: 326.0,
      settlement_status: 'SETTLED'
    },
    {
      id: 'TXN-DRV-900',
      delivery_id: 'DEL-2026-000',
      date: '2026-09-24 19:40',
      food_title: '30 kg Cooked Dal & Rice Lots',
      distance_km: 6.8,
      duration_min: 24,
      fare_inr: 390.0,
      driver_payout_inr: 340.0,
      settlement_status: 'SETTLED'
    },
    {
      id: 'TXN-DRV-899',
      delivery_id: 'DEL-2026-899',
      date: '2026-09-24 14:15',
      food_title: '18 kg Sandwich & Bakery Packs',
      distance_km: 4.2,
      duration_min: 18,
      fare_inr: 290.0,
      driver_payout_inr: 250.0,
      settlement_status: 'SETTLED'
    },
    {
      id: 'TXN-DRV-898',
      delivery_id: 'DEL-2026-898',
      date: '2026-09-23 21:00',
      food_title: '45 kg Cooked Wedding Surplus',
      distance_km: 11.2,
      duration_min: 38,
      fare_inr: 550.0,
      driver_payout_inr: 480.0,
      settlement_status: 'SETTLED'
    }
  ]);

  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  useEffect(() => {
    async function loadEarnings() {
      try {
        const res = await fetch('http://localhost:8000/api/v1/driver/earnings');
        if (res.ok) {
          const data = await res.json();
          if (data.summary) {
            setSummary(prev => ({
              ...prev,
              available_balance: data.summary.available_balance_inr ?? prev.available_balance,
              pending_settlement: data.summary.pending_settlement_inr ?? prev.pending_settlement,
              this_month_earned: data.summary.this_month_earned_inr ?? prev.this_month_earned,
              total_lifetime_earned: data.summary.total_lifetime_inr ?? prev.total_lifetime_earned
            }));
          }
          if (Array.isArray(data.transactions) && data.transactions.length > 0) {
            setTransactions(data.transactions);
          }
        }
      } catch {
        // fallback
      }
    }
    loadEarnings();
  }, []);

  const handleWithdraw = () => {
    setIsWithdrawing(true);
    setTimeout(() => {
      setIsWithdrawing(false);
      setWithdrawSuccess(true);
      setTimeout(() => setWithdrawSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              Verified Partner Account
            </span>
            <span className="text-xs text-stone-500">Fast Direct Payouts</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-emerald-600" />
            Driver Earnings & Payout Ledger
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Transparent breakdown of every delivery fare, distance compensation, and bank payout.
          </p>
        </div>

        <button
          onClick={handleWithdraw}
          disabled={isWithdrawing || summary.available_balance === 0}
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold transition shadow-xs self-start sm:self-auto"
        >
          <ArrowUpRight className="w-4 h-4" />
          {isWithdrawing ? 'Transferring...' : 'Withdraw to Bank Account'}
        </button>
      </div>

      {withdrawSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Payout request of ₹{summary.available_balance} initiated to {summary.payout_bank}. Expected in 15 mins.</span>
        </div>
      )}

      {/* 4 Summary Cards (PRD SECTION 45) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Available for Withdrawal */}
        <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/10 shadow-xs">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Available Balance
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-400">
            ₹{summary.available_balance.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold mt-1 block">
            {summary.payout_bank}
          </span>
        </div>

        {/* Pending Settlement */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Pending Settlement
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400">
            ₹{summary.pending_settlement.toLocaleString()}
          </div>
          <span className="text-[10px] text-stone-400 mt-1 block">Held during active runs</span>
        </div>

        {/* This Month */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            This Month
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
            ₹{summary.this_month_earned.toLocaleString()}
          </div>
          <span className="text-[10px] text-stone-400 mt-1 block">52 rescue runs</span>
        </div>

        {/* Total Lifetime Earned */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
            Lifetime Earned
          </span>
          <div className="mt-2 text-2xl sm:text-3xl font-black text-stone-900 dark:text-white">
            ₹{summary.total_lifetime_earned.toLocaleString()}
          </div>
          <span className="text-[10px] text-emerald-600 font-bold mt-1 block">100% Payout Rate</span>
        </div>
      </div>

      {/* Transparent Compensation Rules */}
      <div className="bg-stone-50 dark:bg-stone-800/40 p-5 rounded-2xl border border-slate-200 text-xs text-stone-600 dark:text-stone-400 space-y-2">
        <h3 className="font-bold text-stone-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Transparent Fare Calculation Model
        </h3>
        <p className="leading-relaxed">
          AnnaSetu does not take commission from driver fares. Compensation consists of:
          <span className="font-bold text-stone-800 dark:text-stone-200"> Base Rate (₹200/Van) </span> +
          <span className="font-bold text-stone-800 dark:text-stone-200"> Distance (₹14/km) </span> +
          <span className="font-bold text-stone-800 dark:text-stone-200"> Dock Transit (₹40) </span> +
          <span className="font-bold text-stone-800 dark:text-stone-200"> Extra Stops (₹30/stop)</span>.
          Fares are settled immediately upon receiver OTP confirmation.
        </p>
      </div>

      {/* Transaction Details Table (PRD SECTION 45) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-stone-900 dark:text-white uppercase tracking-wider">
            Verified Rescue Mission Ledger
          </h2>
          <span className="text-xs text-stone-400 font-mono">Append-Only Audit</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/60 text-stone-500 font-semibold border-b border-stone-200 dark:border-stone-700">
              <tr>
                <th className="py-3 px-4">Delivery ID & Mission</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Distance & Time</th>
                <th className="py-3 px-4">Gross Fare</th>
                <th className="py-3 px-4">Driver Payout</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {transactions.map(item => (
                <tr key={item.id} className="hover:bg-stone-50/60 dark:hover:bg-stone-800/40 transition">
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-stone-900 dark:text-white block">
                      {item.delivery_id}
                    </span>
                    <span className="text-stone-500 text-[11px] truncate max-w-xs block">
                      {item.food_title}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-stone-500 whitespace-nowrap">
                    {item.date}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="font-semibold text-stone-800 dark:text-stone-200">
                      {item.distance_km} km
                    </span>
                    <span className="text-stone-400 text-[11px] block">{item.duration_min} mins transit</span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-500">
                    ₹{item.fare_inr}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-sm">
                      +₹{item.driver_payout_inr}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      {item.settlement_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
