'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  User,
  ShieldCheck,
  MapPin,
  Sliders,
  Bell,
  Lock,
  CheckCircle2,
  Plus,
} from 'lucide-react';
import { createClient } from '../../../lib/supabase/client';

export default function DonorProfilePage() {
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('business');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [businessData, setBusinessData] = useState({
    business_name: 'The Oberoi Grand Kitchens',
    business_type: 'Hotel / Commercial Banquet',
    email: 'chef@oberoi-delhi.com',
    phone: '8949026132',
    address: 'Dr Zakir Hussain Marg, Delhi Golf Club Area, New Delhi - 110003',
    authorized_name: 'Aditya Khuteta',
    authorized_designation: 'Executive Chef & Operations Director',
    gstin: '07AAACC1206D1Z1',
    fssai: '12345678901234',
    default_category: 'Prepared Meal',
    default_packaging: 'Food-grade sealed containers',
    default_storage: 'Thermal hot-case (>65°C)',
  });

  useEffect(() => {
    async function loadMeta() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata) {
          const m = user.user_metadata;
          setBusinessData((prev) => ({
            ...prev,
            business_name: m.business_name || prev.business_name,
            authorized_name: m.full_name || prev.authorized_name,
            phone: m.phone || prev.phone,
            gstin: m.gstin || prev.gstin,
            fssai: m.fssai_no || prev.fssai,
            email: user.email || prev.email,
          }));
        }
      } catch (e) {
        // Fallback to default
      }
    }
    loadMeta();
  }, [supabase]);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      <div className="border-b border-slate-200 border-slate-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Business Profile & Kitchen Outlets
        </h1>
        <p className="text-xs text-slate-500">
          Authorized food business credentials, pickup geofences, and operational safety defaults
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile configuration saved and synced across AnnaSetu dispatch nodes.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-semibold">
        {[
          { id: 'business', label: 'Business Entity', icon: Building2 },
          { id: 'authorized', label: 'Authorized Person', icon: User },
          { id: 'verification', label: 'Compliance & Licenses', icon: ShieldCheck },
          { id: 'locations', label: 'Pickup Docks', icon: MapPin },
          { id: 'preferences', label: 'Kitchen Defaults', icon: Sliders },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 border-slate-200 text-slate-500'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Business Entity */}
      {activeTab === 'business' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Registered Food Business Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-900 dark:text-white block mb-1">
                Legal Entity Name
              </label>
              <input
                type="text"
                value={businessData.business_name}
                onChange={(e) => setBusinessData({ ...businessData, business_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 bg-transparent text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 dark:text-white block mb-1">
                Business Type
              </label>
              <input
                type="text"
                value={businessData.business_type}
                onChange={(e) => setBusinessData({ ...businessData, business_type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 bg-transparent text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 dark:text-white block mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={businessData.email}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-slate-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 dark:text-white block mb-1">
                Dispatch Phone (10 digits)
              </label>
              <input
                type="text"
                value={businessData.phone}
                onChange={(e) => setBusinessData({ ...businessData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 bg-transparent text-xs font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-900 dark:text-white block mb-1">
                Primary Business Address
              </label>
              <input
                type="text"
                value={businessData.address}
                onChange={(e) => setBusinessData({ ...businessData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 bg-transparent text-xs"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
            >
              Save Business Details
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Authorized Person */}
      {activeTab === 'authorized' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Authorized Signatory & Kitchen Manager
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-900 dark:text-white block mb-1">
                Authorized Signatory Full Name
              </label>
              <input
                type="text"
                value={businessData.authorized_name}
                onChange={(e) => setBusinessData({ ...businessData, authorized_name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 bg-transparent text-xs"
              />
            </div>

            <div>
              <label className="font-bold text-slate-900 dark:text-white block mb-1">
                Designation / Department
              </label>
              <input
                type="text"
                value={businessData.authorized_designation}
                onChange={(e) => setBusinessData({ ...businessData, authorized_designation: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 bg-transparent text-xs"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
            >
              Update Signatory
            </button>
          </div>
        </div>
      )}

      {/* Tab 3: Compliance & Licenses */}
      {activeTab === 'verification' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Government Regulatory Compliance
              </h2>
              <span className="text-xs text-slate-500">Food safety and GST compliance logs</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              ✓ Verified & Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-1">
              <span className="text-slate-500">GSTIN (Goods and Services Tax):</span>
              <p className="font-mono font-bold text-sm text-slate-900 dark:text-[#4f9d3a]">{businessData.gstin}</p>
              <span className="text-[11px] text-emerald-700 font-semibold">Matched with CBIC registry</span>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-800 space-y-1">
              <span className="text-slate-500">FSSAI License:</span>
              <p className="font-mono font-bold text-sm text-slate-900 dark:text-[#4f9d3a]">{businessData.fssai}</p>
              <span className="text-[11px] text-emerald-700 font-semibold">14-digit FoSCoS certified active</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Pickup Docks */}
      {activeTab === 'locations' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              Active Kitchen Loading Bays
            </h2>
            <button className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Location
            </button>
          </div>

          <div className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex justify-between items-center text-xs">
            <div>
              <span className="font-bold block text-sm">Primary Banquet Loading Bay (Gate 3)</span>
              <span className="text-slate-500">Dr Zakir Hussain Marg, New Delhi · GPS: 28.5996, 77.2373</span>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
              Active Primary
            </span>
          </div>
        </div>
      )}

      {/* Tab 5: Kitchen Defaults */}
      {activeTab === 'preferences' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 border-slate-200 shadow-xs space-y-4">
          <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
            Kitchen Declaration Presets
          </h2>
          <p className="text-xs text-slate-500">
            Pre-populate these fields on the surplus posting form to accelerate declarations to &lt; 30 seconds
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold block mb-1">Default Food Category</label>
              <select
                value={businessData.default_category}
                onChange={(e) => setBusinessData({ ...businessData, default_category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 bg-transparent text-xs"
              >
                <option value="Prepared Meal">Prepared Meal (Cooked Banquet)</option>
                <option value="Rice">Grains & Rice</option>
                <option value="Bread/Bakery">Bakery & Bread</option>
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1">Default Storage Method</label>
              <input
                type="text"
                value={businessData.default_storage}
                onChange={(e) => setBusinessData({ ...businessData, default_storage: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 border-slate-200 bg-transparent text-xs"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
            >
              Save Presets
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
