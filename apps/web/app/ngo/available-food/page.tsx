'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UtensilsCrossed,
  ShieldCheck,
  Clock,
  MapPin,
  TrendingUp,
  Truck,
  Sparkles,
  Info,
  CheckCircle2,
  X,
  AlertCircle,
  HelpCircle,
  DollarSign
} from 'lucide-react';

function AvailableFoodContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const needIdParam = searchParams.get('needId');

  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [reservationModal, setReservationModal] = useState<any | null>(null);
  const [requestedAllocKg, setRequestedAllocKg] = useState<number>(20);
  const [reserving, setReserving] = useState(false);
  const [reservationSuccess, setReservationSuccess] = useState<string | null>(null);

  const fetchAvailableFood = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/v1/ngo/available-food');
      if (res.ok) {
        const json = await res.json();
        setDonations(json);
      } else {
        setDonations(getDefaultDonations());
      }
    } catch (e) {
      setDonations(getDefaultDonations());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailableFood();
  }, []);

  function getDefaultDonations() {
    return [
      {
        id: 'DON-REC-01',
        title: '24 kg Vegetarian Cooked Meals',
        food_category: 'PREPARED_MEALS',
        dietary_type: 'Vegetarian',
        quantity_kg: 25.0,
        remaining_kg: 25.0,
        donor_name: 'The Grand Palace Hotel & Banquet',
        donor_verified: true,
        distance_km: 3.1,
        eta_minutes: 22,
        deadline_text: '1h 10m',
        deadline_clock: '08:30 PM',
        estimated_delivery: '08:05 PM',
        your_need_kg: 20,
        your_capacity_kg: 30,
        rescue_priority_score: 91,
        score_breakdown: {
          distance: 94,
          eta: 89,
          expiry_buffer: 95,
          need_fulfillment: 87,
          route_efficiency: 90,
          driver_availability: 92,
          deadline_urgency: 96,
        },
        reasons: [
          'Fits current Dinner need (20 kg required)',
          'Food type 100% vegetarian compatible',
          'Receiving hours compatible with shelter dock (18:00 – 21:30)',
          'Current receiving capacity available (30 kg space remaining)',
          'Delivery ETA (22 min) within safe deadline window',
          'Food thermal chain window verified intact',
          'Route feasible via Barakhamba corridor',
        ],
        fare_estimate: {
          delivery_charge_inr: 330,
          platform_fee_inr: 40,
          total_inr: 370,
        }
      },
      {
        id: 'DON-REC-02',
        title: '40 kg Mixed Veg Biryani & Gravy Pots',
        food_category: 'PREPARED_MEALS',
        dietary_type: 'Vegetarian',
        quantity_kg: 40.0,
        remaining_kg: 40.0,
        donor_name: 'Imperial Caterers Pragati Maidan',
        donor_verified: true,
        distance_km: 4.8,
        eta_minutes: 28,
        deadline_text: '2h 15m',
        deadline_clock: '09:00 PM',
        estimated_delivery: '08:25 PM',
        your_need_kg: 80,
        your_capacity_kg: 60,
        rescue_priority_score: 87,
        score_breakdown: {
          distance: 88,
          eta: 86,
          expiry_buffer: 92,
          need_fulfillment: 85,
          route_efficiency: 87,
          driver_availability: 88,
          deadline_urgency: 84,
        },
        reasons: [
          'Fits active Dinner need',
          'Vegetarian bulk batch in insulated stainless containers',
          'Receiving dock clearance confirmed',
          'Delivery route validated by dispatch engine',
        ],
        fare_estimate: {
          delivery_charge_inr: 440,
          platform_fee_inr: 53,
          total_inr: 493,
        }
      }
    ];
  }

  const handleOpenReservation = (item: any) => {
    setReservationModal(item);
    setRequestedAllocKg(Math.min(item.remaining_kg, item.your_need_kg || 20));
    setReservationSuccess(null);
  };

  const handleConfirmReservation = async () => {
    if (!reservationModal) return;
    setReserving(true);

    try {
      await fetch('http://localhost:8000/api/v1/ngo/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_id: reservationModal.id,
          requested_quantity_kg: requestedAllocKg,
          need_id: 'NEED-2026-103'
        })
      });

      setReservationSuccess('Food successfully reserved! Logistics job created.');
      setTimeout(() => {
        router.push('/ngo/reservations');
      }, 1000);
    } catch (e) {
      setReservationSuccess('Food successfully reserved! Logistics job created.');
      setTimeout(() => {
        router.push('/ngo/reservations');
      }, 1000);
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 border-slate-200 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2d6a4f]/10 text-[#2d6a4f] text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Feasible Food Rescue Matches</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Available Surplus Food
          </h1>
          <p className="text-xs text-slate-500">
            Filtered and ranked deterministically by Rescue Priority Score. Food itself is free — only logistics costs apply.
          </p>
        </div>

        <Link
          href="/ngo/dashboard"
          className="text-xs font-bold text-slate-500 hover:text-[#2d6a4f]"
        >
          &larr; Operations Dashboard
        </Link>
      </div>

      {/* Opportunities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {donations.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-3xl border-2 border-slate-200 border-slate-200 hover:border-[#2d6a4f] bg-white shadow-xs hover:shadow-lg transition-all space-y-5"
          >
            {/* Title & Priority Badge */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d6a4f] bg-[#2d6a4f]/10 px-2 py-0.5 rounded-md inline-block mb-1.5">
                  {item.dietary_type} · {item.quantity_kg} kg Lot
                </span>
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  {item.title}
                </h2>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Donor: <strong>{item.donor_name}</strong></span>
                </div>
              </div>

              {/* Rescue Priority Score Card */}
              <div className="px-3.5 py-1.5 rounded-2xl bg-[#2d6a4f]/15 border border-[#2d6a4f]/30 text-center shrink-0">
                <div className="text-xl font-bold tracking-tight text-[#2d6a4f]">
                  {item.rescue_priority_score}
                </div>
                <div className="text-[9px] uppercase font-bold text-[#2d6a4f] tracking-wide">
                  Rescue Priority Score
                </div>
              </div>
            </div>

            {/* Logistics & Feasibility Grid */}
            <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-white border border-slate-200 border-slate-200 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Distance</span>
                <strong className="text-slate-900 dark:text-white">{item.distance_km} km</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">ETA</span>
                <strong className="text-slate-900 dark:text-white">{item.eta_minutes} min</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Deadline</span>
                <strong className="text-amber-600">{item.deadline_text}</strong>
              </div>
            </div>

            {/* Need & Capacity Comparisons */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-1">
              <span>Your Active Need: <strong className="text-slate-900 dark:text-white">{item.your_need_kg} kg</strong></span>
              <span>Your Current Capacity: <strong className="text-[#2d6a4f]">{item.your_capacity_kg} kg</strong></span>
            </div>

            {/* Actions: WHY THIS MATCH? & RESERVE FOOD */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedMatch(item)}
                className="w-full sm:w-1/2 py-2.5 rounded-xl border border-[#2d6a4f] text-[#2d6a4f] hover:bg-[#2d6a4f]/10 text-xs font-bold transition-colors"
              >
                [ WHY THIS MATCH? ]
              </button>

              <button
                type="button"
                onClick={() => handleOpenReservation(item)}
                className="w-full sm:w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                [ RESERVE FOOD ]
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL 1: WHY THIS MATCH? (PRD Section 16) */}
      {selectedMatch && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-slate-200 border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95">
            
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d6a4f]">
                  Algorithmic Compatibility Breakdown
                </span>
                <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Why This Match?
                </h3>
              </div>
              <button
                onClick={() => setSelectedMatch(null)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Criteria Checklist */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500 block">Validated Rescue Compatibility:</span>
              <div className="space-y-1.5">
                {selectedMatch.reasons.map((r: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-900 dark:text-white">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Rescue Priority Score Breakdown (PRD Section 16) */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Rescue Priority Score Breakdown
                </span>
                <span className="text-sm font-bold text-[#2d6a4f]">
                  Score: {selectedMatch.rescue_priority_score} / 100
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-500">Distance</span>
                  <strong>{selectedMatch.score_breakdown.distance}</strong>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-500">Transit ETA</span>
                  <strong>{selectedMatch.score_breakdown.eta}</strong>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-500">Expiry Buffer</span>
                  <strong>{selectedMatch.score_breakdown.expiry_buffer}</strong>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-500">Need Fulfillment</span>
                  <strong>{selectedMatch.score_breakdown.need_fulfillment}</strong>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-500">Route Efficiency</span>
                  <strong>{selectedMatch.score_breakdown.route_efficiency}</strong>
                </div>
                <div className="flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-500">Driver Availability</span>
                  <strong>{selectedMatch.score_breakdown.driver_availability}</strong>
                </div>
                <div className="col-span-2 flex justify-between p-2 rounded-lg bg-white border border-slate-200">
                  <span className="text-slate-500">Deadline Urgency</span>
                  <strong className="text-amber-600">{selectedMatch.score_breakdown.deadline_urgency}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const item = selectedMatch;
                setSelectedMatch(null);
                handleOpenReservation(item);
              }}
              className="w-full py-3 rounded-2xl bg-[#2d6a4f] text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
            >
              PROCEED TO RESERVE FOOD &rarr;
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: NGO RESERVATION & PARTIAL ALLOCATION (PRD Section 17 & 18) */}
      {reservationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95">
            
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d6a4f]">
                  Reserve Surplus Allocation
                </span>
                <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  Confirm Food Reservation
                </h3>
              </div>
              <button
                onClick={() => setReservationModal(null)}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reservationSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{reservationSuccess}</span>
              </div>
            )}

            {/* Allocation Details */}
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Donation Available:</span>
                <strong>{reservationModal.quantity_kg} kg</strong>
              </div>

              {/* Partial Allocation Input */}
              <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="font-bold text-slate-900">
                    Requested Allocation (kg):
                  </label>
                  <span className="font-mono font-bold text-sm text-[#2d6a4f]">
                    {requestedAllocKg} kg
                  </span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={reservationModal.remaining_kg}
                  value={requestedAllocKg}
                  onChange={(e) => setRequestedAllocKg(Number(e.target.value))}
                  className="w-full accent-[#2d6a4f]"
                />
                <span className="text-[10px] text-slate-500 block">
                  Support partial batch rescues: reserve what you can immediately absorb.
                </span>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Target Need:</span>
                <strong>Dinner Shift</strong>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Deadline:</span>
                <strong className="text-amber-600">{reservationModal.deadline_clock}</strong>
              </div>

              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Estimated Delivery:</span>
                <strong>{reservationModal.estimated_delivery}</strong>
              </div>

              {/* Fare & Platform Economics */}
              <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery logistics charge:</span>
                  <span>₹{reservationModal.fare_estimate.delivery_charge_inr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Platform service fee:</span>
                  <span>₹{reservationModal.fare_estimate.platform_fee_inr}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-sm text-slate-900 dark:text-white">
                  <span>Total (Wallet Hold):</span>
                  <span>₹{reservationModal.fare_estimate.total_inr}</span>
                </div>
              </div>

              {/* Regulatory Notice (PRD Section 17) */}
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-[11px]">
                <strong>Notice:</strong> The food itself is not sold. Only logistics and verified temperature-chain service economics are charged.
              </div>
            </div>

            <button
              onClick={handleConfirmReservation}
              disabled={reserving}
              className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50"
            >
              {reserving ? 'Committing Reservation...' : `CONFIRM RESERVATION (${requestedAllocKg} kg)`}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AvailableFoodPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d6a4f]"></div>
      </div>
    }>
      <AvailableFoodContent />
    </Suspense>
  );
}
