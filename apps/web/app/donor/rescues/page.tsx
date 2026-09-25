'use client';

import React from 'react';
import { Truck, ArrowRight, ShieldCheck, MapPin, Clock } from 'lucide-react';
import { UrgencyBadge } from '../../../components/donor/UrgencyBadge';
import { RescueCountdown } from '../../../components/donor/RescueCountdown';

export default function RescuesListPage() {
  const activeMissions = [
    {
      id: 'don-201',
      mission_id: 'RES-AN-001024',
      food: '25 kg Prepared Vegetarian Meals',
      origin: 'The Oberoi Banquet Kitchen',
      destination: 'Asha Deep Shelter Home',
      driver: 'Rahul Sharma (Van)',
      eta: '12 min',
      status: 'IN_TRANSIT',
      remaining_seconds: 2260,
      urgency: 'URGENT',
    },
    {
      id: 'don-202',
      mission_id: 'RES-AN-001025',
      food: '40 kg Fresh Paneer Curry & Roti Meal Trays',
      origin: 'Connaught Place Central Loading Bay',
      destination: 'Delhi Roti Bank Foundation',
      driver: 'Amit Singh (Van)',
      eta: '25 min',
      status: 'MATCHED_DISPATCHING',
      remaining_seconds: 6120,
      urgency: 'WARNING',
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      <div className="border-b border-slate-200 border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Active Rescue Missions
        </h1>
        <p className="text-xs text-slate-500">
          Real-time delivery partner tracking, GPS geofenced telemetry, and dual-OTP handoffs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeMissions.map((m) => (
          <div
            key={m.id}
            className="p-6 rounded-3xl bg-white border border-slate-200 border-slate-200 shadow-xs space-y-4 hover:border-[#1f4d36] transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-[#4f9d3a]">
                {m.mission_id}
              </span>
              <UrgencyBadge level={m.urgency as any} />
            </div>

            <div>
              <h3 className="font-bold tracking-tight text-base text-slate-900 dark:text-white">
                {m.food}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Window remaining:</span>
                <RescueCountdown initialSeconds={m.remaining_seconds} size="sm" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Origin:</span>
                <span className="font-semibold">{m.origin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Destination:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">{m.destination}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1.5">
                <span className="text-slate-500">Driver:</span>
                <span className="font-bold text-[#e0662b]">{m.driver} · ETA {m.eta}</span>
              </div>
            </div>

            <a
              href={`/donor/rescues/${m.id}`}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Truck className="w-4 h-4" />
              <span>LIVE MISSION RADAR</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
