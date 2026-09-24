'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Truck,
  Building2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Sparkles,
  Info,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { UrgencyBadge, UrgencyLevel } from '../../../../components/donor/UrgencyBadge';
import { RescueCountdown } from '../../../../components/donor/RescueCountdown';

export default function DonationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = (params?.id as string) || 'don-201';

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDetail() {
      try {
        const res = await fetch(`http://localhost:8000/api/v1/donor/donations/${id}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          setData(getDefaultDetail(id));
        }
      } catch (e) {
        setData(getDefaultDetail(id));
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  function getDefaultDetail(donationId: string) {
    return {
      id: donationId,
      title: '30 kg Banquet Dal Makhani & Steamed Jeera Rice',
      food_category: 'PACKAGED_MEALS',
      dietary_type: 'VEG',
      quantity_kg: 30.0,
      remaining_kg: 30.0,
      storage_condition: 'Thermal insulated hot-case (>65°C)',
      packaging_type: 'Food-grade sealed containers',
      seal_id: 'AS-SEAL-8891',
      image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
      available_from: '2026-09-24T18:00:00Z',
      deadline: '2026-09-24T22:30:00Z',
      remaining_seconds: 2400,
      status: 'MATCHED',
      pickup_location: {
        address: 'The Oberoi Banquet Kitchen Loading Bay, Dr Zakir Hussain Marg, New Delhi',
        contact_person: 'Chef Vikramaditya Roy',
        contact_phone: '+91-98110-12345',
      },
      match_info: {
        receiver_name: 'Delhi Roti Bank Foundation (Kashmere Gate)',
        allocated_quantity_kg: 30.0,
        unallocated_quantity_kg: 0.0,
        rescue_priority_score: 91.4,
        score_breakdown: {
          distance: 94,
          eta: 89,
          expiry_buffer: 95,
          need_fulfillment: 87,
          route_efficiency: 90,
          driver_availability: 92,
          deadline_urgency: 96,
        },
        why_matched: [
          'Compatible food type: Verified vegetarian hot meal matched with shelter evening dinner need.',
          'Sufficient intake capacity: Receiver currently has 60 kg refrigerated buffer available.',
          'Operational timing window: Receiving gates open until 10:00 PM (1h 30m buffer).',
          'Urban transit feasibility: Route distance is 4.2 km with 18 min travel time.',
          'Safety margin intact: Safe thermal holding verified prior to driver assignment.',
        ],
      },
      allocation_plan: [
        {
          receiver_name: 'Delhi Roti Bank Foundation',
          allocated_kg: 30.0,
          status: 'RESERVED_CONFIRMED',
          contact_person: 'Praveen Sharma (+91-98112-99001)',
        },
      ],
    };
  }

  const d = data || getDefaultDetail(id);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5dec9] dark:border-[#2d3239] pb-4">
        <div>
          <a
            href="/donor/donations"
            className="text-xs font-semibold text-[#5c6068] hover:text-[#1f4d36] flex items-center gap-1 inline-flex mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Donations
          </a>
          <h1 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
            Donation #{d.id}
          </h1>
          <span className="text-xs text-[#5c6068]">{d.title}</span>
        </div>

        <div className="flex items-center gap-3">
          <UrgencyBadge level="URGENT" />
          <a
            href={`/donor/rescues/${d.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1f4d36] hover:bg-[#163827] text-white text-xs font-bold shadow-xs transition-all"
          >
            <Truck className="w-4 h-4" />
            <span>TRACK RESCUE MISSION</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Details + Explainable Match */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Food Parameters & Allocation */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Rescue Window Banner */}
          <div className="p-5 rounded-3xl bg-linear-to-r from-orange-50 via-white to-amber-50 dark:from-[#231a14] dark:to-[#1c2024] border border-orange-200 dark:border-orange-950/60 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-orange-800 dark:text-orange-400 uppercase tracking-wider block">
                Time Remaining on Safe Operational Window
              </span>
              <RescueCountdown initialSeconds={d.remaining_seconds} size="lg" />
            </div>

            <div className="text-right text-xs">
              <span className="text-[#5c6068] block">Status</span>
              <span className="font-bold text-[#1f4d36] dark:text-[#4f9d3a]">{d.status}</span>
            </div>
          </div>

          {/* Food Specifications */}
          <div className="bg-white dark:bg-[#1c2024] p-6 rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-4">
            <h2 className="text-base font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
              Declared Food Specifications
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
                <span className="text-[#5c6068] block">Total Quantity</span>
                <span className="font-bold text-sm text-[#1f4d36] dark:text-[#4f9d3a]">{d.quantity_kg} kg</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
                <span className="text-[#5c6068] block">Dietary Class</span>
                <span className="font-bold text-sm text-emerald-700">Vegetarian</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
                <span className="text-[#5c6068] block">Seal Barcode ID</span>
                <span className="font-mono font-bold text-xs">{d.seal_id}</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 sm:col-span-2">
                <span className="text-[#5c6068] block">Storage Method</span>
                <span className="font-semibold">{d.storage_condition}</span>
              </div>
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40">
                <span className="text-[#5c6068] block">Packaging</span>
                <span className="font-semibold">{d.packaging_type}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-800/40 text-xs space-y-1">
              <span className="text-[#5c6068] font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Pickup Location Dock:
              </span>
              <p className="font-medium text-[#23262b] dark:text-[#f7f1e3]">
                {d.pickup_location?.address}
              </p>
              <span className="text-[11px] text-[#5c6068]">
                Contact: {d.pickup_location?.contact_person} ({d.pickup_location?.contact_phone})
              </span>
            </div>
          </div>

          {/* Partial Allocation Plan */}
          <div className="bg-white dark:bg-[#1c2024] p-6 rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5dec9] dark:border-[#2d3239] pb-3">
              <div>
                <h2 className="text-base font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                  Atomic Allocation Plan
                </h2>
                <span className="text-xs text-[#5c6068]">
                  Traceable breakdown across matched verified shelters
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800">
                100% Allocated
              </span>
            </div>

            <div className="space-y-3">
              {d.allocation_plan?.map((alloc: any, idx: number) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#23262b] dark:text-[#f7f1e3]">
                      Receiver #{idx + 1}: {alloc.receiver_name}
                    </span>
                    <span className="text-[11px] text-[#5c6068] block">
                      Rep: {alloc.contact_person} · Status: {alloc.status}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-base text-[#1f4d36] dark:text-[#4f9d3a]">
                      {alloc.allocated_kg} kg
                    </span>
                    <span className="text-[10px] text-[#5c6068] block">Reserved Capacity</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Explainable Match & Priority Score Breakdown */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1c2024] p-6 rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-5">
            <div className="border-b border-[#e5dec9] dark:border-[#2d3239] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Explainable Matching Engine
              </span>
              <h3 className="text-base font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                Why this Match was Selected
              </h3>
            </div>

            {/* Score Display */}
            <div className="p-4 rounded-2xl bg-[#1f4d36] text-[#f7f1e3] text-center space-y-1">
              <span className="text-[11px] uppercase tracking-wider opacity-80 font-semibold block">
                Deterministic Rescue Priority Score
              </span>
              <div className="text-4xl font-heading font-black text-emerald-300">
                {d.match_info?.rescue_priority_score || 91.4}
                <span className="text-base font-normal text-white/80"> / 100</span>
              </div>
              <span className="text-[10px] text-white/70 block">
                High-confidence match (Rank #1 in 25 km radius)
              </span>
            </div>

            {/* Breakdown Bars */}
            <div className="space-y-2.5 text-xs">
              <span className="font-bold text-[#23262b] dark:text-[#f7f1e3] block">
                Factor Breakdown:
              </span>

              {[
                { label: 'Deadline Urgency', val: 96 },
                { label: 'Expiry Thermal Buffer', val: 95 },
                { label: 'Geodesic Distance Proximity', val: 94 },
                { label: 'Driver Availability', val: 92 },
                { label: 'Route Efficiency', val: 90 },
                { label: 'ETA Viability', val: 89 },
                { label: 'Need Fulfillment Ratio', val: 87 },
              ].map((f) => (
                <div key={f.label} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#5c6068]">{f.label}</span>
                    <span className="font-mono font-bold text-[#1f4d36] dark:text-[#4f9d3a]">{f.val}</span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                      style={{ width: `${f.val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Qualitative Match Rationale */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs font-bold text-[#23262b] dark:text-[#f7f1e3] block">
                Algorithmic Rationale:
              </span>
              <ul className="space-y-1.5 text-xs text-[#5c6068] list-disc pl-4 leading-relaxed">
                {d.match_info?.why_matched?.map((r: string, idx: number) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-[10px] text-[#5c6068] leading-tight">
              Rule: Match scoring is calculated deterministically by server weights (PRD Section 41). No opaque AI override.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
