'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/navigation';
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
      <header className="sticky top-0 z-30 bg-[#f7f1e3]/95 dark:bg-[#14171a]/95 backdrop-blur-md border-b border-[#e5dec9] dark:border-[#2d3239] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Brand & Business Name */}
          <div className="flex items-center gap-3 min-w-0">
            <a
              href="/donor/dashboard"
              className="flex items-center gap-2.5 group focus-visible:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1f4d36] text-[#f7f1e3] flex items-center justify-center font-heading font-black text-xl shadow-xs group-hover:bg-[#163827] transition-all">
                अ
              </div>
              <div className="hidden sm:block">
                <span className="font-heading font-bold text-base tracking-tight text-[#1f4d36] dark:text-[#f7f1e3] block leading-tight">
                  AnnaSetu
                </span>
                <span className="text-[10px] tracking-wider uppercase text-[#5c6068] dark:text-[#a0a5ad] font-semibold">
                  Donor Logistics
                </span>
              </div>
            </a>

            <div className="h-6 w-px bg-[#e5dec9] dark:bg-[#2d3239] mx-1 hidden md:block" />

            {/* Current Establishment */}
            <div className="min-w-0 hidden md:block">
              <span className="text-xs font-semibold text-[#23262b] dark:text-[#f7f1e3] truncate block max-w-[200px] lg:max-w-xs">
                {resolvedName}
              </span>
              <button
                onClick={() => setShowVerifyModal(true)}
                className="inline-flex items-center gap-1 text-[11px] text-[#4f9d3a] hover:underline font-semibold focus-visible:outline-none"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Donor (GSTIN & FSSAI Active)</span>
              </button>
            </div>
          </div>

          {/* Right: Actions & User Navigation */}
          <div className="flex items-center gap-3">
            
            {/* Primary CTA: + POST SURPLUS FOOD */}
            <a
              href="/donor/donations/new"
              className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#1f4d36] hover:bg-[#163827] text-[#f7f1e3] font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f4d36]"
            >
              <PlusCircle className="w-4 h-4" />
              <span>POST SURPLUS FOOD</span>
            </a>

            {/* Notification Bell */}
            <a
              href="/donor/notifications"
              className="relative p-2 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#1f4d36] dark:hover:text-[#f7f1e3] hover:bg-white dark:hover:bg-[#1c2024] transition-colors focus-visible:outline-none"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#e0662b] text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                  {unreadNotifications}
                </span>
              )}
            </a>

            {/* User Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] bg-white dark:bg-[#1c2024] hover:bg-[#f7f1e3] dark:hover:bg-[#23262b] transition-colors focus-visible:outline-none"
              >
                <div className="w-7 h-7 rounded-lg bg-[#4f9d3a]/20 text-[#1f4d36] dark:text-[#4f9d3a] flex items-center justify-center font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                </div>
              </button>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-lg py-2 z-50 text-xs">
                    <div className="px-4 py-2 border-b border-[#e5dec9] dark:border-[#2d3239]">
                      <span className="font-bold text-[#23262b] dark:text-[#f7f1e3] block truncate">
                        {resolvedName}
                      </span>
                      <span className="text-[#5c6068] text-[11px]">Food Donor Account</span>
                    </div>

                    <a
                      href="/donor/profile"
                      className="flex items-center gap-2 px-4 py-2.5 text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#1f4d36] hover:bg-[#f7f1e3] dark:hover:bg-[#23262b]"
                    >
                      <User className="w-4 h-4" />
                      <span>Business Profile & Outlets</span>
                    </a>

                    <a
                      href="/donor/subscription"
                      className="flex items-center gap-2 px-4 py-2.5 text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#1f4d36] hover:bg-[#f7f1e3] dark:hover:bg-[#23262b]"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Subscription & Plan</span>
                    </a>

                    <a
                      href="/donor/support"
                      className="flex items-center gap-2 px-4 py-2.5 text-[#5c6068] dark:text-[#a0a5ad] hover:text-[#1f4d36] hover:bg-[#f7f1e3] dark:hover:bg-[#23262b]"
                    >
                      <HelpCircle className="w-4 h-4" />
                      <span>Support & Incident Reports</span>
                    </a>

                    <div className="border-t border-[#e5dec9] dark:border-[#2d3239] mt-1 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-semibold"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-[#1c2024] max-w-md w-full rounded-3xl p-6 border border-[#e5dec9] dark:border-[#2d3239] shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#e5dec9] dark:border-[#2d3239] pb-3">
              <div className="flex items-center gap-2 text-[#1f4d36] dark:text-[#4f9d3a]">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-heading font-bold text-base">Verified Food Establishment</h3>
              </div>
              <button
                onClick={() => setShowVerifyModal(false)}
                className="text-xs text-[#5c6068] hover:text-[#23262b]"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Authority Tier 1 Active</span>
                </div>
                <p className="text-[11px] opacity-90">
                  Business registration, GSTIN, and FSSAI credentials have been audited and cryptographically locked.
                </p>
              </div>

              <div className="space-y-2 py-1">
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-[#5c6068]">Business Entity:</span>
                  <span className="font-semibold text-[#23262b] dark:text-[#f7f1e3]">{resolvedName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-[#5c6068]">GSTIN Status:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">07AAACC1206D1Z1 · Validated</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-[#5c6068]">FSSAI License:</span>
                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">12345678901234 · Active</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#5c6068]">Pickup Address:</span>
                  <span className="font-semibold text-right text-[#23262b] dark:text-[#f7f1e3]">Primary Central Kitchen Loading Dock</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowVerifyModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#1f4d36] text-[#f7f1e3] font-semibold text-xs hover:bg-[#163827]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
