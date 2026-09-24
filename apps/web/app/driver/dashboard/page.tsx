'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Navigation,
  Clock,
  MapPin,
  TrendingUp,
  Package,
  IndianRupee,
  CheckCircle2,
  ChevronRight,
  Flame,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

interface ActiveMission {
  job_id: string;
  delivery_id: string;
  title: string;
  quantity_kg: number;
  status: string;
  pickup: {
    name: string;
    address: string;
    lat: number;
    lng: number;
    completed: boolean;
    pickup_otp: string;
    seal_id: string;
  };
  destination: {
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  distance_remaining_km: number;
  eta_minutes: number;
  rescue_time_remaining_sec: number;
  driver_earnings_inr: number;
}

export default function DriverDashboardPage() {
  const [metrics, setMetrics] = useState({
    todays_deliveries: 8,
    todays_earnings_inr: 1840.0,
    food_transported_today_kg: 84.0,
    current_status: 'AVAILABLE',
    monthly_deliveries: 52,
    monthly_food_transported_kg: 620.0,
    monthly_earnings_inr: 12480.0
  });

  const [activeMission, setActiveMission] = useState<ActiveMission | null>({
    job_id: 'JOB-AN-1024',
    delivery_id: 'DEL-2026-001',
    title: '24 kg Prepared Vegetarian Meals',
    quantity_kg: 24.0,
    status: 'IN_TRANSIT',
    pickup: {
      name: 'The Grand Palace Hotel',
      address: '14 Barakhamba Road, Connaught Place, New Delhi',
      lat: 28.6315,
      lng: 77.2250,
      completed: true,
      pickup_otp: '4892',
      seal_id: 'AN-SEAL-88219'
    },
    destination: {
      name: 'Delhi Roti Bank Paharganj Shelter',
      address: 'Shelter No. 4, Mandir Lane, Paharganj, New Delhi',
      lat: 28.6430,
      lng: 77.2140
    },
    distance_remaining_km: 1.8,
    eta_minutes: 8,
    rescue_time_remaining_sec: 1872,
    driver_earnings_inr: 326.0
  });

  const [availableJobsCount, setAvailableJobsCount] = useState(2);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, activeRes] = await Promise.all([
          fetch('http://localhost:8000/api/v1/driver/dashboard'),
          fetch('http://localhost:8000/api/v1/driver/active-delivery')
        ]);

        if (dashRes.ok) {
          const d = await dashRes.json();
          if (d.metrics) {
            setMetrics({
              todays_deliveries: d.metrics.todays_deliveries ?? 8,
              todays_earnings_inr: d.metrics.todays_earnings_inr ?? 1840.0,
              food_transported_today_kg: d.metrics.food_transported_today_kg ?? 84.0,
              current_status: d.duty_status ?? 'AVAILABLE',
              monthly_deliveries: d.metrics.monthly_deliveries ?? 52,
              monthly_food_transported_kg: d.metrics.monthly_food_transported_kg ?? 620.0,
              monthly_earnings_inr: (d.metrics.lifetime_earnings_inr ?? 32400) * 0.4
            });
          }
        }

