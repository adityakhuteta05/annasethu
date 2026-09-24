'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  ArrowUpRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  PlusCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function NGOWalletPage() {
  const [wallet, setWallet] = useState({
    totalBalance: 5000.0,
    reservedBalance: 370.0,
    availableBalance: 4630.0,
    pendingCharges: 370.0,
    completedChargesThisMonth: 1840.0,
    transactions: [
      {
        id: 'TXN-8812',
        date: '2026-09-25 18:20',
        type: 'RESERVE_HOLD',
        description: 'Logistics fare hold for Delivery #DEL-2026-001 (The Grand Palace)',
        amount: -370.0,
        status: 'HELD',
      },
      {
        id: 'TXN-8805',
        date: '2026-09-24 14:15',
        type: 'FINAL_CHARGE',
        description: 'Completed delivery settlement for Rescue #DEL-2026-000',
        amount: -340.0,
        status: 'SETTLED',
      },
      {
        id: 'TXN-8790',
        date: '2026-09-23 10:00',
        type: 'WALLET_TOPUP',
        description: 'Institutional logistics grant top-up via CSR allocation',
        amount: 5000.0,
        status: 'CREDITED',
      },
    ]
  });

  const [topupAmount, setTopupAmount] = useState('2000');
  const [topupModal, setTopupModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleTopup = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(topupAmount);
    setWallet(prev => ({
      ...prev,
      totalBalance: prev.totalBalance + amt,
      availableBalance: prev.availableBalance + amt,
      transactions: [
        {
          id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
          date: 'Just Now',
          type: 'WALLET_TOPUP',
          description: 'Instant logistics wallet recharge',
          amount: amt,
          status: 'CREDITED'
        },
        ...prev.transactions
      ]
    }));
    setTopupModal(false);
    setSuccessMsg(`₹${amt} successfully deposited into your Logistics Wallet.`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5dec9] dark:border-[#2d3239] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] text-xs font-bold mb-1">
            <Wallet className="w-3.5 h-3.5" />
            <span>Financial Authority: FastAPI Ledger</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
            NGO Logistics Wallet
          </h1>
          <p className="text-xs text-[#5c6068]">
            Surplus food is free. Logistics fares are reserved on match and settled upon verified OTP delivery.
          </p>
        </div>

        <button
          onClick={() => setTopupModal(true)}
          className="px-4 py-2.5 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-[#f7f1e3] font-bold text-xs flex items-center gap-1.5 shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Funds / Top Up</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Wallet Balances Card (PRD Section 24) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c6068] block">
            AVAILABLE BALANCE
          </span>
          <div className="text-3xl font-heading font-black text-[#2d6a4f] dark:text-[#4f9d3a]">
            ₹{wallet.availableBalance.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#5c6068] block">
            Ready for instant food lot reservations
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c6068] block">
            RESERVED (ON HOLD)
          </span>
          <div className="text-3xl font-heading font-black text-amber-600">
            ₹{wallet.reservedBalance.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#5c6068] block">
            Active in-transit delivery commitments
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c6068] block">
            TOTAL ASSET BALANCE
          </span>
          <div className="text-3xl font-heading font-black text-[#1f4d36] dark:text-[#f7f1e3]">
            ₹{wallet.totalBalance.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            Verified ledger backed
          </span>
        </div>

      </div>

      {/* Transaction Lifecycle Rule Banner */}
      <div className="p-4 rounded-2xl bg-[#fdfbf7] dark:bg-[#14171a] border border-[#e5dec9] dark:border-[#2d3239] text-xs text-[#5c6068] flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#2d6a4f] shrink-0" />
          <span>
            <strong>Deterministic Transaction Flow:</strong> Wallet Deposit &rarr; Reserve Hold &rarr; Driver Assigned &rarr; Live Handoff &rarr; Verified Delivery OTP &rarr; Final Settlement.
          </span>
        </div>
        <Link href="/ngo/reports" className="text-xs font-bold text-[#2d6a4f] hover:underline shrink-0">
          Financial Statements &rarr;
        </Link>
      </div>

      {/* Transaction Ledger Table */}
      <div className="bg-white dark:bg-[#1c2024] rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#e5dec9] dark:border-[#2d3239] flex items-center justify-between">
          <h2 className="text-sm font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
            Append-Only Wallet Ledger (PRD Section 24)
          </h2>
          <span className="text-[11px] text-[#5c6068]">
            Showing all recent debits, holds and top-ups
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f1e3]/60 dark:bg-[#14171a] text-[#5c6068] uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5dec9]/60">
              {wallet.transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-[#fdfbf7] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#1f4d36]">
                    {tx.id}
                  </td>
                  <td className="py-3 px-4 text-[#5c6068]">
                    {tx.date}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#23262b] dark:text-[#f7f1e3]">
                    {tx.type}
                  </td>
                  <td className="py-3 px-4 text-[#5c6068]">
                    {tx.description}
                  </td>
                  <td className={`py-3 px-4 font-bold ${tx.amount > 0 ? 'text-emerald-700' : 'text-[#23262b]'}`}>
                    {tx.amount > 0 ? `+₹${tx.amount.toLocaleString()}` : `-₹${Math.abs(tx.amount).toLocaleString()}`}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tx.status === 'CREDITED' ? 'bg-emerald-100 text-emerald-800' :
                      tx.status === 'HELD' ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Topup Modal */}
      {topupModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#1c2024] rounded-3xl border border-[#e5dec9] shadow-2xl p-6 space-y-4">
            <h3 className="text-base font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
              Recharge Logistics Wallet
            </h3>
            <p className="text-xs text-[#5c6068]">
              Add funds for transport fares. (Institutional demo recharge simulated via test gateway).
            </p>

            <form onSubmit={handleTopup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1f4d36] mb-1">
                  Recharge Amount (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-[#5c6068]">₹</span>
                  <input
                    type="number"
                    value={topupAmount}
                    onChange={(e) => setTopupAmount(e.target.value)}
                    min={500}
                    step={100}
                    required
                    className="w-full pl-8 pr-4 py-2 rounded-xl border border-[#e5dec9] text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                {[1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopupAmount(String(amt))}
                    className="flex-1 py-1.5 rounded-lg border border-[#e5dec9] text-xs font-semibold hover:bg-gray-50"
                  >
                    +₹{amt}
                  </button>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTopupModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#e5dec9] text-xs font-bold text-[#5c6068]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#2d6a4f] text-[#f7f1e3] text-xs font-bold hover:bg-[#1b4332]"
                >
                  Confirm Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
