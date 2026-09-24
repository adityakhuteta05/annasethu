'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PlusCircle,
  Clock,
  Filter,
  Search,
  CheckCircle2,
  AlertTriangle,
  PauseCircle,
  XCircle,
  PlayCircle,
  Eye,
  RefreshCw,
  UtensilsCrossed
} from 'lucide-react';

export default function MyNeedsPage() {
  const [needs, setNeeds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [mealFilter, setMealFilter] = useState('ALL');
  const [selectedNeed, setSelectedNeed] = useState<any | null>(null);

  const fetchNeeds = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:8000/api/v1/ngo/needs');
      if (res.ok) {
        const json = await res.json();
        setNeeds(json);
      } else {
        setNeeds(getDefaultNeeds());
      }
    } catch (e) {
      setNeeds(getDefaultNeeds());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNeeds();
  }, []);

  function getDefaultNeeds() {
    return [
      {
        id: 'NEED-2026-101',
        meal_period: 'BREAKFAST',
        food_category: 'Breads & Porridge',
        dietary_type: 'VEG',
        required_quantity_kg: 60.0,
        fulfilled_quantity_kg: 40.0,
        remaining_quantity_kg: 20.0,
        required_by: '09:00 AM',
        current_capacity_kg: 40.0,
        status: 'PARTIALLY_FULFILLED',
        created_at: '2026-09-25T06:00:00Z',
      },
      {
        id: 'NEED-2026-102',
        meal_period: 'LUNCH',
        food_category: 'Dal, Roti & Rice Thali',
        dietary_type: 'VEG',
        required_quantity_kg: 100.0,
        fulfilled_quantity_kg: 75.0,
        remaining_quantity_kg: 25.0,
        required_by: '01:30 PM',
        current_capacity_kg: 60.0,
        status: 'PARTIALLY_FULFILLED',
        created_at: '2026-09-25T07:30:00Z',
      },
      {
        id: 'NEED-2026-103',
        meal_period: 'DINNER',
        food_category: 'Prepared Vegetarian Meals',
        dietary_type: 'VEG',
        required_quantity_kg: 80.0,
        fulfilled_quantity_kg: 0.0,
        remaining_quantity_kg: 80.0,
        required_by: '08:00 PM',
        current_capacity_kg: 80.0,
        status: 'ACTIVE',
        created_at: '2026-09-25T08:00:00Z',
      },
      {
        id: 'NEED-2026-098',
        meal_period: 'OTHER',
        food_category: 'Packaged Biscuits & Tea Packs',
        dietary_type: 'VEG',
        required_quantity_kg: 30.0,
        fulfilled_quantity_kg: 30.0,
        remaining_quantity_kg: 0.0,
        required_by: 'Yesterday',
        current_capacity_kg: 50.0,
        status: 'FULFILLED',
        created_at: '2026-09-24T12:00:00Z',
      }
    ];
  }

  const handleToggleStatus = (id: string, newStatus: string) => {
    setNeeds(prev => prev.map(n => n.id === id ? { ...n, status: newStatus } : n));
  };

  const filteredNeeds = needs.filter(n => {
    if (statusFilter !== 'ALL' && n.status !== statusFilter) return false;
    if (mealFilter !== 'ALL' && n.meal_period !== mealFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5dec9] dark:border-[#2d3239] pb-4">
        <div>
          <h1 className="text-2xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
            My Food Needs
          </h1>
          <p className="text-xs text-[#5c6068]">
            Manage institutional meal demands participating in active network matching.
          </p>
        </div>

        <Link
          href="/ngo/needs/create"
          className="px-4 py-2.5 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-[#f7f1e3] font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-emerald-300" />
          <span>+ Create Food Need</span>
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#5c6068] flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </span>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#e5dec9] text-xs font-semibold bg-[#fdfbf7] dark:bg-[#14171a]"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PARTIALLY_FULFILLED">PARTIALLY FULFILLED</option>
            <option value="FULFILLED">FULFILLED</option>
            <option value="PAUSED">PAUSED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          {/* Meal Filter */}
          <select
            value={mealFilter}
            onChange={(e) => setMealFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-[#e5dec9] text-xs font-semibold bg-[#fdfbf7] dark:bg-[#14171a]"
          >
            <option value="ALL">All Meals</option>
            <option value="BREAKFAST">Breakfast</option>
            <option value="LUNCH">Lunch</option>
            <option value="DINNER">Dinner</option>
            <option value="OTHER">Other / Snacks</option>
          </select>
        </div>

        <button
          onClick={fetchNeeds}
          className="p-1.5 rounded-lg border border-[#e5dec9] text-[#5c6068] hover:text-[#2d6a4f]"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Needs Table Container */}
      <div className="bg-white dark:bg-[#1c2024] rounded-3xl border border-[#e5dec9] dark:border-[#2d3239] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f7f1e3]/60 dark:bg-[#14171a] border-b border-[#e5dec9] dark:border-[#2d3239] text-[#5c6068] uppercase text-[10px] tracking-wider font-bold">
              <tr>
                <th className="py-3.5 px-4">Need ID</th>
                <th className="py-3.5 px-4">Meal Period</th>
                <th className="py-3.5 px-4">Food Category</th>
                <th className="py-3.5 px-4">Required</th>
                <th className="py-3.5 px-4">Fulfilled</th>
                <th className="py-3.5 px-4">Remaining</th>
                <th className="py-3.5 px-4">Deadline</th>
                <th className="py-3.5 px-4">Capacity</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5dec9]/60 dark:divide-[#2d3239]/60">
              {filteredNeeds.map((need) => (
                <tr key={need.id} className="hover:bg-[#fdfbf7] dark:hover:bg-[#14171a]/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#1f4d36] dark:text-[#4f9d3a]">
                    {need.id}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#23262b] dark:text-[#f7f1e3]">
                    {need.meal_period}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#23262b] dark:text-[#f7f1e3]">{need.food_category}</div>
                    <span className="text-[10px] text-[#5c6068]">{need.dietary_type}</span>
                  </td>
                  <td className="py-3 px-4 font-bold">
                    {need.required_quantity_kg} kg
                  </td>
                  <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-bold">
                    {need.fulfilled_quantity_kg} kg
                  </td>
                  <td className="py-3 px-4 font-bold text-amber-700 dark:text-amber-400">
                    {need.remaining_quantity_kg} kg
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#5c6068]">
                    {need.required_by}
                  </td>
                  <td className="py-3 px-4 text-[#5c6068]">
                    {need.current_capacity_kg} kg
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      need.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                      need.status === 'PARTIALLY_FULFILLED' ? 'bg-blue-100 text-blue-800' :
                      need.status === 'FULFILLED' ? 'bg-purple-100 text-purple-800' :
                      need.status === 'PAUSED' ? 'bg-amber-100 text-amber-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {need.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/ngo/available-food?needId=${need.id}`}
                        className="px-2.5 py-1 rounded-lg bg-[#2d6a4f] text-white text-[11px] font-bold hover:bg-[#1b4332] shadow-xs"
                      >
                        [ VIEW MATCHES ]
                      </Link>

                      {need.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleToggleStatus(need.id, 'PAUSED')}
                          className="px-2 py-1 rounded-lg border border-[#e5dec9] text-[11px] font-semibold text-[#5c6068] hover:bg-gray-50"
                          title="Pause matching"
                        >
                          PAUSE
                        </button>
                      )}

                      {need.status === 'PAUSED' && (
                        <button
                          onClick={() => handleToggleStatus(need.id, 'ACTIVE')}
                          className="px-2 py-1 rounded-lg bg-emerald-50 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100"
                        >
                          RESUME
                        </button>
                      )}

                      {need.status !== 'CANCELLED' && need.status !== 'FULFILLED' && (
                        <button
                          onClick={() => handleToggleStatus(need.id, 'CANCELLED')}
                          className="px-2 py-1 rounded-lg border border-red-200 text-[11px] font-semibold text-red-600 hover:bg-red-50"
                        >
                          CANCEL
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
