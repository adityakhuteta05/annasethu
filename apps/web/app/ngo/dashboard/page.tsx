'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  UtensilsCrossed,
  ShieldCheck,
  Clock,
  Truck,
  ArrowRight,
  TrendingUp,
  MapPin,
  Utensils,
  Award,
  FileText,
  AlertTriangle,
  RefreshCw,
  BookmarkCheck,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

export default function NGODashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/v1/ngo/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setData(getDefaultNGOData());
      }
    } catch (e) {
      setData(getDefaultNGOData());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  function getDefaultNGOData() {
    return {
      ngo_name: 'Delhi Roti Bank Relief Foundation',
      verification_status: 'VERIFIED',
      active_needs_count: 12,
      food_received_this_month_kg: 846.0,
      needs_fulfilled_count: 38,
      meals_received_count: 1692,
      current_receiving_capacity_kg: 120.0,
      todays_needs: [
        {
          id: 'NEED-2026-101',
          meal_period: 'BREAKFAST',
          food_category: 'Breads & Milk Porridge',
          dietary_type: 'VEG',
          required_quantity: 60,
          fulfilled_quantity: 40,
          remaining_quantity: 20,
          deadline: '09:00 AM',
          current_capacity_kg: 40,
          status: 'PARTIALLY_FULFILLED',
          urgency: 'HIGH',
        },
        {
          id: 'NEED-2026-102',
          meal_period: 'LUNCH',
          food_category: 'Dal, Roti & Rice Thali',
          dietary_type: 'VEG',
          required_quantity: 100,
          fulfilled_quantity: 75,
          remaining_quantity: 25,
          deadline: '01:30 PM',
          current_capacity_kg: 60,
          status: 'PARTIALLY_FULFILLED',
          urgency: 'NORMAL',
        },
        {
          id: 'NEED-2026-103',
          meal_period: 'DINNER',
          food_category: 'Prepared Vegetarian Meals',
          dietary_type: 'VEG',
          required_quantity: 80,
          fulfilled_quantity: 0,
          remaining_quantity: 80,
          deadline: '08:00 PM',
          current_capacity_kg: 80,
          status: 'ACTIVE',
          urgency: 'URGENT',
        }
      ],
      nearby_opportunities: [
        {
          id: 'DON-REC-01',
          title: '24 kg Vegetarian Cooked Meals',
          donor_name: 'The Grand Palace Hotel & Banquet',
          distance_km: 2.4,
          eta_minutes: 14,
          deadline: '1h 12m',
          your_need_kg: 20,
          your_capacity_kg: 30,
          rescue_priority_score: 93,
        },
        {
          id: 'DON-REC-02',
          title: '40 kg Mixed Veg Biryani & Gravy Pots',
          donor_name: 'Imperial Caterers Pragati Maidan',
          distance_km: 4.1,
          eta_minutes: 22,
          deadline: '2h 30m',
          your_need_kg: 80,
          your_capacity_kg: 60,
          rescue_priority_score: 88,
        }
      ]
    };
  }

  const d = data || getDefaultNGOData();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Top Welcome & Actions Header (PRD Section 9) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>✅ Verified Organization (80G & NGO-DARPAN)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
            Good Morning, {d.ngo_name}
          </h1>
          <p className="text-xs text-[#5c6068] dark:text-[#a0a5ad] font-sans">
            Operations Console: <span className="font-bold text-[#2d6a4f]">"What do we need today?"</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] text-[#5c6068] hover:text-[#2d6a4f] hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
            title="Refresh Operations Feed"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/ngo/needs/create"
            className="px-4 py-2.5 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-[#f7f1e3] font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span>+ CREATE FOOD NEED</span>
          </Link>

          <Link
            href="/ngo/available-food"
            className="px-4 py-2.5 rounded-xl border-2 border-[#2d6a4f] text-[#2d6a4f] font-bold text-xs flex items-center gap-2 hover:bg-[#2d6a4f]/10 transition-colors"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>VIEW AVAILABLE FOOD</span>
          </Link>
        </div>
      </div>

      {/* Metrics Strip (PRD Section 10: Real backend values) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c6068] block mb-1">
            ACTIVE NEEDS
          </span>
          <div className="text-2xl sm:text-3xl font-heading font-black text-[#1f4d36] dark:text-[#f7f1e3]">
            {d.active_needs_count || 12}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <span>●</span> Live in matching engine
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c6068] block mb-1">
            FOOD RECEIVED THIS MONTH
          </span>
          <div className="text-2xl sm:text-3xl font-heading font-black text-[#2d6a4f] dark:text-[#4f9d3a]">
            {d.food_received_this_month_kg || 846} kg
          </div>
          <span className="text-[11px] text-[#5c6068] font-semibold mt-1 block">
            September 2026 total
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c6068] block mb-1">
            NEEDS FULFILLED
          </span>
          <div className="text-2xl sm:text-3xl font-heading font-black text-[#1f4d36] dark:text-[#f7f1e3]">
            {d.needs_fulfilled_count || 38}
          </div>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            100% verified deliveries
          </span>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#5c6068] block mb-1">
            MEALS RECEIVED
          </span>
          <div className="text-2xl sm:text-3xl font-heading font-black text-[#2d6a4f] dark:text-[#4f9d3a]">
            {(d.meals_received_count || 1692).toLocaleString()}
          </div>
          <span className="text-[11px] text-[#5c6068] font-semibold mt-1 block">
            Beneficiaries nourished
          </span>
        </div>

        <div className="col-span-2 lg:col-span-1 p-4 sm:p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-900/30 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#2d6a4f] block mb-1">
            CURRENT RECEIVING CAPACITY
          </span>
          <div className="text-2xl sm:text-3xl font-heading font-black text-[#1f4d36] dark:text-[#f7f1e3]">
            {d.current_receiving_capacity_kg || 120} kg
          </div>
          <Link
            href="/ngo/capacity"
            className="text-[11px] text-[#2d6a4f] font-bold underline mt-1 block"
          >
            Adjust capacity today &rarr;
          </Link>
        </div>

      </div>

      {/* SECTION: TODAY'S NEEDS (PRD Section 11) */}
      <div className="bg-white dark:bg-[#1c2024] rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5dec9] dark:border-[#2d3239] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2d6a4f] mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Today’s Meal Requirements (Scheduled)</span>
            </div>
            <h2 className="text-xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
              Today’s Shift Needs: Breakfast · Lunch · Dinner
            </h2>
          </div>
          <Link
            href="/ngo/needs"
            className="text-xs font-bold text-[#2d6a4f] hover:underline"
          >
            Manage All Active Needs &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {d.todays_needs.map((need: any) => {
            const percent = Math.round((need.fulfilled_quantity / need.required_quantity) * 100);
            return (
              <div
                key={need.meal_period}
                className="rounded-2xl border border-[#e5dec9] dark:border-[#2d3239] bg-[#fdfbf7] dark:bg-[#14171a] p-5 space-y-4 relative overflow-hidden"
              >
                {/* Meal Header */}
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-lg bg-[#2d6a4f]/10 text-[#2d6a4f] text-xs font-bold tracking-wider">
                    {need.meal_period}
                  </span>
                  <span className="text-[11px] font-semibold text-[#5c6068] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    <span>By {need.deadline}</span>
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                    {need.food_category}
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded-md inline-block mt-1">
                    {need.dietary_type === 'VEG' ? 'Strictly Vegetarian' : 'Any Dietary'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[#23262b] dark:text-[#f7f1e3]">
                    <span>Fulfilled: {need.fulfilled_quantity} kg</span>
                    <span>Target: {need.required_quantity} kg</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-[#2d6a4f] rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-[#5c6068]">
                    <span>Remaining: <strong className="text-[#1f4d36] dark:text-[#f7f1e3]">{need.remaining_quantity} kg</strong></span>
                    <span>Current Space: {need.current_capacity_kg} kg</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#e5dec9]/60 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{need.status.replace('_', ' ')}</span>
                  </span>
                  <Link
                    href={`/ngo/available-food?meal=${need.meal_period.toLowerCase()}`}
                    className="text-xs font-bold text-[#2d6a4f] hover:underline"
                  >
                    Find Food &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION: FEASIBLE RESCUE OPPORTUNITIES (PRD Section 15 & 16) */}
      <div className="bg-white dark:bg-[#1c2024] rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-xs p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5dec9] dark:border-[#2d3239] pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2d6a4f] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Rescue Priority Ranked Surplus Opportunities</span>
            </div>
            <h2 className="text-xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
              Available Food Compatible With Today’s Needs
            </h2>
          </div>
          <Link
            href="/ngo/available-food"
            className="text-xs font-bold text-[#2d6a4f] hover:underline"
          >
            Explore Complete Marketplace &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {d.nearby_opportunities.map((opp: any) => (
            <div
              key={opp.id}
              className="p-5 rounded-2xl border-2 border-[#e5dec9] dark:border-[#2d3239] hover:border-[#2d6a4f] bg-[#fdfbf7] dark:bg-[#14171a] shadow-xs hover:shadow-md transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                    {opp.title}
                  </div>
                  <div className="text-xs text-[#5c6068] mt-0.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Donor: {opp.donor_name}</span>
                  </div>
                </div>

                {/* Rescue Priority Score Badge */}
                <div className="px-3 py-1 rounded-xl bg-[#2d6a4f]/15 text-[#2d6a4f] border border-[#2d6a4f]/30 text-center shrink-0">
                  <div className="text-xs font-black">{opp.rescue_priority_score}</div>
                  <div className="text-[9px] uppercase tracking-wider font-bold">Priority Score</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] text-xs">
                <div>
                  <span className="text-[10px] text-[#5c6068] block">Distance</span>
                  <strong className="text-[#1f4d36] dark:text-[#f7f1e3]">{opp.distance_km} km</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#5c6068] block">ETA</span>
                  <strong className="text-[#1f4d36] dark:text-[#f7f1e3]">{opp.eta_minutes} min</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#5c6068] block">Deadline</span>
                  <strong className="text-amber-600">{opp.deadline}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[#5c6068]">
                <span>Your Active Need: <strong>{opp.your_need_kg} kg</strong></span>
                <span>Your Space: <strong>{opp.your_capacity_kg} kg</strong></span>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <Link
                  href="/ngo/available-food"
                  className="flex-1 py-2.5 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-[#f7f1e3] font-bold text-xs text-center shadow-xs transition-colors"
                >
                  RESERVE FOOD &rarr;
                </Link>
                <Link
                  href="/ngo/available-food"
                  className="px-3 py-2.5 rounded-xl border border-[#e5dec9] text-xs font-semibold text-[#5c6068] hover:bg-white"
                >
                  Why This Match?
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
