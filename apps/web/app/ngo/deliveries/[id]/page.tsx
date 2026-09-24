'use client';

import React, { use } from 'react';
import Link from 'next/link';
import {
  Truck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Navigation,
  Phone,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function NGODeliveryTrackingPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const deliveryId = resolvedParams.id;

  const delivery = {
    id: deliveryId,
    title: '25 kg Vegetarian Pulao & Paneer Dal Banquet Trays',
    quantity_kg: 25.0,
    status: 'IN_TRANSIT',
    driver: {
      name: 'Rahul Sharma',
      phone: '+91 98110 44219',
      vehicle: 'Maruti Eeco Insulated Cargo Van',
      regNumber: 'DL 1V AC 8412',
      verified: true,
      currentSpeedKmh: 28,
    },
    donor: {
      name: 'The Grand Palace Hotel & Banquet',
      address: 'Dock 2, 14 Barakhamba Road, Connaught Place, New Delhi',
      pickedUpAt: '06:36 PM',
      sealId: 'AN-SEAL-88219',
    },
    receiver: {
      name: 'Delhi Roti Bank Relief Foundation',
      address: 'Shelter No. 4, Mandir Lane, Paharganj, New Delhi',
      contact: 'Dr. Arvind Swaminathan (+91 98101 77889)',
    },
    telemetry: {
      distanceRemainingKm: 1.8,
      etaMinutes: 8,
      remainingRescueWindowMin: 32,
      deadlineClock: '08:30 PM',
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5dec9] dark:border-[#2d3239] pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border border-amber-200 text-xs font-bold mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>LIVE RESCUE IN PROGRESS</span>
          </div>
          <h1 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
            Rescue Tracking #{delivery.id}
          </h1>
          <p className="text-xs text-[#5c6068]">
            Real-time thermal custody tracking from donor kitchen to shelter receiving dock.
          </p>
        </div>

        <Link
          href={`/ngo/deliveries/${delivery.id}/receive`}
          className="px-4 py-2.5 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-[#f7f1e3] text-xs font-bold shadow-xs flex items-center gap-2"
        >
          <span>PROCEED TO RECEIVE FOOD (OTP)</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* CUSTODY STEP CHAIN (PRD Section 21: Donor -> Pickup ✓ -> Driver 🚚 -> NGO 🏠) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#2d6a4f]">
          Custody Chain Progression
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
          
          {/* Step 1: Donor */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Stage 1</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-sm font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
              Donor Kitchen Dock
            </div>
            <div className="text-[11px] text-[#5c6068]">
              {delivery.donor.name}
            </div>
          </div>

          {/* Step 2: Pickup Verified */}
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-emerald-800 uppercase">Stage 2</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-sm font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
              Pickup Verified ✓
            </div>
            <div className="text-[11px] text-[#5c6068]">
              Seal ID: <strong>{delivery.donor.sealId}</strong>
            </div>
          </div>

          {/* Step 3: Driver in Transit */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700/50 space-y-2 relative shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-800 uppercase">Stage 3 (Active)</span>
              <Truck className="w-4 h-4 text-amber-600 animate-bounce" />
            </div>
            <div className="text-sm font-bold text-amber-900 dark:text-amber-200">
              🚚 In Transit ({delivery.telemetry.etaMinutes} min away)
            </div>
            <div className="text-[11px] text-[#5c6068]">
              Speed: {delivery.driver.currentSpeedKmh} km/h · Barakhamba Rd
            </div>
          </div>

          {/* Step 4: NGO Destination */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-[#e5dec9] space-y-2 opacity-80">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#5c6068] uppercase">Stage 4</span>
              <span className="text-xs">🏠</span>
            </div>
            <div className="text-sm font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
              Shelter Receiving Dock
            </div>
            <div className="text-[11px] text-[#5c6068]">
              Awaiting driver OTP check
            </div>
          </div>

        </div>
      </div>

      {/* Telemetry & Driver Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Telemetry Grid */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-4">
          <h3 className="text-sm font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2d6a4f]" />
            <span>Transit Telemetry & Safety Buffer</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-[#fdfbf7] dark:bg-[#14171a] border border-[#e5dec9]">
              <span className="text-[10px] text-[#5c6068] block">Estimated Arrival</span>
              <strong className="text-xl font-heading text-[#2d6a4f]">
                {delivery.telemetry.etaMinutes} Minutes
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#fdfbf7] dark:bg-[#14171a] border border-[#e5dec9]">
              <span className="text-[10px] text-[#5c6068] block">Distance Remaining</span>
              <strong className="text-xl font-heading text-[#1f4d36] dark:text-[#f7f1e3]">
                {delivery.telemetry.distanceRemainingKm} km
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#fdfbf7] dark:bg-[#14171a] border border-[#e5dec9]">
              <span className="text-[10px] text-[#5c6068] block">Remaining Safe Window</span>
              <strong className="text-xl font-heading text-amber-600">
                {delivery.telemetry.remainingRescueWindowMin} min
              </strong>
            </div>

            <div className="p-4 rounded-2xl bg-[#fdfbf7] dark:bg-[#14171a] border border-[#e5dec9]">
              <span className="text-[10px] text-[#5c6068] block">Consumption Deadline</span>
              <strong className="text-xl font-heading text-[#1f4d36] dark:text-[#f7f1e3]">
                {delivery.telemetry.deadlineClock}
              </strong>
            </div>
          </div>
        </div>

        {/* Driver Profile */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-4">
          <h3 className="text-sm font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3] flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#e0662b]" />
            <span>Assigned Verified Driver</span>
          </h3>

          <div className="p-4 rounded-2xl bg-[#fdfbf7] dark:bg-[#14171a] border border-[#e5dec9] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                  {delivery.driver.name}
                </div>
                <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Background & Licence Verified Partner</span>
                </div>
              </div>

              <a
                href={`tel:${delivery.driver.phone}`}
                className="p-2.5 rounded-xl bg-[#2d6a4f] text-white hover:bg-[#1b4332] shadow-xs"
                title="Call Driver"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>

            <div className="text-xs text-[#5c6068] space-y-1 pt-2 border-t border-[#e5dec9]/60">
              <div>Vehicle: <strong>{delivery.driver.vehicle}</strong></div>
              <div>Registration: <strong>{delivery.driver.regNumber}</strong></div>
            </div>
          </div>
        </div>

      </div>

      {/* Simulated Route Visualizer */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-[#2d6a4f]" />
            <span>Live Navigation Route (Sector 1 Corridor)</span>
          </span>
          <span className="text-[11px] text-[#5c6068]">
            Using stored GPS coordinates & live traffic approximation
          </span>
        </div>

        <div className="h-44 rounded-2xl bg-[#e5dec9]/30 dark:bg-[#14171a] border border-[#e5dec9] relative overflow-hidden flex items-center justify-center">
          <div className="text-center space-y-1 z-10">
            <div className="text-2xl animate-pulse">🚚</div>
            <div className="text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
              Rahul is currently navigating Mandir Marg (1.8 km away)
            </div>
            <div className="text-[10px] text-[#5c6068]">
              Estimated arrival at shelter in 8 minutes
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
