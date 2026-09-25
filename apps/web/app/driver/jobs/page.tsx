'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Compass,
  Flame,
  Clock,
  MapPin,
  IndianRupee,
  Truck,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface DriverJobItem {
  id: string;
  title: string;
  food_category: string;
  dietary_type: string;
  quantity_kg: number;
  pickup_name: string;
  pickup_address: string;
  pickup_distance_km: number;
  drop_name: string;
  drop_address: string;
  total_distance_km: number;
  estimated_duration_min: number;
  deadline_min: number;
  vehicle_required: string;
  urgency: string;
  delivery_stops_count: number;
  fare_breakdown: {
    estimated_driver_earnings_inr: number;
    delivery_fare_inr: number;
  };
  status: string;
}

export default function DriverJobsPage() {
  const [jobs, setJobs] = useState<DriverJobItem[]>([
    {
      id: 'JOB-AN-1024',
      title: '24 kg Prepared Vegetarian Meals',
      food_category: 'PREPARED_MEALS',
      dietary_type: 'VEGETARIAN',
      quantity_kg: 24.0,
      pickup_name: 'The Grand Palace Hotel & Banquet',
      pickup_address: 'Dock 2, 14 Barakhamba Road, Connaught Place, New Delhi',
      pickup_distance_km: 3.2,
      drop_name: 'Delhi Roti Bank Paharganj Shelter',
      drop_address: 'Shelter No. 4, Mandir Lane, Paharganj, New Delhi',
      total_distance_km: 7.2,
      estimated_duration_min: 26,
      deadline_min: 41,
      vehicle_required: 'VAN',
      urgency: 'URGENT',
      delivery_stops_count: 1,
      fare_breakdown: {
        delivery_fare_inr: 370,
        estimated_driver_earnings_inr: 326
      },
      status: 'AVAILABLE'
    },
    {
      id: 'JOB-AN-1025',
      title: '40 kg Mixed Vegetable Biryani Banquet Lots',
      food_category: 'PREPARED_MEALS',
      dietary_type: 'VEGETARIAN',
      quantity_kg: 40.0,
      pickup_name: 'Imperial Caterers & Convention Hall',
      pickup_address: 'Gate 4, Pragati Maidan Exhibition Complex, New Delhi',
      pickup_distance_km: 4.4,
      drop_name: 'Hope Community Kitchen',
      drop_address: '12 Daryaganj Road, Old Delhi',
      total_distance_km: 10.2,
      estimated_duration_min: 35,
      deadline_min: 90,
      vehicle_required: 'VAN',
      urgency: 'WARNING',
      delivery_stops_count: 2,
      fare_breakdown: {
        delivery_fare_inr: 520,
        estimated_driver_earnings_inr: 458
      },
      status: 'AVAILABLE'
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/v1/driver/jobs');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setJobs(data);
        }
      }
    } catch {
      // fallback to mock jobs
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    if (filterCategory === 'URGENT') return job.urgency === 'URGENT';
    if (filterCategory === 'MULTI_STOP') return job.delivery_stops_count > 1;
    return true;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300">
              Live Dispatch Feed
            </span>
            <span className="text-xs text-stone-500">Atomic First-Accept Assignment</span>
          </div>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight flex items-center gap-2">
            <Compass className="w-6 h-6 text-orange-600" />
            Available Food Rescue Jobs
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Accepting a rescue reserves custody. Earnings are transparently guaranteed and credited upon delivery OTP verification.
          </p>
        </div>

        <button
          onClick={fetchJobs}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-xl text-xs font-bold transition self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Feed
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'ALL', label: `All Jobs (${jobs.length})` },
          { id: 'URGENT', label: 'Urgent Rescues (< 45m)' },
          { id: 'MULTI_STOP', label: 'Multi-Stop Runs' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setFilterCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              filterCategory === cat.id
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white text-stone-600 dark:text-stone-400 border border-slate-200 hover:bg-stone-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Job Cards List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <Compass className="w-10 h-10 mx-auto text-stone-300" />
            <h3 className="font-bold text-stone-800 dark:text-stone-200">No rescue missions available nearby</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Our dispatch engine is constantly monitoring surplus donations from hotels and banquets. Check back shortly.
            </p>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:border-orange-500/60 transition group space-y-4"
            >
              {/* Card Header: Urgency + Quantity + Earnings */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  {job.urgency === 'URGENT' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                      <Flame className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                      URGENT RESCUE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                      STANDARD RESCUE
                    </span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                    {job.quantity_kg} kg
                  </span>
                  <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {job.dietary_type}
                  </span>
                </div>

                {/* Guaranteed Earnings Displayed BEFORE Acceptance (PRD SECTION 36) */}
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs text-stone-500">Estimated Earnings:</span>
                  <span className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                    ₹{job.fare_breakdown.estimated_driver_earnings_inr}
                  </span>
                </div>
              </div>

              {/* Title & Pickup/Drop Summary */}
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-white group-hover:text-orange-600 transition">
                  {job.title}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs">
                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 space-y-1">
                    <span className="font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 text-[10px]">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      Pickup ({job.pickup_distance_km} km away)
                    </span>
                    <p className="font-semibold text-stone-900 dark:text-stone-100">{job.pickup_name}</p>
                    <p className="text-stone-500 text-[11px] truncate">{job.pickup_address}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/40 space-y-1">
                    <span className="font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1 text-[10px]">
                      <MapPin className="w-3 h-3 text-orange-600" />
                      Drop Destination {job.delivery_stops_count > 1 ? `(${job.delivery_stops_count} Stops)` : ''}
                    </span>
                    <p className="font-semibold text-stone-900 dark:text-stone-100">{job.drop_name}</p>
                    <p className="text-stone-500 text-[11px] truncate">{job.drop_address}</p>
                  </div>
                </div>
              </div>

              {/* Mission Telemetry: Distance, Duration, Deadline, Vehicle */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <div className="flex items-center gap-4 text-xs font-semibold text-stone-600 dark:text-stone-400">
                  <span className="flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-stone-500" />
                    {job.vehicle_required}
                  </span>
                  <span>•</span>
                  <span>{job.total_distance_km} km total</span>
                  <span>•</span>
                  <span>~{job.estimated_duration_min} mins transit</span>
                  <span>•</span>
                  <span className="text-rose-600 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Deadline: {job.deadline_min}m
                  </span>
                </div>

                <Link
                  href={`/driver/jobs/${job.id}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold text-xs shadow-xs transition transform active:scale-95"
                >
                  VIEW JOB & ROUTE
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
