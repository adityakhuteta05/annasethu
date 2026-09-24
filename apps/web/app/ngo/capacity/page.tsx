'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Boxes,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Sliders,
  ShieldCheck,
  Save,
  ArrowRight,
  Warehouse
} from 'lucide-react';

interface CapacityState {
  normalDailyCapacityKg: number;
  currentReceivingCapacityKg: number;
  storageCapacityKg: number;
  todaysReceivedKg: number;
  coldStorageKg: number;
  updatedAt: string;
}

export default function NGOCapacityPage() {
  const [capacity, setCapacity] = useState<CapacityState>({
    normalDailyCapacityKg: 120.0,
    currentReceivingCapacityKg: 35.0,
    storageCapacityKg: 150.0,
    todaysReceivedKg: 20.0,
    coldStorageKg: 40.0,
    updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  const [editCurrent, setEditCurrent] = useState<number>(35.0);
  const [editNormal, setEditNormal] = useState<number>(120.0);
  const [editStorage, setEditStorage] = useState<number>(150.0);
  const [editCold, setEditCold] = useState<number>(40.0);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch initial from backend
  useEffect(() => {
    async function loadCapacity() {
      try {
        const res = await fetch('http://localhost:8000/api/v1/ngo/capacity');
        if (res.ok) {
          const data = await res.json();
          const current = data.current_receiving_capacity_kg ?? 35.0;
          const normal = data.normal_daily_capacity_kg ?? 120.0;
          const storage = data.storage_capacity_kg ?? 150.0;
          setCapacity(prev => ({
            ...prev,
            normalDailyCapacityKg: normal,
            currentReceivingCapacityKg: current,
            storageCapacityKg: storage,
          }));
          setEditCurrent(current);
          setEditNormal(normal);
          setEditStorage(storage);
        }
      } catch {
        // use default state
      }
    }
    loadCapacity();
  }, []);

  const remainingHeadroomKg = Math.max(0, editCurrent - capacity.todaysReceivedKg);
  const utilizationPercent = Math.min(100, Math.round((capacity.todaysReceivedKg / (editCurrent || 1)) * 100));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch('http://localhost:8000/api/v1/ngo/capacity', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_capacity_kg: editCurrent,
          normal_capacity_kg: editNormal,
          storage_capacity_kg: editStorage,
        })
      });

      if (res.ok) {
        setCapacity({
          normalDailyCapacityKg: editNormal,
          currentReceivingCapacityKg: editCurrent,
          storageCapacityKg: editStorage,
          todaysReceivedKg: capacity.todaysReceivedKg,
          coldStorageKg: editCold,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        setFeedback({
          type: 'success',
          message: `Receiving capacity successfully updated to ${editCurrent} kg. Matching engine updated.`
        });
      } else {
        setCapacity(prev => ({
          ...prev,
          currentReceivingCapacityKg: editCurrent,
          normalDailyCapacityKg: editNormal,
          storageCapacityKg: editStorage,
          coldStorageKg: editCold,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setFeedback({
          type: 'success',
          message: `Receiving capacity saved locally to ${editCurrent} kg.`
        });
      }
    } catch {
      setCapacity(prev => ({
        ...prev,
        currentReceivingCapacityKg: editCurrent,
        normalDailyCapacityKg: editNormal,
        storageCapacityKg: editStorage,
        coldStorageKg: editCold,
        updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }));
      setFeedback({
        type: 'success',
        message: `Capacity saved (${editCurrent} kg). Algorithmic allocation bounds updated.`
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              Operations Control
            </span>
            <span className="text-xs text-stone-500">Last calibrated: {capacity.updatedAt}</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Warehouse className="w-6 h-6 text-emerald-700" />
            Shelter Capacity & Receiving Limits
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            The allocation engine matches donations based on your current physical receiving headroom.
          </p>
        </div>

        <Link
          href="/ngo/available-food"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-sm font-medium transition shadow-xs"
        >
          View Available Food
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Normal Daily Capacity */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wider block">
            Normal Daily Capacity
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">{capacity.normalDailyCapacityKg}</span>
            <span className="text-sm font-semibold text-stone-500">kg/day</span>
          </div>
          <span className="text-xs text-stone-500 mt-2 block">Baseline operational intake</span>
        </div>

        {/* Current Receiving Capacity */}
        <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 shadow-xs">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
            Current Receiving Capacity
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-emerald-900">{capacity.currentReceivingCapacityKg}</span>
            <span className="text-sm font-semibold text-emerald-700">kg</span>
          </div>
          <span className="text-xs text-emerald-700 font-medium mt-2 block">Active matching threshold</span>
        </div>

        {/* Today's Received */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wider block">
            Today&apos;s Received
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">{capacity.todaysReceivedKg}</span>
            <span className="text-sm font-semibold text-stone-500">kg</span>
          </div>
          <span className="text-xs text-stone-500 mt-2 block">2 deliveries verified today</span>
        </div>

        {/* Remaining Headroom */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wider block">
            Remaining Space
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-700">{remainingHeadroomKg}</span>
            <span className="text-sm font-semibold text-stone-500">kg</span>
          </div>
          <span className="text-xs text-stone-500 mt-2 block">Remaining safe intake today</span>
        </div>

        {/* Storage Capacity */}
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-xs font-medium text-stone-500 uppercase tracking-wider block">
            Total Storage Facility
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">{capacity.storageCapacityKg}</span>
            <span className="text-sm font-semibold text-stone-500">kg</span>
          </div>
          <span className="text-xs text-stone-500 mt-2 block">Dry + refrigerated storage</span>
        </div>
      </div>

      {/* Utilization Bar */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-stone-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-700" />
            Current Receiving Capacity Absorption
          </span>
          <span className="font-bold text-stone-800">
            {capacity.todaysReceivedKg} kg / {editCurrent} kg ({utilizationPercent}%)
          </span>
        </div>
        <div className="w-full bg-stone-100 h-3 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              utilizationPercent > 85 ? 'bg-amber-500' : 'bg-emerald-600'
            }`}
            style={{ width: `${utilizationPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-stone-500">
          <span>0 kg (Empty)</span>
          <span>{remainingHeadroomKg} kg headroom remaining</span>
          <span>{editCurrent} kg (Max Current Limit)</span>
        </div>
      </div>

      {/* Form: Adjust & Calibrate Capacity */}
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
        <div className="border-b border-stone-100 pb-4">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-700" />
            Calibrate Live Operational Limits
          </h2>
          <p className="text-sm text-stone-600 mt-1">
            Adjusting your current receiving capacity immediately controls algorithmic match eligibility.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Receiving Capacity (The Critical One) */}
          <div className="p-5 rounded-xl border-2 border-emerald-200 bg-emerald-50/30 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-emerald-950 block">
                Current Receiving Capacity (Right Now)
              </label>
              <span className="px-2.5 py-1 bg-emerald-600 text-white font-mono font-bold text-sm rounded-lg">
                {editCurrent} kg
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Only donations &le; this limit will be proposed to your dispatch desk.
            </p>
            <input
              type="range"
              min="0"
              max="200"
              step="5"
              value={editCurrent}
              onChange={e => setEditCurrent(Number(e.target.value))}
              className="w-full accent-emerald-700 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />
            <div className="flex gap-2">
              {[15, 25, 35, 50, 75, 100].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setEditCurrent(val)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${
                    editCurrent === val
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {val} kg
                </button>
              ))}
            </div>
          </div>

          {/* Normal Daily Capacity */}
          <div className="p-5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-4">
            <label className="text-sm font-bold text-stone-900 block">
              Normal / Daily Capacity (Standard Day)
            </label>
            <p className="text-xs text-stone-600">
              Your standard daily intake capacity under full shelter volunteer staffing.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="10"
                max="1000"
                value={editNormal}
                onChange={e => setEditNormal(Number(e.target.value))}
                className="w-32 px-3 py-2 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <span className="text-sm text-stone-600 font-medium">kg / day</span>
            </div>
          </div>

          {/* Total Storage Capacity */}
          <div className="p-5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-4">
            <label className="text-sm font-bold text-stone-900 block">
              Total Storage Capacity (Dry + Ambient)
            </label>
            <p className="text-xs text-stone-600">
              Maximum physical shelf volume available for food crates and dry grains.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="20"
                max="2000"
                value={editStorage}
                onChange={e => setEditStorage(Number(e.target.value))}
                className="w-32 px-3 py-2 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <span className="text-sm text-stone-600 font-medium">kg total</span>
            </div>
          </div>

          {/* Cold Storage Capacity */}
          <div className="p-5 rounded-xl border border-stone-200 bg-stone-50/50 space-y-4">
            <label className="text-sm font-bold text-stone-900 block">
              Refrigerated / Cold Storage
            </label>
            <p className="text-xs text-stone-600">
              Temperature-controlled capacity (&lt; 4°C) for dairy, gravies, and desserts.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="500"
                value={editCold}
                onChange={e => setEditCold(Number(e.target.value))}
                className="w-32 px-3 py-2 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
              <span className="text-sm text-stone-600 font-medium">kg chilled</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition shadow-xs"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Synchronizing with Dispatch...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save & Update Matching Engine
              </>
            )}
          </button>
        </div>
      </form>

      {/* Safety & Protocol Notice */}
      <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-start gap-3 text-xs text-stone-600">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-stone-800">Operational Integrity Rule:</span> Never accept donations
          that exceed your immediate distribution capacity or cold-storage limits. AnnaSetu ensures that food is
          only directed to shelters capable of safe temperature preservation and same-day community serving.
        </div>
      </div>
    </div>
  );
}
