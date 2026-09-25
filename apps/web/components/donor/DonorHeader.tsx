'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ShieldCheck,
  Bell,
  PlusCircle,
  LogOut,
  User,
  Settings,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

interface DonorHeaderProps {
  businessName?: string;
  verificationStatus?: string;
  unreadNotifications?: number;
}

export function DonorHeader({
  businessName = 'The Oberoi Grand Kitchens',
  verificationStatus = 'VERIFIED',
  unreadNotifications = 3,
}: DonorHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [profileOpen, setProfileOpen] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [resolvedName, setResolvedName] = useState(businessName);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.business_name) {
          setResolvedName(user.user_metadata.business_name);
        } else if (user?.user_metadata?.full_name) {
          setResolvedName(user.user_metadata.full_name);
        }
      } catch (e) {
        // Fallback to default
      }
    }
    loadUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand & Business Name */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="/donor/dashboard"
              className="flex items-center gap-2.5 group focus-visible:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-xs group-hover:bg-emerald-700 transition-all">
                अ
              </div>
              <div className="hidden sm:block">
                <span className="font-bold text-base tracking-tight text-slate-900 block leading-tight">
                  AnnaSetu
                </span>
                <span className="text-[11px] tracking-wide uppercase text-slate-500 font-semibold">
                  Donor Logistics
                </span>
              </div>
            </a>

            <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block" />

            {/* Current Establishment */}
            <div className="min-w-0 hidden md:block">
              <span className="text-xs font-semibold text-slate-900 truncate block max-w-[200px] lg:max-w-xs">
                {resolvedName}
              </span>
              <button
                onClick={() => setShowVerifyModal(true)}
                className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium focus-visible:outline-none"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Donor (GSTIN & FSSAI Active)</span>
              </button>
            </div>
          </div>

          {/* Right: Actions & User Navigation */}
          <div className="flex items-center gap-3">
            
            {/* Primary CTA: + POST SURPLUS FOOD */}
            <a
              href="/donor/donations/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm shadow-xs hover:shadow-sm transition-all active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Surplus Food</span>
            </a>

            {/* Notification Bell */}
            <a
              href="/donor/notifications"
              className="relative p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors focus-visible:outline-none"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-orange-600 text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </a>

            {/* Directly Visible Sign Out Button */}
            <a
              href="/logout"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition"
              title="Sign out of Donor Dashboard"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </a>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors focus-visible:outline-none"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                </div>
              </button>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <span className="font-bold text-slate-900 block truncate">
                        {resolvedName}
                      </span>
                      <span className="text-slate-500 text-[11px]">Food Donor Account</span>
                    </div>

                    <a
                      href="/donor/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Business Profile & Outlets</span>
                    </a>

                    <a
                      href="/donor/subscription"
                      className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Subscription & Plan</span>
                    </a>

                    <a
                      href="/donor/support"
                      className="flex items-center gap-2 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    >
                      <HelpCircle className="w-4 h-4 text-slate-400" />
                      <span>Support & Help Desk</span>
                    </a>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Verification Details Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-700">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900">Verified Food Establishment</h3>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-xs text-slate-500 hover:text-slate-900 font-medium px-2 py-1 rounded-md hover:bg-slate-100"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Authority Tier 1 Active</span>
                </div>
                <p className="text-[11px] text-emerald-700">
                  Business registration, GSTIN, and FSSAI credentials have been verified and secured.
                </p>
              </div>

              <div className="space-y-2 py-1 text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Business Entity:</span>
                  <span className="font-semibold text-slate-900">{resolvedName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">GSTIN Status:</span>
                  <span className="font-mono font-bold text-emerald-700">07AAACC1206D1Z1 · Validated</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">FSSAI License:</span>
                  <span className="font-mono font-bold text-emerald-700">12345678901234 · Active</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Pickup Address:</span>
                  <span className="font-semibold text-right text-slate-900">Primary Central Kitchen Loading Dock</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowVerifyModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
