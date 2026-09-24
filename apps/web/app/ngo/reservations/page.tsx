'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookmarkCheck,
  Clock,
  Truck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function NGOReservationsPage() {
  const [reservations, setReservations] = useState([
    {
      id: 'RES-2026-8801',
      donation_id: 'DON-REC-01',
      food_title: 'Vegetarian Pulao & Paneer Dal Banquet Trays',
      donor_name: 'The Grand Palace Hotel',
      reserved_kg: 25.0,
      status: 'CONFIRMED',
      reserved_at: '2026-09-25T18:18:00Z',
      expires_at: '2026-09-25T19:48:00Z',
      remaining_min: 44,
      delivery_id: 'DEL-2026-001',
      delivery_charge: 370.0,
    },
    {
      id: 'RES-2026-8794',
      donation_id: 'DON-REC-02',
      food_title: '15 kg Sandwich & Bakery Packs',
      donor_name: 'Star Supermarket CP',
      reserved_kg: 15.0,
      status: 'HELD',
      reserved_at: '2026-09-25T17:40:00Z',
      expires_at: '2026-09-25T18:40:00Z',
      remaining_min: 12,
      delivery_id: null,
      delivery_charge: 250.0,
    },
    {
      id: 'RES-2026-8710',
      donation_id: 'DON-REC-03',
      food_title: '30 kg Cooked Wedding Surplus',
      donor_name: 'Grand Orchid Resort',
      reserved_kg: 30.0,
      status: 'RELEASED',
      reserved_at: '2026-09-24T14:00:00Z',
      expires_at: '2026-09-24T15:00:00Z',
      remaining_min: 0,
      delivery_id: null,
      delivery_charge: 0,
    }
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5dec9] dark:border-[#2d3239] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] text-xs font-bold mb-1">
            <BookmarkCheck className="w-3.5 h-3.5" />
            <span>Allocation Ledger</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
            Food Reservations
          </h1>
          <p className="text-xs text-[#5c6068]">
            Statuses: HELD · CONFIRMED · RELEASED · EXPIRED. Auto-released if driver dispatch timeout occurs.
          </p>
        </div>

        <Link
          href="/ngo/available-food"
          className="px-4 py-2.5 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-[#f7f1e3] font-bold text-xs flex items-center gap-1.5 shadow-xs"
        >
          <span>Reserve More Food &rarr;</span>
        </Link>
      </div>

      {/* List */}
      <div className="space-y-4">
        {reservations.map((res) => (
          <div
            key={res.id}
            className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-[#2d6a4f]">
                  {res.id}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  res.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                  res.status === 'HELD' ? 'bg-amber-100 text-amber-800' :
                  res.status === 'RELEASED' ? 'bg-gray-100 text-gray-700' :
                  'bg-red-100 text-red-800'
                }`}>
                  {res.status}
                </span>
                {res.remaining_min > 0 && (
                  <span className="text-[11px] text-[#5c6068] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>{res.remaining_min} min remaining</span>
                  </span>
                )}
              </div>

              <h2 className="text-base font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                {res.food_title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#5c6068]">
                <span>Donor: <strong>{res.donor_name}</strong></span>
                <span>Allocated: <strong>{res.reserved_kg} kg</strong></span>
                <span>Logistics Hold: <strong>₹{res.delivery_charge}</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {res.delivery_id ? (
                <Link
                  href={`/ngo/deliveries/${res.delivery_id}`}
                  className="px-4 py-2.5 rounded-xl bg-[#2d6a4f] text-[#f7f1e3] text-xs font-bold hover:bg-[#1b4332] flex items-center gap-1.5 shadow-xs"
                >
                  <Truck className="w-4 h-4" />
                  <span>TRACK DELIVERY</span>
                </Link>
              ) : res.status === 'HELD' ? (
                <div className="text-xs text-amber-700 font-semibold flex items-center gap-1">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Matching Driver Fleet...</span>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
