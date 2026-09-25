'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileCheck,
  User,
  Phone,
  RefreshCw,
  Building2,
} from 'lucide-react';
import { UrgencyBadge } from '../../../../components/donor/UrgencyBadge';
import { RescueCountdown } from '../../../../components/donor/RescueCountdown';

export default function LiveRescueMissionPage() {
  const params = useParams();
  const rescueId = (params?.id as string) || 'don-201';

  const [data, setData] = useState<any>(null);
  const [driverCancelledSim, setDriverCancelledSim] = useState(false);
  const [reassignStep, setReassignStep] = useState(1);

  useEffect(() => {
    async function loadRescue() {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/donor/rescues/${rescueId}`);
        if (res.ok) {
          setData(await res.json());
        } else {
          setData(getDefaultRescue(rescueId));
        }
      } catch (e) {
        setData(getDefaultRescue(rescueId));
      }
    }
    loadRescue();
  }, [rescueId]);

  function getDefaultRescue(id: string) {
    return {
      rescue_id: 'RES-AN-001024',
      donation_id: id,
      food_title: '25 kg Vegetarian Banquet Meals',
      quantity_kg: 25.0,
      status: 'IN_TRANSIT',
      time_remaining_seconds: 2260,
      time_remaining_formatted: '00:37:40',
      urgency_level: 'URGENT',
      driver_info: {
        name: 'Rahul Sharma',
        phone: '+91-98733-44556',
        vehicle_type: 'VAN',
        vehicle_reg_masked: 'DL-01-AB-****',
        rating: 4.9,
        completed_deliveries: 98,
        status: 'IN_TRANSIT',
        eta_minutes: 12,
      },
      locations: {
        donor: {
          name: 'The Oberoi Grand Kitchens',
          address: 'Dr Zakir Hussain Marg, New Delhi',
        },
        receiver: {
          name: 'Asha Deep Shelter & Children Home',
          address: 'Kashmere Gate Community Center, Delhi',
        },
      },
      timeline: [
        { step: 'Donation Posted', status: 'COMPLETED', time: '1:45 PM' },
        { step: 'Match Found', status: 'COMPLETED', time: '1:50 PM' },
        { step: 'Allocation Confirmed', status: 'COMPLETED', time: '1:52 PM' },
        { step: 'Driver Assigned', status: 'COMPLETED', time: '1:55 PM' },
        { step: 'Pickup Verified (OTP + Seal)', status: 'COMPLETED', time: '2:10 PM' },
        { step: 'Package Sealed Intact', status: 'COMPLETED', time: '2:12 PM' },
        { step: 'In Transit to Destination', status: 'ACTIVE', time: 'Live (ETA 12m)' },
        { step: 'Verified Delivery', status: 'PENDING', time: 'Estimated 2:30 PM' },
        { step: 'Financial & CSR Settlement', status: 'PENDING', time: 'Post Delivery' },
      ],
      pickup_evidence: {
        verified: true,
        otp_verified: true,
        seal_id: 'AS-SEAL-8891',
        gps_proximity_meters: 18,
        photo_captured: true,
      },
    };
  }

  const d = data || getDefaultRescue(rescueId);

  const simulateDriverFailure = () => {
    setDriverCancelledSim(true);
    setReassignStep(1);
    setTimeout(() => setReassignStep(2), 1500);
    setTimeout(() => setReassignStep(3), 3000);
    setTimeout(() => setDriverCancelledSim(false), 4500);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 border-slate-200 pb-4">
        <div>
          <a
            href="/donor/dashboard"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 inline-flex mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </a>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Mission #{d.rescue_id}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 animate-pulse">
              ● IN TRANSIT
            </span>
          </div>
          <span className="text-xs text-slate-500">{d.food_title} · {d.quantity_kg} kg</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Safe Window Remaining:</span>
            <RescueCountdown initialSeconds={d.time_remaining_seconds} size="md" />
          </div>
          <button
            onClick={simulateDriverFailure}
            className="px-3 py-1.5 rounded-xl border border-gray-300 hover:bg-gray-100 text-[11px] font-semibold text-slate-500"
            title="Simulate driver cancellation and re-dispatch logic"
          >
            Test Reassignment
          </button>
        </div>
      </div>

      {/* Driver Reassignment Alert Banner (If simulated or active) */}
      {driverCancelledSim && (
        <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 animate-bounce" />
            <span>⚠ DRIVER REASSIGNMENT IN PROGRESS</span>
          </div>
          <p className="text-xs">
            Assigned driver cancelled due to mechanical delay. AnnaSetu matching engine is automatically scanning candidate drivers without donor interruption.
          </p>
          <div className="flex items-center gap-4 text-xs font-bold pt-1">
            <span className={reassignStep >= 1 ? 'text-amber-800' : 'text-gray-400'}>
              {reassignStep > 1 ? '✓' : '●'} Radius 1 (0-5 km)
            </span>
            <span>→</span>
            <span className={reassignStep >= 2 ? 'text-amber-800' : 'text-gray-400'}>
              {reassignStep > 2 ? '✓' : reassignStep === 2 ? '●' : '○'} Radius 2 (5-10 km)
            </span>
            <span>→</span>
            <span className={reassignStep >= 3 ? 'text-emerald-700' : 'text-gray-400'}>
              {reassignStep === 3 ? '✓ Reassigned!' : '○ Radius 3'}
            </span>
          </div>
        </div>
      )}

      {/* Live Map & Mission Tracker Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Map & Route View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 border-slate-200 shadow-xs overflow-hidden">
            {/* Visual Route Simulator / Map Frame */}
            <div className="h-72 bg-linear-to-b from-[#eaf2ea] to-[#d8e6d8] dark:from-[#162118] dark:to-[#101912] p-6 relative flex flex-col justify-between">
              
              <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-emerald-400">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-xs border border-emerald-300">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-600" />
                  Live GPS Proximity Tracking Active
                </span>
                <span className="font-mono font-bold bg-white/80 dark:bg-black/40 px-2 py-1 rounded-md">
                  Speed: 24 km/h · Urban Corridor
                </span>
              </div>

              {/* Graphic Route Representation */}
              <div className="flex items-center justify-between px-6 py-4 relative">
                {/* Connecting Line */}
                <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-1.5 bg-emerald-600/30 rounded-full">
                  <div className="h-full bg-emerald-600 w-3/5 rounded-full" />
                </div>

                {/* Point 1: Donor */}
                <div className="z-10 text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md mx-auto">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-900 dark:text-emerald-300 block">
                    Oberoi Banquet
                  </span>
                  <span className="text-[9px] text-slate-500 block">Origin (Sealed)</span>
                </div>

                {/* Point 2: Driver Transit */}
                <div className="z-10 text-center space-y-1 animate-pulse">
                  <div className="w-14 h-14 rounded-2xl bg-[#e0662b] text-white flex items-center justify-center shadow-lg mx-auto">
                    <Truck className="w-7 h-7" />
                  </div>
                  <span className="text-[11px] font-bold text-[#e0662b] block">
                    Rahul (Van)
                  </span>
                  <span className="text-[9px] font-bold bg-orange-100 text-orange-900 px-2 py-0.5 rounded-full inline-block">
                    ETA 12 min
                  </span>
                </div>

                {/* Point 3: Receiver Destination */}
                <div className="z-10 text-center space-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 text-slate-900 border-2 border-[#1f4d36] flex items-center justify-center shadow-md mx-auto">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-900 dark:text-white block">
                    Asha Deep Shelter
                  </span>
                  <span className="text-[9px] text-slate-500 block">Destination</span>
                </div>
              </div>

              {/* Transit Note */}
              <div className="text-[11px] text-slate-500 text-center bg-white/70 dark:bg-black/30 py-1.5 rounded-xl backdrop-blur-xs">
                Turn-by-turn route optimized via OSRM/Google Maps engine. Driver is 2.8 km away from final shelter handoff.
              </div>
            </div>

            {/* Delivery Evidence Card */}
            <div className="p-6 space-y-4 border-t border-slate-200 border-slate-200">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Dual-OTP & Package Chain of Custody
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Pickup Verified</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-emerald-300">
                    Driver authenticated at loading dock via OTP. Seal ID <strong>{d.pickup_evidence.seal_id}</strong> registered. GPS proximity verified at 18 meters.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>Delivery Verification Pending</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Shelter manager will inspect thermal container integrity and provide receiving OTP at arrival.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Driver Card & Realtime Timeline */}
        <div className="space-y-6">
          
          {/* Driver Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Assigned Logistics Partner
            </h3>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base">
                <User className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-sm text-slate-900 dark:text-white block truncate">
                  {d.driver_info.name}
                </span>
                <span className="text-xs text-slate-500 block">
                  {d.driver_info.vehicle_type} · {d.driver_info.vehicle_reg_masked}
                </span>
                <span className="text-[11px] text-emerald-700 font-semibold">
                  ★ {d.driver_info.rating} ({d.driver_info.completed_deliveries} successful rescues)
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs flex justify-between">
              <span className="text-slate-500">Direct Handoff Contact:</span>
              <span className="font-semibold text-slate-900 dark:text-[#4f9d3a]">{d.driver_info.phone}</span>
            </div>
          </div>

          {/* Rescue Timeline (8-10 steps) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Mission Protocol Timeline
            </h3>

            <div className="space-y-3 text-xs relative pl-4 border-l-2 border-emerald-600/30">
              {d.timeline.map((item: any, idx: number) => (
                <div key={idx} className="relative space-y-0.5">
                  <span
                    className={`absolute -left-[21px] top-0.5 w-3 h-3 rounded-full border-2 ${
                      item.status === 'COMPLETED'
                        ? 'bg-emerald-600 border-emerald-600'
                        : item.status === 'ACTIVE'
                        ? 'bg-[#e0662b] border-white animate-pulse'
                        : 'bg-gray-200 border-gray-300'
                    }`}
                  />
                  <div className="flex justify-between items-center">
                    <span
                      className={`font-semibold ${
                        item.status === 'ACTIVE'
                          ? 'text-[#e0662b] font-bold'
                          : item.status === 'COMPLETED'
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      {item.step}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">{item.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
