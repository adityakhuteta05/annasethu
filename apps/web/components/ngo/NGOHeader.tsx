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
    <header className="sticky top-0 z-30 bg-[#f7f1e3]/95 dark:bg-[#14171a]/95 backdrop-blur-md border-b border-[#e5dec9] dark:border-[#2d3239] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand & NGO Name */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/ngo/dashboard"
            className="flex items-center gap-2.5 group focus-visible:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2d6a4f] text-[#f7f1e3] flex items-center justify-center font-heading font-black text-xl shadow-xs group-hover:bg-[#1b4332] transition-all">
              अ
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-bold text-base tracking-tight text-[#1f4d36] dark:text-[#f7f1e3] block leading-tight">
                AnnaSetu
              </span>
              <span className="text-[10px] tracking-wider uppercase text-[#2d6a4f] font-semibold">
                NGO / Receiver Console
              </span>
            </div>
          </Link>

          <div className="h-6 w-px bg-[#e5dec9] dark:bg-[#2d3239] mx-1 hidden md:block" />

          {/* Current Establishment */}
          <div className="min-w-0 hidden md:block">
            <span className="text-xs font-semibold text-[#23262b] dark:text-[#f7f1e3] truncate block max-w-[200px] lg:max-w-xs">
              {resolvedName}
            </span>
            <Link
              href="/ngo/verification"
              className="inline-flex items-center gap-1 text-[11px] text-[#2d6a4f] hover:underline font-semibold focus-visible:outline-none"
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
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2d6a4f] hover:bg-[#1b4332] text-[#f7f1e3] text-xs font-bold shadow-xs transition-colors"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span>+ Create Food Need</span>
          </Link>

          {/* Available Food Marketplace Link */}
          <Link
            href="/ngo/available-food"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#2d6a4f] text-[#2d6a4f] text-xs font-bold hover:bg-[#2d6a4f]/10 transition-colors"
          >
            <span>View Available Food</span>
          </Link>

          {/* Wallet Balance Badge */}
          <Link
            href="/ngo/wallet"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] text-xs font-bold text-[#1f4d36] hover:bg-[#f7f1e3] transition-colors"
          >
            <Wallet className="w-3.5 h-3.5 text-[#2d6a4f]" />
            <span>₹4,630</span>
          </Link>

          {/* Notifications */}
          <Link
            href="/ngo/notifications"
            className="relative p-2 rounded-xl text-[#5c6068] hover:text-[#1f4d36] hover:bg-white dark:hover:bg-[#1c2024] border border-transparent hover:border-[#e5dec9] transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            )}
          </Link>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-xl border border-[#e5dec9] dark:border-[#2d3239] hover:bg-white dark:hover:bg-[#1c2024] transition-colors"
            >
              <div className="w-7 h-7 rounded-lg bg-[#2d6a4f]/15 text-[#2d6a4f] flex items-center justify-center font-bold text-xs">
                🤝
              </div>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#1c2024] border border-[#e5dec9] dark:border-[#2d3239] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-[#e5dec9] dark:border-[#2d3239] mb-1">
                  <div className="text-xs font-bold text-[#1f4d36] dark:text-[#f7f1e3] truncate">
                    {resolvedName}
                  </div>
                  <div className="text-[11px] text-[#5c6068]">Role: NGO / Receiver</div>
                </div>

                <Link
                  href="/ngo/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#23262b] dark:text-[#f7f1e3] hover:bg-[#f7f1e3] dark:hover:bg-zinc-800 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#5c6068]" />
                  <span>Organization Profile</span>
                </Link>

                <Link
                  href="/ngo/capacity"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#23262b] dark:text-[#f7f1e3] hover:bg-[#f7f1e3] dark:hover:bg-zinc-800 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-[#5c6068]" />
                  <span>Capacity Controls</span>
                </Link>

                <Link
                  href="/ngo/verification"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-[#23262b] dark:text-[#f7f1e3] hover:bg-[#f7f1e3] dark:hover:bg-zinc-800 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Verification Status</span>
                </Link>

                <div className="h-px bg-[#e5dec9] dark:bg-[#2d3239] my-1" />

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
