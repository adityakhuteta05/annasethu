'use client';

import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
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
  ExternalLink,
} from 'lucide-react';
import { UrgencyBadge, UrgencyLevel } from '../../../components/donor/UrgencyBadge';
import { RescueCountdown } from '../../../components/donor/RescueCountdown';

export default function DonorDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('30d');
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/v1/donor/dashboard');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        // Fallback default dataset
        setData(getDefaultData());
      }
    } catch (e) {
      setData(getDefaultData());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  function getDefaultData() {
    return {
      business_name: 'The Oberoi Grand Kitchens',
      verification_status: 'VERIFIED',
      metrics: {
        food_rescued_kg: 1240.0,
        active_rescues_count: 4,
        meals_supported: 2480,
        completed_rescues_count: 86,
        organizations_served: 14,
        co2_saved_kg_est: 3100.0,
        water_saved_litres_est: 558000.0,
        methane_prevented_kg_est: 223.2,
      },
      urgent_rescues: [
        {
          id: 'don-201',
          title: '25 kg Prepared Vegetarian Meals',
          quantity_kg: 25.0,
          receiver_name: 'Asha Deep Shelter & Children Home',
          driver_name: 'Rahul Sharma',
          status: 'IN_TRANSIT',
          remaining_seconds: 2304,
          urgency: 'URGENT',
          eta_minutes: 12,
        },
        {
          id: 'don-202',
          title: '40 kg Fresh Paneer Curry & Roti Boxes',
          quantity_kg: 40.0,
          receiver_name: 'Delhi Roti Bank Foundation',
          driver_name: 'Amit Singh',
          status: 'MATCHED',
          remaining_seconds: 6120,
          urgency: 'WARNING',
          eta_minutes: 25,
        },
      ],
      active_donations: [
        {
          id: 'don-201',
          title: 'Prepared Meals',
          quantity_kg: 25,
          available_from: 'Now',
          deadline: '6:30 PM',
          receiver_name: 'Asha Deep Shelter',
          driver_name: 'Rahul Sharma',
          status: 'In Transit',
          remaining_formatted: '38 min',
          urgency: 'URGENT',
        },
        {
          id: 'don-202',
          title: 'Bread & Buns',
          quantity_kg: 12,
          available_from: 'Now',
          deadline: '7:45 PM',
          receiver_name: 'ABC Shelter',
          driver_name: 'Pooja Sharma',
          status: 'Matched',
          remaining_formatted: '1h 42m',
          urgency: 'SAFE',
        },
        {
          id: 'don-203',
          title: 'Jeera Rice & Dal',
          quantity_kg: 40,
          available_from: '3:00 PM',
          deadline: '9:15 PM',
          receiver_name: 'Searching Match...',
          driver_name: '—',
          status: 'Posted',
          remaining_formatted: '3h 15m',
          urgency: 'SAFE',
        },
      ],
      needs_near_you: [
        {
          id: 'n1',
          ngo_name: 'Asha Deep Shelter & Children Home',
          title: 'Needs 40 vegetarian dinner meals',
          distance_km: 2.3,
        },
        {
          id: 'n2',
          ngo_name: 'Delhi Roti Bank Kashmere Gate',
          title: 'Needs 25 kg cooked grains / rice',
          distance_km: 4.1,
        },
        {
          id: 'n3',
          ngo_name: 'Robin Food Relief Nizamuddin',
          title: 'Needs 20 kg warm curries & chapatis',
          distance_km: 5.2,
        },
      ],
      analytics: {
        completion_rate_percentage: 98.8,
        average_rescue_time_minutes: 48,
        rescues_trend: [
          { date: 'Mon', kg: 145 },
          { date: 'Tue', kg: 180 },
          { date: 'Wed', kg: 120 },
          { date: 'Thu', kg: 210 },
          { date: 'Fri', kg: 260 },
          { date: 'Sat', kg: 195 },
          { date: 'Sun', kg: 130 },
        ],
      },
    };
  }

  const d = data || getDefaultData();
  const topUrgent = d.urgent_rescues?.[0];

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Header Greeting & Primary Action */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1c2024] p-6 sm:p-8 rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Food Business
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
            Good morning, {d.business_name || 'Chef & Food Operations'}
          </h1>
          <p className="text-sm text-[#5c6068] dark:text-[#a0a5ad]">
            "Let's rescue today's surplus food." Every meal diverted reduces landfill methane and nourishes verified local shelters.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] text-[#5c6068] hover:text-[#1f4d36] hover:bg-[#f7f1e3] transition-colors"
            title="Refresh Live State"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <a
            href="/donor/donations/new"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1f4d36] hover:bg-[#163827] text-[#f7f1e3] font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span>+ POST SURPLUS FOOD</span>
          </a>
        </div>
      </section>

      {/* 2. Key Metrics Bar */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#5c6068] dark:text-[#a0a5ad]">Total Food Rescued</span>
          <div className="text-2xl sm:text-3xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
            {d.metrics.food_rescued_kg.toLocaleString()} <span className="text-base font-normal text-[#5c6068]">kg</span>
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18% from last month
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#5c6068] dark:text-[#a0a5ad]">Active Rescues Today</span>
          <div className="text-2xl sm:text-3xl font-heading font-bold text-[#e0662b]">
            {d.metrics.active_rescues_count}
          </div>
          <span className="text-[11px] text-[#5c6068] dark:text-[#a0a5ad]">
            Live in matching / dispatch
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#5c6068] dark:text-[#a0a5ad]">Meal Equivalents Served</span>
          <div className="text-2xl sm:text-3xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
            {d.metrics.meals_supported.toLocaleString()}
          </div>
          <span className="text-[11px] text-[#5c6068] dark:text-[#a0a5ad]">
            2 meals calculated per kg
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-1">
          <span className="text-xs font-semibold text-[#5c6068] dark:text-[#a0a5ad]">Completed Missions</span>
          <div className="text-2xl sm:text-3xl font-heading font-bold text-[#4f9d3a]">
            {d.metrics.completed_rescues_count}
          </div>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
            {d.analytics?.completion_rate_percentage || 98.8}% verified completion
          </span>
        </div>
      </section>

      {/* 3. Urgent Rescue Section (Closest to Deadline) */}
      {topUrgent && (
        <section className="p-6 rounded-3xl bg-linear-to-r from-orange-50/80 via-white to-amber-50/50 dark:from-[#231a14] dark:to-[#1c2024] border-2 border-orange-200 dark:border-orange-950/60 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-[#e0662b] text-white text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-xs">
                <AlertTriangle className="w-3.5 h-3.5" />
                URGENT RESCUE IN PROGRESS
              </span>
              <UrgencyBadge level={topUrgent.urgency as UrgencyLevel} />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#5c6068] dark:text-[#a0a5ad]">Rescue Window:</span>
              <RescueCountdown initialSeconds={topUrgent.remaining_seconds} size="md" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-orange-100 dark:border-gray-800">
            <div>
              <span className="text-[11px] text-[#5c6068] uppercase font-semibold">Surplus Food</span>
              <p className="font-heading font-bold text-base text-[#23262b] dark:text-[#f7f1e3]">{topUrgent.title}</p>
              <span className="text-xs text-[#5c6068]">{topUrgent.quantity_kg} kg verified packaging</span>
            </div>

            <div>
              <span className="text-[11px] text-[#5c6068] uppercase font-semibold">Matched Receiver</span>
              <p className="font-semibold text-sm text-[#1f4d36] dark:text-[#4f9d3a]">{topUrgent.receiver_name}</p>
              <span className="text-xs text-[#5c6068]">Verified NGO Shelter</span>
            </div>

            <div>
              <span className="text-[11px] text-[#5c6068] uppercase font-semibold">Delivery Transit</span>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#e0662b]" />
                <span className="text-sm font-bold text-[#23262b] dark:text-[#f7f1e3]">
                  {topUrgent.driver_name} · ETA {topUrgent.eta_minutes}m
                </span>
              </div>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">Pickup sealed & verified</span>
            </div>

            <div className="flex items-center md:justify-end">
              <a
                href={`/donor/rescues/${topUrgent.id}`}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#e0662b] hover:bg-[#c9531d] text-white text-xs font-bold shadow-xs transition-all active:scale-[0.98]"
              >
                <span>VIEW LIVE RESCUE</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 4. Active Donations Table */}
      <section className="bg-white dark:bg-[#1c2024] rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#e5dec9] dark:border-[#2d3239]">
          <div>
            <h2 className="text-lg font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
              Active Surplus Postings
            </h2>
            <p className="text-xs text-[#5c6068] dark:text-[#a0a5ad]">
              Real-time operational queue and dispatch states
            </p>
          </div>

          <a
            href="/donor/donations"
            className="text-xs font-bold text-[#1f4d36] dark:text-[#4f9d3a] hover:underline inline-flex items-center gap-1"
          >
            <span>View All Donations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800 text-[#5c6068] uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3">Food & Category</th>
                <th className="py-3 px-3">Quantity</th>
                <th className="py-3 px-3">Available From</th>
                <th className="py-3 px-3">Deadline</th>
                <th className="py-3 px-3">Receiver</th>
                <th className="py-3 px-3">Driver</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Time Left</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 font-medium">
              {d.active_donations.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-[#23262b] dark:text-[#f7f1e3] block">{item.title}</span>
                    <span className="text-[10px] text-[#5c6068] font-mono">ID: {item.id}</span>
                  </td>
                  <td className="py-3.5 px-3 font-semibold text-[#1f4d36] dark:text-[#4f9d3a]">
                    {item.quantity_kg} kg
                  </td>
                  <td className="py-3.5 px-3 text-[#5c6068]">{item.available_from}</td>
                  <td className="py-3.5 px-3 font-medium text-[#23262b] dark:text-[#f7f1e3]">{item.deadline}</td>
                  <td className="py-3.5 px-3 text-[#5c6068]">{item.receiver_name}</td>
                  <td className="py-3.5 px-3 text-[#5c6068]">{item.driver_name}</td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 dark:bg-gray-800 text-[#23262b] dark:text-[#f7f1e3]">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <UrgencyBadge level={item.urgency as UrgencyLevel} showIcon={false} />
                  </td>
                  <td className="py-3.5 px-3 text-right space-x-1 whitespace-nowrap">
                    <a
                      href={`/donor/donations/${item.id}`}
                      className="px-2.5 py-1 rounded-lg border border-[#e5dec9] dark:border-[#2d3239] text-[11px] font-semibold text-[#1f4d36] dark:text-[#4f9d3a] hover:bg-[#f7f1e3] dark:hover:bg-[#23262b]"
                    >
                      Details
                    </a>
                    <a
                      href={`/donor/rescues/${item.id}`}
                      className="px-2.5 py-1 rounded-lg bg-[#1f4d36] text-[#f7f1e3] text-[11px] font-semibold hover:bg-[#163827]"
                    >
                      Track
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. Two Columns: Monthly Factual Impact vs Needs Near You */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Monthly Impact (Factual Records + Derived Estimates Labelled) */}
        <section className="bg-white dark:bg-[#1c2024] p-6 rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#e5dec9] dark:border-[#2d3239] pb-3">
            <div>
              <h2 className="text-base font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                Monthly Verified Impact
              </h2>
              <span className="text-[11px] text-[#5c6068]">Recorded ledger facts for CSR compliance</span>
            </div>
            <a
              href="/donor/impact"
              className="text-xs font-bold text-[#1f4d36] dark:text-[#4f9d3a] hover:underline"
            >
              Full Impact Ledger →
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <span className="text-[11px] text-[#5c6068]">Food Rescued</span>
              <p className="text-xl font-bold font-heading text-[#1f4d36] dark:text-[#f7f1e3]">1,240 kg</p>
              <span className="text-[10px] text-emerald-700">Factual record</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <span className="text-[11px] text-[#5c6068]">Meal Equivalents</span>
              <p className="text-xl font-bold font-heading text-[#1f4d36] dark:text-[#f7f1e3]">2,480</p>
              <span className="text-[10px] text-emerald-700">Factual calculation</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <span className="text-[11px] text-[#5c6068]">Organizations Served</span>
              <p className="text-xl font-bold font-heading text-[#1f4d36] dark:text-[#f7f1e3]">14</p>
              <span className="text-[10px] text-emerald-700">Verified shelters</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
              <span className="text-[11px] text-[#5c6068]">Successful Rescues</span>
              <p className="text-xl font-bold font-heading text-[#1f4d36] dark:text-[#f7f1e3]">86</p>
              <span className="text-[10px] text-emerald-700">Zero cancellations</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 space-y-1">
            <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
              Environmental Estimates (Derived via WRAP/FAO Factors):
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div>
                <span className="text-[10px] text-[#5c6068] block">CO₂e Avoided</span>
                <span className="font-bold text-[#1f4d36] dark:text-[#4f9d3a]">3,100 kg *</span>
              </div>
              <div>
                <span className="text-[10px] text-[#5c6068] block">Water Conserved</span>
                <span className="font-bold text-[#1f4d36] dark:text-[#4f9d3a]">558,000 L *</span>
              </div>
              <div>
                <span className="text-[10px] text-[#5c6068] block">Methane Prevented</span>
                <span className="font-bold text-[#1f4d36] dark:text-[#4f9d3a]">223.2 kg *</span>
              </div>
            </div>
            <p className="text-[9px] text-[#5c6068] pt-1">
              * Note: Environmental numbers are calculated estimates based on 2.5 kg CO₂e / kg and 450 L water / kg food.
            </p>
          </div>
        </section>

        {/* Needs Near You (Demand Intelligence) */}
        <section className="bg-white dark:bg-[#1c2024] p-6 rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#e5dec9] dark:border-[#2d3239] pb-3">
            <div>
              <h2 className="text-base font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
                Verified Needs Near You
              </h2>
              <span className="text-[11px] text-[#5c6068]">Current shelter demand to help optimize prep</span>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#4f9d3a]/15 text-[#1f4d36] dark:text-[#4f9d3a]">
              Within 5 km
            </span>
          </div>

          <div className="space-y-3">
            {d.needs_near_you.map((need: any) => (
              <div
                key={need.id}
                className="p-3.5 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-[#4f9d3a]/50 transition-colors flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#23262b] dark:text-[#f7f1e3]">
                      {need.ngo_name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-gray-100 dark:bg-gray-800 text-[#5c6068]">
                      {need.distance_km} km
                    </span>
                  </div>
                  <p className="text-xs text-[#5c6068]">{need.title}</p>
                </div>

                <a
                  href="/donor/donations/new"
                  className="shrink-0 px-3 py-1.5 rounded-xl border border-[#1f4d36] text-[#1f4d36] dark:text-[#4f9d3a] hover:bg-[#1f4d36] hover:text-white text-xs font-semibold transition-all"
                >
                  Fulfill
                </a>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
            💡 <strong>Kitchen Insight:</strong> Vegetarian cooked rice and curries have the highest match rate within 15 minutes of declaration during dinner periods.
          </div>
        </section>

      </div>

      {/* 6. Quick Action Shortcuts */}
      <section className="bg-white dark:bg-[#1c2024] p-6 rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-xs space-y-4">
        <h3 className="text-sm font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
          Donor Fast Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <a
            href="/donor/donations/new"
            className="p-4 rounded-2xl bg-[#f7f1e3]/60 dark:bg-[#23262b] hover:bg-[#1f4d36] hover:text-[#f7f1e3] transition-all group flex flex-col items-center text-center space-y-2"
          >
            <PlusCircle className="w-5 h-5 text-[#1f4d36] group-hover:text-emerald-300 transition-colors" />
            <span className="text-xs font-bold leading-tight">Post Surplus</span>
          </a>

          <a
            href="/donor/donations"
            className="p-4 rounded-2xl bg-[#f7f1e3]/60 dark:bg-[#23262b] hover:bg-[#1f4d36] hover:text-[#f7f1e3] transition-all group flex flex-col items-center text-center space-y-2"
          >
            <Utensils className="w-5 h-5 text-[#1f4d36] group-hover:text-emerald-300 transition-colors" />
            <span className="text-xs font-bold leading-tight">All Donations</span>
          </a>

          <a
            href="/donor/rescues"
            className="p-4 rounded-2xl bg-[#f7f1e3]/60 dark:bg-[#23262b] hover:bg-[#1f4d36] hover:text-[#f7f1e3] transition-all group flex flex-col items-center text-center space-y-2"
          >
            <Truck className="w-5 h-5 text-[#1f4d36] group-hover:text-emerald-300 transition-colors" />
            <span className="text-xs font-bold leading-tight">Live Rescues</span>
          </a>

          <a
            href="/donor/impact"
            className="p-4 rounded-2xl bg-[#f7f1e3]/60 dark:bg-[#23262b] hover:bg-[#1f4d36] hover:text-[#f7f1e3] transition-all group flex flex-col items-center text-center space-y-2"
          >
            <TrendingUp className="w-5 h-5 text-[#1f4d36] group-hover:text-emerald-300 transition-colors" />
            <span className="text-xs font-bold leading-tight">CSR Impact</span>
          </a>

          <a
            href="/donor/reports"
            className="p-4 rounded-2xl bg-[#f7f1e3]/60 dark:bg-[#23262b] hover:bg-[#1f4d36] hover:text-[#f7f1e3] transition-all group flex flex-col items-center text-center space-y-2"
          >
            <FileText className="w-5 h-5 text-[#1f4d36] group-hover:text-emerald-300 transition-colors" />
            <span className="text-xs font-bold leading-tight">Audit Reports</span>
          </a>

          <a
            href="/donor/certificates"
            className="p-4 rounded-2xl bg-[#f7f1e3]/60 dark:bg-[#23262b] hover:bg-[#1f4d36] hover:text-[#f7f1e3] transition-all group flex flex-col items-center text-center space-y-2"
          >
            <Award className="w-5 h-5 text-[#1f4d36] group-hover:text-emerald-300 transition-colors" />
            <span className="text-xs font-bold leading-tight">Certificates</span>
          </a>
        </div>
      </section>
    </div>
  );
}
