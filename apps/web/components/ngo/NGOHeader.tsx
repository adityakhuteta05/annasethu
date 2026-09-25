'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  HeartHandshake,
  ShieldCheck,
  Bell,
  PlusCircle,
  LogOut,
  User,
  Settings,
  HelpCircle,
  CheckCircle2,
  Wallet,
  Menu,
  X
} from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

interface NGOHeaderProps {
  orgName?: string;
  verificationStatus?: string;
  unreadNotifications?: number;
}

export function NGOHeader({
  orgName = 'Delhi Roti Bank Relief Foundation',
  verificationStatus = 'VERIFIED',
  unreadNotifications = 2,
}: NGOHeaderProps) {
  const router = useRouter();
  const supabase = createClient();
  const [profileOpen, setProfileOpen] = useState(false);
  const [resolvedName, setResolvedName] = useState(orgName);

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.org_name) {
          setResolvedName(user.user_metadata.org_name);
        } else if (user?.user_metadata?.display_name) {
          setResolvedName(user.user_metadata.display_name);
        }
      } catch (e) {
        // Fallback
      }
    }
    loadUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand & NGO Name */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/receiver/dashboard"
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
                NGO / Receiver Console
              </span>
            </div>
          </Link>

          <div className="h-6 w-px bg-slate-200 mx-2 hidden md:block" />

          {/* Current Establishment */}
          <div className="min-w-0 hidden md:block">
            <span className="text-xs font-semibold text-slate-900 truncate block max-w-[200px] lg:max-w-xs">
              {resolvedName}
            </span>
            <Link
              href="/ngo/verification"
              className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium focus-visible:outline-none"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Organization (80G & DARPAN Active)</span>
            </Link>
          </div>
        </div>

        {/* Right: Actions & Navigation */}
        <div className="flex items-center gap-2.5">
          {/* Create Need Quick Button */}
          <Link
            href="/ngo/needs/create"
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-emerald-100" />
            <span>+ Create Food Need</span>
          </Link>

          {/* Available Food Marketplace Link */}
          <Link
            href="/ngo/available-food"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <span>Available Surplus Food</span>
          </Link>

          {/* Wallet Balance Badge */}
          <Link
            href="/ngo/wallet"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span>₹4,630</span>
          </Link>

          {/* Notifications */}
          <Link
            href="/ngo/notifications"
            className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 transition-all"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </Link>

          {/* Directly Visible Log Out Button */}
          <Link
            href="/logout"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition"
            title="Sign out of NGO Dashboard"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors focus-visible:outline-none"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                <HeartHandshake className="w-4 h-4" />
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
                    <span className="text-slate-500 text-[11px]">Verified NGO Account</span>
                  </div>

                  <Link
                    href="/ngo/profile"
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>Organization Profile</span>
                  </Link>

                  <Link
                    href="/ngo/capacity"
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Capacity Settings</span>
                  </Link>

                  <Link
                    href="/ngo/support"
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <span>Support & Desk</span>
                  </Link>

                  <div className="border-t border-slate-100 mt-1 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold"
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
  );
}
