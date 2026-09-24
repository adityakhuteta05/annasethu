'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  HeartHandshake,
  Truck
} from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

export default function LogoutPage() {
  const router = useRouter();
  const supabase = createClient();
  const [signedOut, setSignedOut] = useState(false);

  useEffect(() => {
    async function performLogout() {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Signout error:', err);
      } finally {
        setSignedOut(true);
      }
    }
    performLogout();
  }, [supabase]);

  return (
    <main className="min-h-screen flex flex-col justify-between p-4 sm:p-6 lg:p-8 bg-[#fdfbf7] dark:bg-[#121417] text-[#23262b] dark:text-[#f7f1e3]">
      {/* Top Header */}
      <header className="max-w-5xl w-full mx-auto flex items-center justify-between py-4">
        <Link href="/login" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-[#1f4d36] text-[#f7f1e3] flex items-center justify-center font-heading text-2xl font-bold shadow-md group-hover:scale-105 transition-transform">
            अ
          </div>
          <div>
            <span className="font-heading font-bold text-2xl tracking-tight text-[#1f4d36] dark:text-[#f7f1e3]">
              ANNASETU
            </span>
            <span className="text-[11px] font-sans font-semibold text-[#5c6068] dark:text-[#a0a5ad] block -mt-1 tracking-wide">
              Surplus Food · Shared With Purpose · Real Impact
            </span>
          </div>
        </Link>
      </header>

      {/* Center Signout Confirmation Card */}
      <div className="max-w-2xl w-full mx-auto my-auto py-8 space-y-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white dark:bg-[#1c2024] rounded-3xl border-2 border-[#e5dec9] dark:border-[#2d3239] p-8 sm:p-10 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 mx-auto flex items-center justify-center font-black">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              Session Terminated Securely
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[#1f4d36] dark:text-[#f7f1e3]">
              Signed Out Successfully
            </h1>
            <p className="text-xs sm:text-sm text-[#5c6068] dark:text-[#a0a5ad] max-w-md mx-auto leading-relaxed">
              Your active dashboard session has ended. To resume rescue operations, choose an operational role below:
            </p>
          </div>

          {/* 3 Role Selection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-left">
            {/* Donor */}
            <Link
              href="/login?role=donor"
              className="p-4 rounded-2xl border border-[#e5dec9] dark:border-[#2d3239] bg-[#fbf9f4] dark:bg-[#14171a] hover:border-[#1f4d36] dark:hover:border-emerald-600 hover:shadow-md transition group flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl block mb-2">🍽️</span>
                <span className="font-heading font-bold text-sm text-[#1f4d36] dark:text-[#f7f1e3] block group-hover:text-emerald-600">
                  Donor
                </span>
                <span className="text-[11px] text-[#5c6068] dark:text-[#a0a5ad] mt-1 block">
                  Hotels & Banquets
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#1f4d36] dark:text-emerald-400 mt-4 flex items-center gap-1">
                Log in &rarr;
              </span>
            </Link>

            {/* NGO */}
            <Link
              href="/login?role=ngo"
              className="p-4 rounded-2xl border border-[#e5dec9] dark:border-[#2d3239] bg-[#fbf9f4] dark:bg-[#14171a] hover:border-[#2d6a4f] dark:hover:border-emerald-600 hover:shadow-md transition group flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl block mb-2">🏠</span>
                <span className="font-heading font-bold text-sm text-[#1f4d36] dark:text-[#f7f1e3] block group-hover:text-emerald-600">
                  NGO / Receiver
                </span>
                <span className="text-[11px] text-[#5c6068] dark:text-[#a0a5ad] mt-1 block">
                  Shelters & Trusts
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#2d6a4f] dark:text-emerald-400 mt-4 flex items-center gap-1">
                Log in &rarr;
              </span>
            </Link>

            {/* Driver */}
            <Link
              href="/login?role=driver"
              className="p-4 rounded-2xl border border-[#e5dec9] dark:border-[#2d3239] bg-[#fbf9f4] dark:bg-[#14171a] hover:border-[#e0662b] dark:hover:border-orange-500 hover:shadow-md transition group flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl block mb-2">🚚</span>
                <span className="font-heading font-bold text-sm text-[#1f4d36] dark:text-[#f7f1e3] block group-hover:text-orange-500">
                  Delivery Partner
                </span>
                <span className="text-[11px] text-[#5c6068] dark:text-[#a0a5ad] mt-1 block">
                  Transit & Dispatch
                </span>
              </div>
              <span className="text-[10px] font-bold text-[#e0662b] dark:text-orange-400 mt-4 flex items-center gap-1">
                Log in &rarr;
              </span>
            </Link>
          </div>

          <div className="pt-4 border-t border-[#e5dec9] dark:border-[#2d3239]">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#1f4d36] hover:bg-[#163827] text-[#f7f1e3] font-bold text-xs shadow-md transition"
            >
              <span>Return to Unified Login Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      <footer className="max-w-5xl w-full mx-auto py-4 text-center text-xs text-[#5c6068] dark:text-[#a0a5ad]">
        AnnaSetu Platform · Unified Role Security System
      </footer>
    </main>
  );
}
