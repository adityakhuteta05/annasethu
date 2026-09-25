'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Truck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
  RefreshCw
} from 'lucide-react';

export default function NGODeliveriesPage() {
  const [deliveries, setDeliveries] = useState([
    {
      id: 'DEL-2026-001',
      donation_title: 'Vegetarian Pulao & Paneer Dal Trays',
      quantity_kg: 25.0,
      driver_name: 'Rahul Sharma',
      vehicle_type: 'Cargo Van (DL 1V AC 8412)',
      eta_minutes: 8,
      status: 'IN_TRANSIT',
      deadline: '08:30 PM',
      pickup_address: '14 Barakhamba Road, Connaught Place',
      donor_name: 'The Grand Palace Hotel',
    },
    {
      id: 'DEL-2026-000',
      donation_title: '30 kg Cooked Dal & Rice',
      quantity_kg: 30.0,
      driver_name: 'Rajesh Kumar',
      vehicle_type: 'Two-Wheeler Insulated Bag',
      eta_minutes: 0,
      status: 'DELIVERED',
      deadline: 'Yesterday 02:00 PM',
      pickup_address: 'Royal Feast Banquets',
      donor_name: 'Royal Feast Banquets',
    }
  ]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] text-xs font-bold mb-1">
            <Truck className="w-3.5 h-3.5" />
            <span>Operational Logistics</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Deliveries & Live Tracking
          </h1>
          <p className="text-xs text-slate-500">
            End-to-end custody tracking from donor kitchen dock to shelter receiving dock.
          </p>
        </div>

        <Link
          href="/ngo/available-food"
          className="px-4 py-2.5 rounded-xl bg-[#2d6a4f] text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
        >
          <span>Find Available Food &rarr;</span>
        </Link>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {deliveries.map((del) => (
          <div
            key={del.id}
            className="p-6 rounded-3xl bg-white border-2 border-slate-200 border-slate-200 hover:border-[#2d6a4f] shadow-xs hover:shadow-md transition-all space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs text-[#2d6a4f]">
                  {del.id}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  del.status === 'IN_TRANSIT' ? 'bg-amber-100 text-amber-900 animate-pulse' :
                  del.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {del.status.replace('_', ' ')}
                </span>
                {del.eta_minutes > 0 && (
                  <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>ETA: {del.eta_minutes} min away</span>
                  </span>
                )}
              </div>

              <span className="text-[11px] text-slate-500">
                Deadline: <strong>{del.deadline}</strong>
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  {del.donation_title}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>Quantity: <strong>{del.quantity_kg} kg</strong></span>
                  <span>Driver: <strong>{del.driver_name}</strong></span>
                  <span>Vehicle: <strong>{del.vehicle_type}</strong></span>
                  <span>Pickup: <strong>{del.donor_name}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <Link
                  href={`/ngo/deliveries/${del.id}`}
                  className="px-4 py-2.5 rounded-xl border border-[#2d6a4f] text-[#2d6a4f] hover:bg-[#2d6a4f]/10 text-xs font-bold transition-colors"
                >
                  TRACK RESCUE
                </Link>

                {del.status === 'IN_TRANSIT' && (
                  <Link
                    href={`/ngo/deliveries/${del.id}/receive`}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    RECEIVE FOOD (OTP) &rarr;
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
