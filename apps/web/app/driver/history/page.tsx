'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  History,
  CheckCircle2,
  Calendar,
  Truck,
  Filter,
  ArrowRight,
  ShieldCheck,
  Search,
  Download
} from 'lucide-react';

interface HistoryItem {
  id: string;
  job_id: string;
  date: string;
  food_title: string;
  quantity_kg: number;
  donor_name: string;
  receiver_name: string;
  distance_km: number;
  duration_min: number;
  earnings_inr: number;
  status: string;
  seal_status: string;
}

export default function DriverHistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      id: 'DEL-HIST-089',
      job_id: 'JOB-AN-0994',
      date: '2026-09-24',
      food_title: '30 kg Cooked Dal & Rice Lots',
      quantity_kg: 30.0,
      donor_name: 'Royal Feast Banquets',
      receiver_name: 'Seva Bharti Relief Centre',
      distance_km: 6.8,
      duration_min: 24,
      earnings_inr: 340.0,
      status: 'DELIVERED',
      seal_status: 'INTACT'
    },
    {
      id: 'DEL-HIST-088',
      job_id: 'JOB-AN-0982',
      date: '2026-09-24',
      food_title: '18 kg Sandwich & Bakery Packs',
      quantity_kg: 18.0,
      donor_name: 'Star Supermarket CP',
      receiver_name: 'Aman Shelter for Children',
      distance_km: 4.2,
      duration_min: 18,
      earnings_inr: 250.0,
      status: 'DELIVERED',
      seal_status: 'INTACT'
    },
    {
      id: 'DEL-HIST-087',
      job_id: 'JOB-AN-0975',
      date: '2026-09-23',
      food_title: '45 kg Cooked Wedding Surplus',
      quantity_kg: 45.0,
      donor_name: 'Grand Orchid Resort',
      receiver_name: 'Delhi Roti Bank Paharganj',
      distance_km: 11.2,
      duration_min: 38,
      earnings_inr: 480.0,
      status: 'DELIVERED',
      seal_status: 'INTACT'
    },
    {
      id: 'DEL-HIST-086',
      job_id: 'JOB-AN-0960',
      date: '2026-09-22',
      food_title: '25 kg Fresh Bread & Croissants',
      quantity_kg: 25.0,
      donor_name: 'Bakers Villa Connaught Place',
      receiver_name: 'Nai Roshni Homeless Shelter',
      distance_km: 5.1,
      duration_min: 21,
      earnings_inr: 290.0,
      status: 'DELIVERED',
      seal_status: 'INTACT'
    }
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('http://localhost:8000/api/v1/driver/history');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setHistory(data);
          }
        }
      } catch {
        // fallback
      }
    }
    loadHistory();
  }, []);

  const filteredHistory = history.filter(item => {
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const matchesSearch =
      item.food_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.receiver_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.donor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300">
              Verified Run Archive
            </span>
            <span className="text-xs text-stone-500 font-mono">52 Lifetime Deliveries</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-orange-600" />
            Completed Rescue History
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Historical records of verified food pickups, shelter handoffs, and earned delivery fares.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by shelter, food type, or delivery ID..."
            className="w-full pl-9 pr-4 py-2 border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 rounded-xl text-xs text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {['ALL', 'DELIVERED'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                filterStatus === st
                  ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900'
                  : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* History Items List */}
      <div className="space-y-3">
        {filteredHistory.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-stone-500 space-y-1">
            <History className="w-8 h-8 mx-auto text-stone-300" />
            <p className="font-bold text-stone-800 dark:text-stone-200 text-sm">No historical deliveries found</p>
            <p className="text-xs">Adjust your search filters.</p>
          </div>
        ) : (
          filteredHistory.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-stone-300 transition space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs text-stone-900 dark:text-white">
                    {item.id}
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                    {item.quantity_kg} kg
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-stone-400">{item.date}</span>
                  <span className="font-mono font-black text-emerald-700 dark:text-emerald-400 text-sm">
                    +₹{item.earnings_inr}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-white">
                  {item.food_title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs text-stone-500">
                  <div>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">Donor:</span>{' '}
                    {item.donor_name}
                  </div>
                  <div>
                    <span className="font-semibold text-stone-700 dark:text-stone-300">Receiver:</span>{' '}
                    {item.receiver_name}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                <span>{item.distance_km} km · {item.duration_min} mins transit</span>
                <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                  Seal: {item.seal_status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
