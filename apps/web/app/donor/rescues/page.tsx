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
      <div className="border-b border-[#e5dec9] dark:border-[#2d3239] pb-4">
        <h1 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
          Active Rescue Missions
        </h1>
        <p className="text-xs text-[#5c6068]">
          Real-time delivery partner tracking, GPS geofenced telemetry, and dual-OTP handoffs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeMissions.map((m) => (
          <div
            key={m.id}
            className="p-6 rounded-3xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-4 hover:border-[#1f4d36] transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#1f4d36] dark:text-[#4f9d3a]">
                {m.mission_id}
              </span>
              <UrgencyBadge level={m.urgency as any} />
            </div>

            <div>
              <h3 className="font-heading font-bold text-base text-[#23262b] dark:text-[#f7f1e3]">
                {m.food}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-[#5c6068] mt-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Window remaining:</span>
                <RescueCountdown initialSeconds={m.remaining_seconds} size="sm" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#5c6068]">Origin:</span>
                <span className="font-semibold">{m.origin}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5c6068]">Destination:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">{m.destination}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-1.5">
                <span className="text-[#5c6068]">Driver:</span>
                <span className="font-bold text-[#e0662b]">{m.driver} · ETA {m.eta}</span>
              </div>
            </div>

            <a
              href={`/donor/rescues/${m.id}`}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1f4d36] hover:bg-[#163827] text-white text-xs font-bold transition-all shadow-xs"
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