        if (activeRes.ok) {
          const act = await activeRes.json();
          if (act.has_active_mission && act.mission) {
            setActiveMission(act.mission);
          }
        }
      } catch {
        // use default state
      }
    }
    loadData();
  }, []);

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. ACTIVE RESCUE HERO (PRD SECTION 34: MUST DOMINATE DASHBOARD) */}
      {activeMission ? (
        <div className="bg-gradient-to-br from-stone-900 via-stone-900 to-orange-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-orange-500/40 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-6">
            {/* Urgency Badge & Status Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-600 text-white animate-pulse">
                  <Flame className="w-3.5 h-3.5" />
                  Active Rescue Mission
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-stone-200">
                  {activeMission.delivery_id}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-orange-300">
                <Clock className="w-4 h-4 text-orange-400" />
                <span>Time Remaining:</span>
                <span className="font-mono text-sm font-black text-white bg-black/40 px-2 py-0.5 rounded-lg border border-orange-500/30">
                  00:{formatSeconds(activeMission.rescue_time_remaining_sec)}
                </span>
              </div>
            </div>

            {/* Food Title & Core Metrics */}
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-wider text-orange-400 font-bold block">
                Food Load In Transit
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeMission.title}
              </h2>
            </div>

            {/* Route Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Pickup Completed</span>
                </div>
                <div className="font-bold text-sm text-stone-100">{activeMission.pickup.name}</div>
                <div className="text-xs text-stone-400 truncate">{activeMission.pickup.address}</div>
                <div className="text-[10px] font-mono text-stone-400 pt-1">
                  Seal #{activeMission.pickup.seal_id}
                </div>
              </div>

              <div className="space-y-1 sm:border-l sm:border-white/10 sm:pl-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-orange-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Receiver Destination</span>
                </div>
                <div className="font-bold text-sm text-stone-100">{activeMission.destination.name}</div>
                <div className="text-xs text-stone-400 truncate">{activeMission.destination.address}</div>
                <div className="text-[10px] font-bold text-emerald-400 pt-1">
                  ETA: {activeMission.eta_minutes} mins · {activeMission.distance_remaining_km} km away
                </div>
              </div>
            </div>

            {/* Guaranteed Earnings & Resume Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-stone-400">Guaranteed Fare:</span>
                <span className="text-2xl font-black text-emerald-400">
                  ₹{activeMission.driver_earnings_inr}
                </span>
                <span className="text-[10px] text-stone-400 font-medium">Instant Wallet Credit</span>
              </div>

              <Link
                href="/driver/active"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-extrabold text-sm tracking-wide transition shadow-lg hover:shadow-orange-600/30 transform active:scale-98"
              >
                <Navigation className="w-4 h-4" />
                RESUME DELIVERY & NAVIGATE
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* Standby Hero if no active mission */
        <div className="bg-white dark:bg-[#1c2024] rounded-3xl p-6 sm:p-8 border border-stone-200 dark:border-stone-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              ● Ready for Next Mission
            </span>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">
              You are Online & Available
            </h2>
            <p className="text-xs text-stone-500">
              New surplus food rescue requests nearby will ping directly to your dispatch dashboard.
            </p>
          </div>

          <Link
            href="/driver/jobs"
            className="inline-flex items-center gap-2 px-5 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-2xl font-bold text-xs hover:bg-orange-600 dark:hover:bg-orange-600 transition"
          >
            <Compass className="w-4 h-4" />
            Check Available Jobs ({availableJobsCount})
          </Link>
        </div>
      )}

      {/* 2. TODAY'S OPERATIONAL METRICS (PRD SECTION 33) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Today&apos;s Performance
          </h3>
          <span className="text-xs text-stone-400">Shift Started: 08:30 AM</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Today's Deliveries */}
          <div className="bg-white dark:bg-[#1c2024] p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">Deliveries</span>
              <Package className="w-4 h-4 text-orange-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-black text-stone-900 dark:text-white">
                {metrics.todays_deliveries}
              </span>
              <span className="text-xs font-medium text-stone-400">runs</span>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 block">
              100% On-time Verified
            </span>
          </div>

          {/* Today's Earnings */}
          <div className="bg-white dark:bg-[#1c2024] p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">Earnings</span>
              <IndianRupee className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400">
                ₹{metrics.todays_earnings_inr}
              </span>
            </div>
            <span className="text-[10px] text-stone-500 mt-1 block">Ready for Instant Withdrawal</span>
          </div>

          {/* Food Transported Today */}
          <div className="bg-white dark:bg-[#1c2024] p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">Food Rescued</span>
              <Truck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-black text-stone-900 dark:text-white">
                {metrics.food_transported_today_kg}
              </span>
              <span className="text-xs font-medium text-stone-400">kg</span>
            </div>
            <span className="text-[10px] text-stone-500 mt-1 block">~168 beneficiary meals</span>
          </div>

          {/* Duty Status */}
          <div className="bg-white dark:bg-[#1c2024] p-5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs">
            <div className="flex items-center justify-between text-stone-500">
              <span className="text-xs font-bold uppercase tracking-wider">Duty Status</span>
              <ShieldCheck className="w-4 h-4 text-purple-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {metrics.current_status}
              </span>
            </div>
            <span className="text-[10px] text-stone-500 mt-1 block">GPS Beacon: Active</span>
          </div>
        </div>
      </div>

      {/* 3. MONTHLY LIFETIME STATS (PRD SECTION 33) */}
      <div className="bg-white dark:bg-[#1c2024] p-6 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-xs">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-4">
          This Month&apos;s Impact & Summary
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-100 dark:divide-stone-800">
          <div className="pt-2 sm:pt-0 sm:px-4 first:pl-0">
            <span className="text-xs text-stone-500">Total Missions Completed</span>
            <div className="text-2xl font-extrabold text-stone-900 dark:text-white mt-1">
              {metrics.monthly_deliveries} deliveries
            </div>
            <span className="text-[11px] text-stone-400">Top 5% Rapid Responders in NCR</span>
          </div>

          <div className="pt-2 sm:pt-0 sm:px-4">
            <span className="text-xs text-stone-500">Total Surplus Transported</span>
            <div className="text-2xl font-extrabold text-stone-900 dark:text-white mt-1">
              {metrics.monthly_food_transported_kg} kg
            </div>
            <span className="text-[11px] text-stone-400">Over 1,240 community meals saved</span>
          </div>

          <div className="pt-2 sm:pt-0 sm:px-4">
            <span className="text-xs text-stone-500">Monthly Logistics Fare</span>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400 mt-1">
              ₹{metrics.monthly_earnings_inr.toLocaleString()}
            </div>
            <span className="text-[11px] text-stone-400">Settled directly to bank</span>
          </div>
        </div>
      </div>

      {/* 4. QUICK LINKS / ACTIONS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Link
          href="/driver/jobs"
          className="p-4 rounded-2xl bg-white dark:bg-[#1c2024] border border-stone-200 dark:border-stone-800 hover:border-orange-500 transition shadow-xs flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold text-stone-900 dark:text-white block group-hover:text-orange-600">
              Available Jobs
            </span>
            <span className="text-[10px] text-stone-500">Browse nearby offers</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          href="/driver/earnings"
          className="p-4 rounded-2xl bg-white dark:bg-[#1c2024] border border-stone-200 dark:border-stone-800 hover:border-orange-500 transition shadow-xs flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-bold text-stone-900 dark:text-white block group-hover:text-orange-600">
              My Wallet
            </span>
            <span className="text-[10px] text-stone-500">Payouts & ledger</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition" />
        </Link>

        <Link
          href="/driver/achievements"
          className="p-4 rounded-2xl bg-white dark:bg-[#1c2024] border border-stone-200 dark:border-stone-800 hover:border-orange-500 transition shadow-xs flex items-center justify-between group col-span-2 sm:col-span-1"
        >
          <div>
            <span className="text-xs font-bold text-stone-900 dark:text-white block group-hover:text-orange-600">
              Achievements
            </span>
            <span className="text-[10px] text-stone-500">50 Rescues badge</span>
          </div>
          <ChevronRight className="w-4 h-4 text-stone-400 group-hover:translate-x-0.5 transition" />
        </Link>
      </div>
    </div>
  );
}
