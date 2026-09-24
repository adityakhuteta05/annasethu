'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Compass,
  Flame,
  Clock,
  MapPin,
  IndianRupee,
  Truck,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Navigation,
  FileText
} from 'lucide-react';

interface JobDetail {
  id: string;
  title: string;
  food_category: string;
  dietary_type: string;
  quantity_kg: number;
  pickup_name: string;
  pickup_address: string;
  pickup_distance_km: number;
  pickup_eta_min: number;
  drop_name: string;
  drop_address: string;
  drop_distance_km: number;
  total_distance_km: number;
  estimated_duration_min: number;
  deadline_min: number;
  vehicle_required: string;
  urgency: string;
  delivery_stops_count: number;
  stops: Array<{
    stop_index: number;
    name: string;
    quantity_kg: number;
    eta_min: number;
  }>;
  fare_breakdown: {
    base_vehicle_rate_inr: number;
    distance_rate_inr: number;
    time_rate_inr: number;
    stops_rate_inr: number;
    delivery_fare_inr: number;
    platform_fee_inr: number;
    estimated_driver_earnings_inr: number;
  };
}

export default function DriverJobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const unwrappedParams = React.use(params);
  const jobId = unwrappedParams.id;
  const router = useRouter();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);

  useEffect(() => {
    async function loadJob() {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/driver/jobs/${jobId}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data);
        } else {
          // fallback mock
          setJob({
            id: jobId,
            title: '24 kg Prepared Vegetarian Meals',
            food_category: 'PREPARED_MEALS',
            dietary_type: 'VEGETARIAN',
            quantity_kg: 24.0,
            pickup_name: 'The Grand Palace Hotel & Banquet',
            pickup_address: 'Dock 2, 14 Barakhamba Road, Connaught Place, New Delhi',
            pickup_distance_km: 3.2,
            pickup_eta_min: 8,
            drop_name: 'Delhi Roti Bank Paharganj Shelter',
            drop_address: 'Shelter No. 4, Mandir Lane, Paharganj, New Delhi',
            drop_distance_km: 4.0,
            total_distance_km: 7.2,
            estimated_duration_min: 26,
            deadline_min: 41,
            vehicle_required: 'VAN',
            urgency: 'URGENT',
            delivery_stops_count: 1,
            stops: [
              {
                stop_index: 1,
                name: 'Delhi Roti Bank Paharganj Shelter',
                quantity_kg: 24.0,
                eta_min: 26
              }
            ],
            fare_breakdown: {
              base_vehicle_rate_inr: 200,
              distance_rate_inr: 100,
              time_rate_inr: 40,
              stops_rate_inr: 30,
              delivery_fare_inr: 370,
              platform_fee_inr: 44,
              estimated_driver_earnings_inr: 326
            }
          });
        }
      } catch {
        // mock fallback
        setJob({
          id: jobId,
          title: '24 kg Prepared Vegetarian Meals',
          food_category: 'PREPARED_MEALS',
          dietary_type: 'VEGETARIAN',
          quantity_kg: 24.0,
          pickup_name: 'The Grand Palace Hotel & Banquet',
          pickup_address: 'Dock 2, 14 Barakhamba Road, Connaught Place, New Delhi',
          pickup_distance_km: 3.2,
          pickup_eta_min: 8,
          drop_name: 'Delhi Roti Bank Paharganj Shelter',
          drop_address: 'Shelter No. 4, Mandir Lane, Paharganj, New Delhi',
          drop_distance_km: 4.0,
          total_distance_km: 7.2,
          estimated_duration_min: 26,
          deadline_min: 41,
          vehicle_required: 'VAN',
          urgency: 'URGENT',
          delivery_stops_count: 1,
          stops: [
            {
              stop_index: 1,
              name: 'Delhi Roti Bank Paharganj Shelter',
              quantity_kg: 24.0,
              eta_min: 26
            }
          ],
          fare_breakdown: {
            base_vehicle_rate_inr: 200,
            distance_rate_inr: 100,
            time_rate_inr: 40,
            stops_rate_inr: 30,
            delivery_fare_inr: 370,
            platform_fee_inr: 44,
            estimated_driver_earnings_inr: 326
          }
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadJob();
  }, [jobId]);

  const handleAcceptJob = async () => {
    setIsAccepting(true);
    setConflictError(null);

    try {
      const res = await fetch(`http://localhost:8000/api/v1/driver/jobs/${jobId}/accept`, {
        method: 'POST'
      });

      if (res.status === 409) {
        setConflictError('This rescue has already been assigned to another driver.');
        return;
      }

      if (res.ok) {
        router.push('/driver/active');
      } else {
        router.push('/driver/active');
      }
    } catch {
      router.push('/driver/active');
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading || !job) {
    return (
      <div className="p-12 text-center text-stone-500">
        <Clock className="w-8 h-8 mx-auto animate-spin mb-3 text-orange-600" />
        <p className="text-sm font-semibold">Loading rescue dispatch telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Back button */}
      <Link
        href="/driver/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-orange-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Available Jobs
      </Link>

      {/* Conflict Error Notice (First-Accept-Wins PRD Section 37) */}
      {conflictError && (
        <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-900 text-rose-900 dark:text-rose-200 space-y-3">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{conflictError}</span>
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-300">
            Rescues are awarded on a strict atomic first-accept basis to avoid duplicate dispatches.
          </p>
          <Link
            href="/driver/jobs"
            className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
          >
            Browse Other Jobs
          </Link>
        </div>
      )}

      {/* Main Job Card */}
      <div className="bg-white dark:bg-[#1c2024] rounded-3xl border border-stone-200 dark:border-stone-800 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 dark:border-stone-800 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300">
              {job.urgency} RESCUE
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
              {job.quantity_kg} kg · {job.dietary_type}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold">
            <Clock className="w-4 h-4" />
            <span>Rescue Deadline: {job.deadline_min} mins remaining</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
            Mission #{job.id}
          </span>
          <h1 className="text-2xl font-black text-stone-900 dark:text-white tracking-tight mt-1">
            {job.title}
          </h1>
        </div>

        {/* Route Steps */}
        <div className="space-y-3 bg-stone-50 dark:bg-stone-800/40 p-5 rounded-2xl border border-stone-200/60 dark:border-stone-800">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Pickup Dock ({job.pickup_distance_km} km away · ~{job.pickup_eta_min} min ETA)
                </span>
              </div>
              <p className="font-bold text-stone-900 dark:text-white text-sm">{job.pickup_name}</p>
              <p className="text-xs text-stone-500">{job.pickup_address}</p>
            </div>
          </div>

          <div className="border-l-2 border-dashed border-stone-300 dark:border-stone-700 ml-3.5 h-6" />

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                  Receiver Destination ({job.total_distance_km} km total)
                </span>
              </div>
              <p className="font-bold text-stone-900 dark:text-white text-sm">{job.drop_name}</p>
              <p className="text-xs text-stone-500">{job.drop_address}</p>
            </div>
          </div>
        </div>

        {/* Transparent Fare & Economics Breakdown (PRD SECTION 36) */}
        <div className="p-5 rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-200/50 dark:border-emerald-800 pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
              Guaranteed Driver Fare Breakdown
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xs text-stone-500">You Receive:</span>
              <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
                ₹{job.fare_breakdown.estimated_driver_earnings_inr}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-stone-600 dark:text-stone-400 pt-1">
            <div>
              <span className="text-[10px] text-stone-400 block">Base Vehicle Rate</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">
                ₹{job.fare_breakdown.base_vehicle_rate_inr}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block">Distance Fare ({job.total_distance_km} km)</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">
                ₹{job.fare_breakdown.distance_rate_inr}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block">Time & Urgency</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">
                ₹{job.fare_breakdown.time_rate_inr}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block">Dock Stops Rate</span>
              <span className="font-bold text-stone-800 dark:text-stone-200">
                ₹{job.fare_breakdown.stops_rate_inr}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-emerald-800 dark:text-emerald-300 font-medium pt-1">
            ✓ 100% of driver fare is credited to your wallet immediately after receiver OTP verification.
          </p>
        </div>

        {/* Vehicle & Requirements Notice */}
        <div className="flex items-center gap-3 text-xs text-stone-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Requires verified {job.vehicle_required} with valid insurance and sanitized thermal carrier box.
          </span>
        </div>

        {/* Accept Button */}
        <button
          onClick={handleAcceptJob}
          disabled={isAccepting || !!conflictError}
          className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white rounded-2xl font-black text-sm uppercase tracking-wider transition shadow-lg hover:shadow-orange-600/30 flex items-center justify-center gap-2 transform active:scale-98"
        >
          {isAccepting ? (
            <>
              <Clock className="w-5 h-5 animate-spin" />
              Securing Job Assignment...
            </>
          ) : (
            <>
              <Navigation className="w-5 h-5" />
              ACCEPT RESCUE MISSION (₹{job.fare_breakdown.estimated_driver_earnings_inr})
            </>
          )}
        </button>
      </div>
    </div>
  );
}
